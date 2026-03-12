#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=3000
NEXT_URL="http://127.0.0.1:${PORT}"
NEXT_LOG="$(mktemp)"
TUNNEL_LOG="$(mktemp)"
NEXT_PID=""
TUNNEL_PID=""
STARTED_NEXT=0

cleanup() {
  if [[ -n "${TUNNEL_PID}" ]] && kill -0 "${TUNNEL_PID}" 2>/dev/null; then
    kill "${TUNNEL_PID}" 2>/dev/null || true
    wait "${TUNNEL_PID}" 2>/dev/null || true
  fi

  if [[ "${STARTED_NEXT}" -eq 1 ]] && [[ -n "${NEXT_PID}" ]] && kill -0 "${NEXT_PID}" 2>/dev/null; then
    kill "${NEXT_PID}" 2>/dev/null || true
    wait "${NEXT_PID}" 2>/dev/null || true
  fi

  rm -f "${NEXT_LOG}" "${TUNNEL_LOG}"
}

trap cleanup EXIT INT TERM

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

install_cloudflared() {
  if command -v cloudflared >/dev/null 2>&1; then
    echo "cloudflared already installed."
    return
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    echo "cloudflared is not installed and automatic install only supports apt-get systems." >&2
    exit 1
  fi

  echo "Installing cloudflared..."
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
    | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
  echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main" \
    > /etc/apt/sources.list.d/cloudflared.list
  apt-get update
  apt-get install -y cloudflared
}

ensure_repo_root() {
  if [[ ! -f "${ROOT_DIR}/package.json" ]]; then
    echo "package.json not found in ${ROOT_DIR}" >&2
    exit 1
  fi
}

port_in_use() {
  ss -ltn "( sport = :${PORT} )" | tail -n +2 | grep -q ":${PORT}"
}

is_repo_next_running() {
  pgrep -af "next dev" | grep -q "${ROOT_DIR}"
}

start_next() {
  if port_in_use; then
    if is_repo_next_running; then
      echo "Next.js dev server already running on port ${PORT}; reusing it."
      return
    fi

    echo "Port ${PORT} is already in use by another process. Free it and rerun." >&2
    exit 1
  fi

  echo "Starting Next.js dev server on port ${PORT}..."
  (
    cd "${ROOT_DIR}"
    npm run dev >"${NEXT_LOG}" 2>&1
  ) &
  NEXT_PID=$!
  STARTED_NEXT=1
}

wait_for_next() {
  echo "Waiting for local server..."
  for _ in $(seq 1 90); do
    if curl -fsS "${NEXT_URL}" >/dev/null 2>&1; then
      echo "Local server ready at ${NEXT_URL}"
      return
    fi

    if [[ "${STARTED_NEXT}" -eq 1 ]] && ! kill -0 "${NEXT_PID}" 2>/dev/null; then
      echo "Next.js server exited before becoming ready." >&2
      cat "${NEXT_LOG}" >&2
      exit 1
    fi

    sleep 1
  done

  echo "Timed out waiting for Next.js server on ${NEXT_URL}" >&2
  [[ -f "${NEXT_LOG}" ]] && cat "${NEXT_LOG}" >&2
  exit 1
}

start_tunnel() {
  echo "Starting Cloudflare quick tunnel..."
  cloudflared tunnel --url "${NEXT_URL}" >"${TUNNEL_LOG}" 2>&1 &
  TUNNEL_PID=$!
}

wait_for_tunnel_url() {
  echo "Waiting for public URL..."
  for _ in $(seq 1 90); do
    if ! kill -0 "${TUNNEL_PID}" 2>/dev/null; then
      echo "cloudflared exited before creating a tunnel." >&2
      cat "${TUNNEL_LOG}" >&2
      exit 1
    fi

    url="$(grep -Eo 'https://[-a-z0-9]+\.trycloudflare\.com' "${TUNNEL_LOG}" | head -n 1 || true)"
    if [[ -n "${url}" ]]; then
      echo
      echo "Public URL: ${url}"
      echo "Local URL:  ${NEXT_URL}"
      echo
      return
    fi

    sleep 1
  done

  echo "Timed out waiting for a Cloudflare quick tunnel URL." >&2
  cat "${TUNNEL_LOG}" >&2
  exit 1
}

stream_logs() {
  echo "Press Ctrl+C to stop the local server and tunnel."
  tail --pid="${TUNNEL_PID}" -f "${TUNNEL_LOG}" &
  local tail_pid=$!
  wait "${TUNNEL_PID}" || true
  kill "${tail_pid}" 2>/dev/null || true
}

main() {
  require_command curl
  require_command grep
  require_command sed
  require_command awk
  require_command ss
  require_command npm
  ensure_repo_root
  install_cloudflared
  start_next
  wait_for_next
  start_tunnel
  wait_for_tunnel_url
  stream_logs
}

main "$@"

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/auth/otp-form.module.css";

const EMAIL_ERROR = "Enter a valid email address.";
const OTP_ERROR = "Enter the six-digit OTP code.";
const GENERIC_ERROR = "Something went wrong. Try again.";

export default function OtpForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    "Sign in with your email and we will send a one-time code.",
  );
  const [error, setError] = useState("");
  const router = useRouter();

  const requestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError(EMAIL_ERROR);
      return;
    }

    setError("");
    setLoading(true);
    setMessage("Sending code...");
    const response = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError((payload as { error?: string }).error || GENERIC_ERROR);
      setMessage("Sign in with your email and we will send a one-time code.");
      return;
    }

    setMessage("OTP sent. Paste the 6-digit code below.");
    setPhase("verify");
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim().length !== 6) {
      setError(OTP_ERROR);
      return;
    }

    setError("");
    setLoading(true);
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), token: code.trim() }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError((payload as { error?: string }).error || GENERIC_ERROR);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className={styles.form}>
      {phase === "request" ? (
        <form onSubmit={requestOtp} className={styles.section}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
            disabled={loading}
            required
          />
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className={styles.section}>
          <p className={styles.hint}>Code sent to {email}</p>
          <label htmlFor="otp" className={styles.label}>
            OTP
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={styles.input}
            disabled={loading}
            required
          />
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Verifying..." : "Verify and Enter"}
          </button>
          <button type="button" className={styles.ghostButton} onClick={() => setPhase("request")}>
            Change email
          </button>
        </form>
      )}
      <p className={styles.status}>{message}</p>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

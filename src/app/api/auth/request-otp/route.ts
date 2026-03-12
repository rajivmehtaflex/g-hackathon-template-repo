import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RequestBody = {
  email?: string;
};

export async function POST(request: Request) {
  const { email } = (await request.json()) as RequestBody;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Provide a valid email address." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabasePublic } from "@/lib/supabasePublic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, message } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
    return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
  }
  if (typeof phone !== "string" || phone.trim().length === 0 || phone.length > 40) {
    return NextResponse.json({ error: "Please provide your phone number." }, { status: 400 });
  }
  if (typeof email === "string" && email.trim().length > 0 && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }
  if (typeof message !== "string" || message.trim().length === 0 || message.length > 5000) {
    return NextResponse.json({ error: "Please provide a message." }, { status: 400 });
  }
  const cleanEmail =
    typeof email === "string" && email.trim().length > 0 ? email.trim().slice(0, 320) : null;
  const cleanPhone = phone.trim().slice(0, 40);

  const { error } = await supabasePublic.from("contact_submissions").insert({
    name: name.trim().slice(0, 200),
    email: cleanEmail,
    phone: cleanPhone,
    message: message.trim().slice(0, 5000),
  });

  if (error) {
    return NextResponse.json({ error: "Could not save your message." }, { status: 500 });
  }

  // Best-effort email notification — do not fail the request if this errors,
  // the message is already saved above.
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (resendApiKey && notifyEmail) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Website Contact Form <onboarding@resend.dev>",
        to: notifyEmail,
        ...(cleanEmail ? { replyTo: cleanEmail } : {}),
        subject: `New contact form message from ${name}`,
        text: `Name: ${name}\nEmail: ${cleanEmail ?? "-"}\nPhone: ${cleanPhone}\n\n${message}`,
      });
    } catch (err) {
      console.error("Failed to send contact notification email", err);
    }
  }

  return NextResponse.json({ ok: true });
}

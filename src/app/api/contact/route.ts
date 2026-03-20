import { Resend } from "resend";
import { NextResponse } from "next/server";

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("Resend API Key not configured.");
}

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!resend) {
      console.log("Mocking email send:", { name, email, message });
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1000));
      return NextResponse.json({ success: true });
    }

    const data = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // Resend testing domain
      to: "manish.anandaeswaran@gmail.com",
      replyTo: email,
      subject: `New message from ${name} via portfolio`,
      text: `${name} (${email}) wrote:\n\n${message}`,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

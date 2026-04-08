import { config } from "@/data/config";
import nodemailer from "nodemailer";
import { z } from "zod";

const Email = z.object({
  fullName: z.string().min(2, "Full name is invalid!"),
  email: z.string().email({ message: "Email is invalid!" }),
  message: z.string().min(10, "Message is too short!"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);

    const {
      success: zodSuccess,
      data: zodData,
      error: zodError,
    } = Email.safeParse(body);

    if (!zodSuccess)
      return Response.json({ error: zodError?.message }, { status: 400 });

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: config.email,
      subject: `Portfolio Contact from ${zodData.fullName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${zodData.fullName}</p>
        <p><strong>Email:</strong> ${zodData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${zodData.message.replace(/\n/g, "<br>")}</p>
      `,
      replyTo: zodData.email,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("Email error:", error);
    return Response.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 },
    );
  }
}

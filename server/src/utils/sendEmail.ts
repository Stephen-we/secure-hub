import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // true for Gmail (465)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
    return false;
  }
}

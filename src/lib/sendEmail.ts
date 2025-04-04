"use server";
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!to || !to.includes("@")) {
    throw new Error("Invalid email address");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_USER || "",
      pass: process.env.NODEMAILER_PASSWORD || "",
    },
  });

  await transporter.sendMail({
    from: process.env.NODEMAILER_USER,
    to,
    subject,
    html,
  });
}

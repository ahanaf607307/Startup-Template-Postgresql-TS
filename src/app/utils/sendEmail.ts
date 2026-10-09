import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { envVars } from "../config/env.js";
import DevBuildError from "../lib/DevBuildError.js";


// Needed because __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//         MAIL TRANSPORTER  

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
});

// SEND EMAIL      

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData = {},
  attachments = [],
}: {
  to: string | string[];
  subject: string;
  templateName: string;
  templateData?: any;
  attachments?: any[];
}) => {
  try {
    const templatePath = path.join(
      __dirname,
      "template",
      `${templateName}.ejs`
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info: any = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html: html as string,
      attachments: attachments?.map((file: any) => ({
        filename: file.filename,
        content: file.content as any,
        contentType: file.contentType,
      })) as any,
    });

    console.log(`📧 Email sent to ${to} | ID: ${info.messageId}`);
  } catch (error: any) {
    console.error("❌ Email sending failed:", error?.message || error);
    if (envVars.NODE_ENV === "production") {
      throw new DevBuildError("Failed to send email", 500);
    }
    console.log("⚠️ Email sending skipped in development.");
  }
};

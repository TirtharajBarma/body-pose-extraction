import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const sendBackupEmail = async (attachmentPath, fileName) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const timestamp = new Date().toISOString().split('T')[0];

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `Daily DB Backup - ${timestamp}`,
      text: `Backup completed successfully on ${timestamp}.\n\nThe backup ZIP file is attached to this email.`,
      html: `
        <h2>Daily Database Backup</h2>
        <p>Backup completed successfully on <strong>${timestamp}</strong>.</p>
        <p>The backup ZIP file is attached to this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated backup notification from Pose Extraction Backend System.
        </p>
      `,
      attachments: [
        {
          filename: fileName,
          path: attachmentPath
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

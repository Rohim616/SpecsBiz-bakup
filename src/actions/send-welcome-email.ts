
'use server';

import nodemailer from 'nodemailer';

/**
 * @fileOverview Server Action to send an official welcome email to new users.
 * Uses English text and formal 'Sir' style addressing.
 */

export async function sendWelcomeEmail(toEmail: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'specsxr@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"SpecsBiz Official" <specsxr@gmail.com>',
    to: toEmail,
    subject: 'Welcome to SpecsBiz | Your Smart Business Partner 🚀',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0f7f7; padding: 0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); background-color: #ffffff;">
        <div style="background-color: #191970; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: -1px; text-transform: uppercase;">SpecsBiz</h1>
          <p style="color: #008080; margin: 5px 0 0 0; font-weight: bold; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Smart Business Manager</p>
        </div>
        
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
          <h2 style="color: #191970; font-size: 20px; margin-bottom: 20px;">Welcome Sir,</h2>
          <p style="font-size: 15px;">Welcome to your digital business journey! We are pleased to have you join <strong>SpecsBiz</strong> as your trusted business partner.</p>
          
          <p style="font-size: 15px;">Your secure cloud account is now fully active. You can now manage your inventory, customers, and sales from anywhere in the world.</p>
          
          <div style="background-color: #f0ffff; border-left: 4px solid #008080; padding: 20px; margin: 30px 0; border-radius: 0 15px 15px 0;">
            <p style="margin: 0; font-size: 14px; color: #191970;"><strong>Quick Tips for You:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 13px; color: #555;">
              <li>Go to the Inventory page to add your first products.</li>
              <li>Use the Customers page to track your dues and baki.</li>
              <li>Share your personal shop link on social media to attract buyers.</li>
            </ul>
          </div>
          
          <p style="font-size: 15px;">For any assistance, feel free to contact our official support email. We wish your business great prosperity.</p>
          
          <p style="margin-top: 40px; font-size: 14px; color: #777;">Sincerely,<br><strong style="color: #191970;">SpecsXR Team</strong></p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">&copy; 2024 SpecsBiz by SpecsXR. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Welcome Email Error:", error.message);
    return { success: false, error: error.message };
  }
}

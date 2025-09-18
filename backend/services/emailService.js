import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    // Configure nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
      }
    });

    this.recipientEmail = 'vickykofficial890@gmail.com';
  }

  async sendContactEmail(contactData) {
    try {
      const { firstName, lastName, subject, phone, description, userEmail } = contactData;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@arcadelearn.com',
        to: this.recipientEmail,
        subject: `Contact Form: ${subject}`,
        replyTo: userEmail,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background-color: #FFF; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h3 style="color: #374151; margin-top: 0;">Message</h3>
              <p style="line-height: 1.6; color: #6B7280;">${description.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #EEF2FF; border-radius: 8px;">
              <p style="margin: 0; color: #6366F1; font-size: 14px;">
                <strong>This message was sent from the ArcadeLearn contact form.</strong>
              </p>
            </div>
          </div>
        `,
        text: `
          New Contact Form Submission
          
          Name: ${firstName} ${lastName}
          Email: ${userEmail || 'Not provided'}
          Phone: ${phone}
          Subject: ${subject}
          
          Message:
          ${description}
          
          This message was sent from the ArcadeLearn contact form.
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Contact email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Failed to send contact email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAutoReply(userEmail, userName) {
    try {
      if (!userEmail) return { success: true }; // Skip if no email provided

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@arcadelearn.com',
        to: userEmail,
        subject: 'Thank you for contacting ArcadeLearn',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">ArcadeLearn</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Interactive Programming Learning Platform</p>
            </div>
            
            <div style="padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #374151; margin-top: 0;">Thank you for reaching out!</h2>
              
              <p style="color: #6B7280; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="color: #6B7280; line-height: 1.6;">
                Thank you for contacting us! We've received your message and our support team will review it carefully.
              </p>
              
              <div style="background-color: #F0F9FF; border-left: 4px solid #0EA5E9; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #0C4A6E;">
                  <strong>What happens next?</strong><br>
                  • We'll review your message within 24 hours<br>
                  • A team member will respond to your inquiry<br>
                  • You'll receive a personalized response at this email address
                </p>
              </div>
              
              <p style="color: #6B7280; line-height: 1.6;">
                In the meantime, feel free to explore our learning platform and check out our interactive programming courses.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://arcadelearn.com" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Visit ArcadeLearn
                </a>
              </div>
              
              <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                The ArcadeLearn Support Team
              </p>
            </div>
          </div>
        `,
        text: `
          Thank you for reaching out!
          
          Hi ${userName},
          
          Thank you for contacting us! We've received your message and our support team will review it carefully.
          
          What happens next?
          • We'll review your message within 24 hours
          • A team member will respond to your inquiry
          • You'll receive a personalized response at this email address
          
          In the meantime, feel free to explore our learning platform and check out our interactive programming courses.
          
          Best regards,
          The ArcadeLearn Support Team
          
          Visit us at: https://arcadelearn.com
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Auto-reply sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Failed to send auto-reply:', error);
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return { success: true };
    } catch (error) {
      console.error('Email service connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
export default EmailService;
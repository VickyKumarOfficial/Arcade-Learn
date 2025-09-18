// Email service using EmailJS for direct email sending
import emailjs from '@emailjs/browser';

// EmailJS configuration - using real credentials from environment variables
const EMAIL_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'demo_service',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'demo_template',  
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'demo_key',
  toEmail: 'vickykofficial890@gmail.com'
};

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  phone: string;
  description: string;
  userEmail?: string;
}

// Main email service function - smart routing based on environment
export const sendContactEmail = async (formData: ContactFormData): Promise<boolean> => {
  // Check if we're in localhost development environment
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  // In localhost, try backend first if available
  if (isLocalhost) {
    try {
      console.log('🏠 Localhost detected, trying backend first...');
      const backendSuccess = await sendContactEmailViaBackend(formData);
      if (backendSuccess) {
        return true;
      }
      console.log('📧 Backend unavailable, checking EmailJS...');
    } catch (error) {
      console.log('📧 Backend failed, checking EmailJS...');
    }
  }

  // Try EmailJS (for production or when backend is unavailable)
  try {
    // Check if EmailJS is properly configured with real credentials
    if (!EMAIL_CONFIG.serviceId || EMAIL_CONFIG.serviceId === 'demo_service' ||
        !EMAIL_CONFIG.templateId || EMAIL_CONFIG.templateId === 'demo_template' ||
        !EMAIL_CONFIG.publicKey || EMAIL_CONFIG.publicKey === 'demo_key') {
      console.log('⚠️ EmailJS not properly configured (using demo credentials), falling back to mailto');
      sendContactEmailViaMailto(formData);
      return false;
    }

    // Initialize EmailJS (it's safe to call multiple times)
    emailjs.init(EMAIL_CONFIG.publicKey);

    // Prepare email template parameters
    const templateParams = {
      to_email: EMAIL_CONFIG.toEmail,
      from_name: `${formData.firstName} ${formData.lastName}`,
      from_email: formData.email,
      reply_to: formData.email,
      subject: formData.subject,
      phone: formData.phone,
      message: formData.description,
      user_name: `${formData.firstName} ${formData.lastName}`,
    };

    console.log('📧 Sending email via EmailJS...');
    console.log('📋 Template params:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Email sent successfully via EmailJS!', response);
      return true;
    } else {
      console.error('❌ EmailJS responded with error:', response);
      throw new Error(`EmailJS error: ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Error sending email via EmailJS:', error);
    
    // Check for specific EmailJS errors
    if (error?.status === 404 || error?.text?.includes('Account not found')) {
      console.log('📧 EmailJS account/service not found, falling back to mailto');
    } else if (error?.status === 400) {
      console.log('📧 EmailJS configuration error, falling back to mailto');
    } else {
      console.log('� EmailJS service error, falling back to mailto');
    }
    
    // Fall back to mailto if EmailJS fails
    console.log('📨 Opening default email client...');
    sendContactEmailViaMailto(formData);
    return false;
  }
};

// Alternative: Simple fetch-based email service (using a backend endpoint)
export const sendContactEmailViaBackend = async (formData: ContactFormData): Promise<boolean> => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    console.log('🔍 Sending email via backend:', baseUrl);
    console.log('📧 Form data:', formData);
    
    // Add timeout to prevent hanging requests in production
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${baseUrl}/contact/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        toEmail: EMAIL_CONFIG.toEmail
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email sent successfully:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Backend responded with error:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending email via backend:', error);
    return false;
  }
};

// Simple client-side email service using mailto (fallback)
export const sendContactEmailViaMailto = (formData: ContactFormData): void => {
  const subject = encodeURIComponent(`Contact Form: ${formData.subject}`);
  const body = encodeURIComponent(
    `Name: ${formData.firstName} ${formData.lastName}\n` +
    `Phone: ${formData.phone}\n` +
    `Subject: ${formData.subject}\n\n` +
    `Message:\n${formData.description}`
  );
  
  const mailtoUrl = `mailto:${EMAIL_CONFIG.toEmail}?subject=${subject}&body=${body}`;
  window.location.href = mailtoUrl;
};
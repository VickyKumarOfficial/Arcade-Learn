// Email service using backend API for contact form

// Configuration
const EMAIL_CONFIG = {
  toEmail: 'vickykofficial890@gmail.com'
};

export interface ContactFormData {
  firstName: string;
  lastName: string;
  subject: string;
  phone: string;
  description: string;
  userEmail?: string;
}

// Main email service function - uses backend API
export const sendContactEmail = async (formData: ContactFormData): Promise<boolean> => {
  return await sendContactEmailViaBackend(formData);
};

// Alternative: Simple fetch-based email service (using a backend endpoint)
export const sendContactEmailViaBackend = async (formData: ContactFormData): Promise<boolean> => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    const response = await fetch(`${baseUrl}/contact/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        toEmail: EMAIL_CONFIG.toEmail
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email via backend:', error);
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
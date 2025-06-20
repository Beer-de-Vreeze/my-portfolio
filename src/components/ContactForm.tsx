import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import Notification from './Notification';

interface ContactFormProps {
  onEmailSent?: () => void;
}

const ContactForm = ({ onEmailSent }: ContactFormProps) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    subject: '', 
    message: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });
  const maxCharLimit = 500;
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);  const validatePhone = (phone: string) => {
    // Optional phone validation - only validate if provided
    if (!phone.trim()) return true; // Empty phone is valid since it's optional
    
    // Remove all non-digit characters except + at the beginning
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
      // Check for valid phone number patterns
    const phonePatterns = [
      // International format: +1234567890 (7-15 digits after country code)
      /^\+[1-9]\d{6,14}$/,
      
      // DUTCH NUMBERS
      // Dutch mobile: +31612345678 or +316xxxxxxxx (8 digits after 6)
      /^\+316\d{8}$/,
      // Dutch landline: +31201234567 or +31xx....... (8-9 digits after area code)
      /^\+31[1-9]\d{7,8}$/,
      // Dutch mobile without country code: 06xxxxxxxx (10 digits starting with 06)
      /^06\d{8}$/,
      // Dutch landline without country code: 0xx....... (9-10 digits starting with 0, not 06)
      /^0[1-9]\d{7,8}$/,
      
      // GERMAN NUMBERS
      // German mobile: +491701234567 (country code 49, mobile starts with 15x, 16x, 17x)
      /^\+49(15\d|16\d|17\d)\d{7,8}$/,
      // German landline: +4930123456 (country code 49, area code, 6-8 digits)
      /^\+49[1-9]\d{1,4}\d{4,8}$/,
      // German without country code: 01701234567 (mobile) or area code format
      /^0(15\d|16\d|17\d)\d{7,8}$/,
      /^0[1-9]\d{1,4}\d{4,8}$/,
      
      // FRENCH NUMBERS  
      // French mobile: +33612345678 (country code 33, mobile starts with 6 or 7)
      /^\+33[67]\d{8}$/,
      // French landline: +33123456789 (country code 33, landline starts with 1-5, 8, 9)
      /^\+33[1-58-9]\d{8}$/,
      // French without country code: 0612345678
      /^0[1-9]\d{8}$/,
      
      // ITALIAN NUMBERS
      // Italian mobile: +393123456789 (country code 39, mobile starts with 3)
      /^\+393\d{8,9}$/,
      // Italian landline: +390212345678 (country code 39, various area codes)
      /^\+39[0-9]\d{6,10}$/,
      // Italian without country code: 3123456789 or 0212345678
      /^3\d{8,9}$/,
      /^0[1-9]\d{6,9}$/,
      
      // SPANISH NUMBERS
      // Spanish mobile: +34612345678 (country code 34, mobile starts with 6, 7, 8, 9)
      /^\+34[6-9]\d{8}$/,
      // Spanish landline: +34912345678 (country code 34, landline starts with 8, 9)
      /^\+34[89]\d{8}$/,
      // Spanish without country code: 612345678
      /^[6-9]\d{8}$/,
      
      // UK NUMBERS
      // UK mobile: +447123456789 (country code 44, mobile starts with 7)
      /^\+447\d{9}$/,
      // UK landline: +441234567890 (country code 44, various formats)
      /^\+44[1-9]\d{8,9}$/,
      // UK without country code: 07123456789 or 01234567890
      /^07\d{9}$/,
      /^0[1-9]\d{8,9}$/,
      
      // BELGIAN NUMBERS
      // Belgian mobile: +32471234567 (country code 32, mobile 4xx)
      /^\+32[4]\d{8}$/,
      // Belgian landline: +3223456789 (country code 32, landline)
      /^\+32[1-9]\d{7,8}$/,
      // Belgian without country code: 0471234567
      /^0[1-9]\d{7,8}$/,
      
      // SWISS NUMBERS
      // Swiss mobile: +41791234567 (country code 41, mobile 7x, 8x)
      /^\+41[78]\d{8}$/,
      // Swiss landline: +41311234567 (country code 41, various area codes)
      /^\+41[1-6]\d{7,8}$/,
      // Swiss without country code: 0791234567
      /^0[1-9]\d{8}$/,
      
      // US format: 1234567890 (10 digits)
      /^[2-9]\d{2}[2-9]\d{2}\d{4}$/,
      // US format with country code: 11234567890 (11 digits starting with 1)
      /^1[2-9]\d{2}[2-9]\d{2}\d{4}$/,
      // General international format: 7-15 digits
      /^\d{7,15}$/
    ];
    
    // Test against any of the valid patterns
    return phonePatterns.some(pattern => pattern.test(cleanPhone));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === 'message' && value.length > maxCharLimit) return;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    if (id === 'message') setCharCount(value.length);
    setErrors((prevErrors) => ({ ...prevErrors, [id]: '' }));
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors = { name: '', email: '', phone: '', subject: '', message: '' };
    const errorMessages: string[] = [];

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
      errorMessages.push('Name is required');
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = 'Valid email is required.';
      errorMessages.push('Valid email is required');
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g., +31 6 12345678, 06 12345678, or +1 234 567 8901).';
      errorMessages.push('Please enter a valid phone number (e.g., +31 6 12345678, 06 12345678, or +1 234 567 8901)');
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
      errorMessages.push('Subject is required');
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message cannot be empty.';
      errorMessages.push('Message cannot be empty');
    }

    if (errorMessages.length > 0) {
      setErrors(newErrors);
      setNotification({
        message: errorMessages.length === 1 ? errorMessages[0] : `Please fix the following: ${errorMessages.join(', ')}`,
        type: 'error',
        isVisible: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to send email');
        }
      } else {
        const text = await response.text();
        console.log('Response text:', text);
        if (!response.ok) {
          throw new Error(text || 'Failed to send email');
        }
      }

      // Success: Reset form and show success notification
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setCharCount(0);
      setNotification({
        message: 'Message sent successfully! I\'ll get back to you soon.',
        type: 'success',
        isVisible: true,
      });
      
      // Call the callback if provided
      onEmailSent?.();
    } catch (error) {
      console.error('Error sending email:', error);
      setNotification({
        message: 'Failed to send message. Please try again later.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={handleCloseNotification}
      />
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <input 
          id="name" 
          type="text" 
          value={formData.name} 
          onChange={handleChange} 
          placeholder="Name" 
          className="select-content rounded-2xl w-full h-12 sm:h-14 text-base sm:text-lg px-3 sm:px-4" 
          required 
        />
        {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

        <input 
          id="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="Email" 
          className="select-content rounded-2xl w-full h-12 sm:h-14 text-base sm:text-lg px-3 sm:px-4" 
          required 
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
        
        <input 
          id="phone" 
          type="tel" 
          value={formData.phone} 
          onChange={handleChange} 
          placeholder="Phone Number (Optional)" 
          className="select-content rounded-2xl w-full h-12 sm:h-14 text-base sm:text-lg px-3 sm:px-4" 
        />
        {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
        
        <input 
          id="subject" 
          type="text" 
          value={formData.subject} 
          onChange={handleChange} 
          placeholder="Subject" 
          className="select-content rounded-2xl w-full h-12 sm:h-14 text-base sm:text-lg px-3 sm:px-4" 
          required
        />
        {errors.subject && <p className="text-red-400 text-sm">{errors.subject}</p>}

        <textarea 
          id="message" 
          value={formData.message} 
          onChange={handleChange} 
          placeholder="Message" 
          className="select-content rounded-2xl resize-none w-full h-28 sm:h-32 text-base sm:text-lg px-3 sm:px-4 py-2" 
          maxLength={maxCharLimit} 
          required
        ></textarea>
        <div className="text-right text-xs sm:text-sm text-neutral-500">{charCount}/{maxCharLimit}</div>
        {errors.message && <p className="text-red-400 text-sm">{errors.message}</p>}

        <motion.button 
          type="submit" 
          disabled={isSubmitting} 
          className="select-content rounded-2xl w-full h-12 sm:h-14 text-base sm:text-lg text-center cursor-pointer disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </motion.button>
      </form>
    </>
  );
};

export default ContactForm;

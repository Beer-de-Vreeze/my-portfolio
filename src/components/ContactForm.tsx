import { FormEvent, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ContactFormProps {
  onEmailSent?: () => void;
  onNotification?: (message: string, type: 'success' | 'error') => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Phone validation patterns - moved outside component for better performance
const PHONE_PATTERNS = [
  // International format: +1234567890 (7-15 digits after country code)
  /^\+[1-9]\d{6,14}$/,
  
  // DUTCH NUMBERS
  /^\+316\d{8}$/, // Dutch mobile: +31612345678
  /^\+31[1-9]\d{7,8}$/, // Dutch landline: +31201234567
  /^06\d{8}$/, // Dutch mobile without country code: 06xxxxxxxx
  /^0[1-9]\d{7,8}$/, // Dutch landline without country code
  
  // GERMAN NUMBERS
  /^\+49(15\d|16\d|17\d)\d{7,8}$/, // German mobile
  /^\+49[1-9]\d{1,4}\d{4,8}$/, // German landline
  /^0(15\d|16\d|17\d)\d{7,8}$/, // German mobile without country code
  /^0[1-9]\d{1,4}\d{4,8}$/, // German landline without country code
  
  // FRENCH NUMBERS  
  /^\+33[67]\d{8}$/, // French mobile
  /^\+33[1-58-9]\d{8}$/, // French landline
  /^0[1-9]\d{8}$/, // French without country code
  
  // ITALIAN NUMBERS
  /^\+393\d{8,9}$/, // Italian mobile
  /^\+39[0-9]\d{6,10}$/, // Italian landline
  /^3\d{8,9}$/, // Italian mobile without country code
  /^0[1-9]\d{6,9}$/, // Italian landline without country code
  
  // SPANISH NUMBERS
  /^\+34[6-9]\d{8}$/, // Spanish mobile
  /^\+34[89]\d{8}$/, // Spanish landline
  /^[6-9]\d{8}$/, // Spanish without country code
  
  // UK NUMBERS
  /^\+447\d{9}$/, // UK mobile
  /^\+44[1-9]\d{8,9}$/, // UK landline
  /^07\d{9}$/, // UK mobile without country code
  /^0[1-9]\d{8,9}$/, // UK landline without country code
  
  // BELGIAN NUMBERS
  /^\+32[4]\d{8}$/, // Belgian mobile
  /^\+32[1-9]\d{7,8}$/, // Belgian landline
  /^0[1-9]\d{7,8}$/, // Belgian without country code
  
  // SWISS NUMBERS
  /^\+41[78]\d{8}$/, // Swiss mobile
  /^\+41[1-6]\d{7,8}$/, // Swiss landline
  /^0[1-9]\d{8}$/, // Swiss without country code
  
  // US NUMBERS
  /^[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US format: 1234567890
  /^1[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US with country code
  
  // General international format
  /^\d{7,15}$/
];

const ContactForm = ({ onEmailSent, onNotification }: ContactFormProps) => {
  const [formData, setFormData] = useState<FormData>({ 
    name: '', 
    email: '', 
    phone: '', 
    subject: '', 
    message: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({ 
    name: '', 
    email: '', 
    phone: '', 
    subject: '', 
    message: '' 
  });
  
  const maxCharLimit = 500;

  // Memoized validation functions for better performance
  const validateEmail = useCallback((email: string): boolean => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), []
  );  // Optimized phone validation with better error handling
  const validatePhone = useCallback((phone: string): boolean => {
    if (!phone.trim()) return true; // Empty phone is valid since it's optional
    
    // Remove all non-digit characters except + at the beginning
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Must have at least 7 digits and not exceed 15 (international standard)
    if (cleanPhone.length < 7 || cleanPhone.length > 15) return false;
    
    // Test against valid patterns
    return PHONE_PATTERNS.some(pattern => pattern.test(cleanPhone));
  }, []);

  // Improved validation with more specific error messages
  const validateForm = useCallback((data: FormData): { isValid: boolean; errors: FormErrors; errorMessages: string[] } => {
    const newErrors: FormErrors = { name: '', email: '', phone: '', subject: '', message: '' };
    const errorMessages: string[] = [];

    // Name validation
    if (!data.name.trim()) {
      newErrors.name = 'Name is required.';
      errorMessages.push('Name is required');
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
      errorMessages.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email is required.';
      errorMessages.push('Email is required');
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address.';
      errorMessages.push('Please enter a valid email address');
    }

    // Phone validation (optional)
    if (!validatePhone(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g., +31 6 12345678, 06 12345678, or +1 234 567 8901).';
      errorMessages.push('Please enter a valid phone number');
    }

    // Subject validation
    if (!data.subject.trim()) {
      newErrors.subject = 'Subject is required.';
      errorMessages.push('Subject is required');
    } else if (data.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters long.';
      errorMessages.push('Subject must be at least 3 characters long');
    }

    // Message validation
    if (!data.message.trim()) {
      newErrors.message = 'Message cannot be empty.';
      errorMessages.push('Message cannot be empty');
    } else if (data.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
      errorMessages.push('Message must be at least 10 characters long');
    }

    return {
      isValid: errorMessages.length === 0,
      errors: newErrors,
      errorMessages
    };
  }, [validateEmail, validatePhone]);
  
  // Improved change handler with better state management
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    // Prevent exceeding character limit for message
    if (id === 'message' && value.length > maxCharLimit) return;
    
    setFormData((prevData) => ({ ...prevData, [id]: value } as FormData));
    if (id === 'message') setCharCount(value.length);
    
    // Clear specific field error when user starts typing
    if (errors[id as keyof FormErrors]) {
      setErrors((prevErrors) => ({ ...prevErrors, [id]: '' }));
    }
  }, [errors, maxCharLimit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      onNotification?.(
        validation.errorMessages.length === 1 
          ? validation.errorMessages[0] 
          : `Please fix the following: ${validation.errorMessages.join(', ')}`,
        'error'
      );
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

      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to send email');
      }

      // Success: Reset form and show success notification
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setCharCount(0);
      setErrors({ name: '', email: '', phone: '', subject: '', message: '' });
      onNotification?.('Message sent successfully! I\'ll get back to you soon.', 'success');
      
      // Call the callback if provided
      onEmailSent?.();
    } catch (error) {
      console.error('Error sending email:', error);
      onNotification?.(
        error instanceof Error ? error.message : 'Failed to send message. Please try again later.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Memoized form fields configuration for better organization
  const formFields = useMemo(() => [
    {
      id: 'name',
      type: 'text',
      placeholder: 'Name *',
      required: true,
      value: formData.name,
      error: errors.name,
      'aria-label': 'Your full name'
    },
    {
      id: 'email',
      type: 'email',
      placeholder: 'Email *',
      required: true,
      value: formData.email,
      error: errors.email,
      'aria-label': 'Your email address'
    },
    {
      id: 'phone',
      type: 'tel',
      placeholder: 'Phone Number (Optional)',
      required: false,
      value: formData.phone,
      error: errors.phone,
      'aria-label': 'Your phone number (optional)'
    },
    {
      id: 'subject',
      type: 'text',
      placeholder: 'Subject *',
      required: true,
      value: formData.subject,
      error: errors.subject,
      'aria-label': 'Email subject'
    }
  ], [formData, errors]);

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-8 sm:space-y-10" 
      noValidate
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
        {/* Render form fields dynamically for better maintainability */}
        {formFields.map((field, index) => (
          <motion.div 
            key={field.id} 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
          >
            <input 
              id={field.id}
              name={field.id}
              type={field.type}
              value={field.value}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="select-content rounded-2xl w-full h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 
                         backdrop-blur-sm bg-gray-900/50 border border-gray-700/50 
                         focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                         transition-all duration-300 placeholder-gray-400"
              required={field.required}
              aria-label={field['aria-label']}
              aria-invalid={!!field.error}
              aria-describedby={field.error ? `${field.id}-error` : undefined}
            />
            {field.error && (
              <motion.p 
                id={`${field.id}-error`} 
                className="text-red-400 text-xs sm:text-sm" 
                role="alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {field.error}
              </motion.p>
            )}
          </motion.div>
        ))}

        {/* Message textarea with character counter - more compact */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <textarea 
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Message *"
            className="select-content rounded-2xl resize-none w-full h-28 sm:h-32 md:h-36 text-sm sm:text-base px-3 sm:px-4 py-2
                       backdrop-blur-sm bg-gray-900/50 border border-gray-700/50 
                       focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                       transition-all duration-300 placeholder-gray-400"
            maxLength={maxCharLimit}
            required
            aria-label="Your message"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : 'message-counter'}
          />
          <div className="flex justify-between items-center">
            <div id="message-counter" className="text-right text-xs text-neutral-500">
              {charCount}/{maxCharLimit}
            </div>
            {charCount > maxCharLimit * 0.9 && (
              <motion.div 
                className="text-xs text-amber-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {maxCharLimit - charCount} characters remaining
              </motion.div>
            )}
          </div>
          {errors.message && (
            <motion.p 
              id="message-error" 
              className="text-red-400 text-xs sm:text-sm" 
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {errors.message}
            </motion.p>
          )}
        </motion.div>

        {/* Submit button with improved accessibility and animations - more compact */}
        <motion.button 
          type="submit" 
          disabled={isSubmitting}
          className="select-content rounded-2xl w-full h-10 sm:h-12 text-sm sm:text-base text-center cursor-pointer 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2
                     backdrop-blur-sm bg-gradient-to-r from-blue-600/80 to-purple-600/80 border border-blue-500/30
                     hover:from-blue-500/90 hover:to-purple-500/90 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/25
                     focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          aria-label={isSubmitting ? 'Sending message' : 'Send message'}
          title={isSubmitting ? 'Sending message...' : 'Send Message (Psst: Try ↑↑↓↓←→←→BA)'}
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </motion.button>
      </motion.form>
  );
};

export default ContactForm;

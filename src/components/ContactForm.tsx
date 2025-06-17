import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import Notification from './Notification';

interface ContactFormProps {
  onEmailSent?: () => void;
}

const ContactForm = ({ onEmailSent }: ContactFormProps) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Coding related question', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
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

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'message' && value.length > maxCharLimit) return;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    if (id === 'message') setCharCount(value.length);
    setErrors((prevErrors) => ({ ...prevErrors, [id]: '' }));
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors = { name: '', email: '', message: '' };

    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim() || !validateEmail(formData.email)) newErrors.email = 'Valid email is required.';
    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty.';

    if (newErrors.name || newErrors.email || newErrors.message) {
      setErrors(newErrors);
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
      setFormData({ name: '', email: '', subject: 'Coding related question', message: '' });
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
      />      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
      
      <select 
        id="subject" 
        value={formData.subject} 
        onChange={handleChange} 
        className="select-content rounded-2xl w-full h-12 sm:h-14 text-base sm:text-lg px-3 sm:px-4" 
        required
      >
        <option className="select-item hover:bg-white hover:text-black">Coding related question</option>
        <option className="select-item hover:bg-white hover:text-black">Coding unrelated question</option>
        <option className="select-item hover:bg-white hover:text-black">Business talk invitation</option>
        <option className="select-item hover:bg-white hover:text-black">Job offer</option>
        <option className="select-item hover:bg-white hover:text-black">Other</option>
      </select>      <textarea 
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

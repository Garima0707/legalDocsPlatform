// src/components/ContactSection.js
import React, { useState, forwardRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import '../styles/contactStyles.css';
import logo from '../styles/logo.jpeg';

const ContactSection = forwardRef(({ isVisible }, ref) => {
  const [form, setForm] = useState({ name: '', company: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });

  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.message) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:5000/api/contact/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });
  
        const result = await response.json();
        if (result.success) {
          // Show success toast
          toast.success("Form submitted successfully!");
  
          // Reset form fields and errors
          setForm({ name: "", company: "", email: "", subject: "", message: "" });
          setErrors({});
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Error submitting the form");
        console.error("Submission error:", error);
      }
    }
  };
  
  return (
    <section id="contact" ref={ref} className={`section contact ${isVisible ? 'visible' : ''}`}>
      <div className="contact-left">
        <h3>Get in Touch</h3>
        <p>We'd love to hear from you!</p>

        <div className="contact-details">
          <p><strong>Website:</strong> <a href="http://localhost:3000/" target="_blank" rel="noopener noreferrer">www.secureDocs.com</a></p>
          <p><strong>Email:</strong> <a href="mailto:securedocs3@gmail.com">securedocs3@gmail.com</a></p>
          <div className="logo">
            <img src={logo} alt="Website Logo" />
          </div>
        </div>
      </div>

      <div className="contact-right">
        <h3>Send a Message</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="name">Your Name:</label>
              <input type="text" id="name" name="name" value={form.name} onChange={handleInputChange} />
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="company">Company (Optional):</label>
              <input type="text" id="company" name="company" value={form.company} onChange={handleInputChange} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Your Email:</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleInputChange} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="subject">Subject:</label>
            <input type="text" id="subject" name="subject" value={form.subject} onChange={handleInputChange} />
          </div>

          <div className="input-group">
            <label htmlFor="message">Your Message:</label>
            <textarea id="message" name="message" rows="5" value={form.message} onChange={handleInputChange} />
            {errors.message && <p className="error">{errors.message}</p>}
          </div>

          <button type="submit">Send</button>
        </form>
      </div>
      <ToastContainer />
    </section>
  );
});

export default ContactSection;

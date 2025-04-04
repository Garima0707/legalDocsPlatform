import React, { useState } from 'react';
import axios from 'axios';
import '../styles/HomePage.css';

const RegisterModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState(''); // Add state for email
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false); // New loading state

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true

        try {
            await axios.post('http://localhost:5000/api/auth/register', { email, username, password }); // Include email in the request
            alert('Registered successfully! Please log in.');
            onClose(); // Close the modal after successful registration
        } catch (error) {
            alert('Registration failed. Please try again.');
        } finally {
            setLoading(false); // Set loading to false after completion
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <div className="modal-left">
                    <h2>Hello!</h2>
                    <p>Create an account to get started.</p>
                    <form onSubmit={handleRegister}>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            required 
                            autoComplete="Enter Email"
                        />
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Username" 
                            required 
                            autoComplete="Enter Username"
                        />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                            required 
                            autoComplete="Enter Password"
                        />
                        <button type="submit" className="signup-button" disabled={loading}>{loading ? 'Registering...' : 'Sign Up'}</button>
                    </form>
                    <p className="login-prompt">
                    Already have an account? <span onClick={onClose} className="login-link">Login</span>
                </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;

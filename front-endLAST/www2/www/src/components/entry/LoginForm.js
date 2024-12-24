// src/components/LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import '../../styles/Form.css';

const LoginForm = ({ setIsLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ email, password }).toString(),
            });

            const contentType = response.headers.get("content-type");
            const result = contentType && contentType.includes("application/json")
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                // Display error from response or fallback message
                setError(typeof result === 'string' ? result : (result.error || 'Login failed. Please try again.'));
                return;
            }

            // Process the response and handle token
            if (typeof result === 'object' && result.token) {
                // Store token and role in localStorage
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('role', result.role);

                // Call login function from AuthContext (if applicable)
                if (login) login(result.token);

                // Redirect based on user role
                switch (result.role) {
                    case 'admin':
                        navigate('/admin-home');
                        break;
                    case 'courier':
                        navigate('/courier-home');
                        break;
                    case 'user':
                        navigate('/user-home');
                        break;
                    default:
                        setError('Invalid role.');
                        return;
                }
            } else {
                setError('Login failed. Unexpected response format.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="form">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <center>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                    {error && <p className="error">{error}</p>}
                    <center>
                        <button type="submit">Log In</button>
                    </center>
                    <br />
                </center>
                <p className="info">Don't have an account? <button type="button" onClick={() => setIsLogin(false)}>Sign Up</button></p>
            </form>
        </div>
    );
};

export default LoginForm;

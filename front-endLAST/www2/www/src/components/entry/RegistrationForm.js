import React, { useState } from 'react';
import '../../styles/Form.css';

const RegistrationForm = ({ setIsLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`http://localhost:8080/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    email,
                    name,
                    password,
                    number: phone,
                }).toString(),
            });
    
            // Determine if response is JSON or plain text
            const contentType = response.headers.get("content-type");
            let responseData;
    
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                responseData = { message: await response.text() };
            }

            if (response.ok) {
                setMessage(`Registration successful: ${responseData.message || 'Welcome!'}`);
            } else {
                setMessage(`Registration failed: ${responseData.message || 'Unknown error'}`);
            }
    
        } catch (error) {
            console.error('Error registering user:', error);
            setMessage('Registration failed. Please try again.');
        }
    };
    
    return (
        <form className="form" onSubmit={handleSubmit}>
            <h2>Sign up</h2>
           <center>
               <div>
                   <input
                       type="text"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Enter your name"
                       required
                   />
               </div>
               <div>
                   <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="Enter your email"
                       required
                   />
               </div>
               <div>
                   <input
                       type="tel"
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       placeholder="Enter your phone number"
                       required
                   />
               </div>
               <div>
                   <input
                       type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="Create a password"
                       required
                   />
               </div>
           </center>
           <center>
               <button type="submit">Sign Up</button>
           </center>
           {message && <p className="message">{message}</p>}
           <br />
           <p className="info">Already have an account? <button type="button" onClick={() => setIsLogin(true)}>Login</button></p>
        </form>
    );
};

export default RegistrationForm;

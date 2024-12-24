// src/components/AuthPage.js
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true); // State to toggle between login and registration

    return (
        <div className="auth-container">
            {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <RegistrationForm setIsLogin={setIsLogin} />}
        </div>
    );
};

export default AuthPage;




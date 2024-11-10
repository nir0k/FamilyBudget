// src/components/Login.js
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { loginUser, fetchUserData } from '../api'; // Import fetchUserData
import { useTranslation } from 'react-i18next';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useTranslation();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser(email, password);
            localStorage.setItem('authToken', data.auth_token);

            // Fetch user data after login
            const userData = await fetchUserData(data.auth_token);
            localStorage.setItem('username', userData.username); // Save username in localStorage

            toast.success(t('welcome'));
            window.location.href = '/'; // Redirect to the main page after login
        } catch (error) {
            toast.error(t('loginError'));
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <ToastContainer />
            <div className="w-100" style={{ maxWidth: '400px' }}>
                <h2 className="text-center mb-4">{t('login')}</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">{t('email')}</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">{t('password')}</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">{t('login')}</button>
                </form>
            </div>
        </div>
    );
}

export default Login;

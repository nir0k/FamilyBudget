// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaUserCircle, FaUserAlt } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { Dropdown } from 'react-bootstrap';
import UserInfoOffcanvas from './UserInfoOffcanvas';
import { useTranslation } from 'react-i18next';
import { fetchUserData } from '../api';

function Navbar({ isDarkTheme, toggleTheme }) {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await fetchUserData(authToken);
                setUserData(data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        if (authToken) {
            loadUserData();
        }
    }, [authToken]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <nav className={`navbar navbar-expand-lg ${isDarkTheme ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
            <div className="container">
                <Link to="/" className="navbar-brand">Family Budget</Link>

                <div className="d-flex align-items-center">
                    <button
                        onClick={toggleTheme}
                        className="btn btn-link p-2"
                        data-tooltip-id="themeTooltip"
                        data-tooltip-content={t(`switchTo${isDarkTheme ? 'Light' : 'Dark'}Theme`)}
                        style={{ fontSize: '1.5rem', color: isDarkTheme ? '#fff' : '#333' }}
                    >
                        {isDarkTheme ? <FaSun /> : <FaMoon />}
                    </button>
                    <Tooltip id="themeTooltip" place="bottom" />

                    <Dropdown align="end" className="mx-2">
                        <Dropdown.Toggle variant="link" className="text-decoration-none" style={{ color: isDarkTheme ? '#fff' : '#333' }}>
                            {t('language')}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => i18n.changeLanguage('en')}>English</Dropdown.Item>
                            <Dropdown.Item onClick={() => i18n.changeLanguage('ru')}>Русский</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {authToken ? (
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="d-flex align-items-center text-decoration-none" style={{ color: isDarkTheme ? '#fff' : '#333' }}>
                                <FaUserCircle style={{ fontSize: '1.5rem' }} className="me-1" />
                                <span>{username}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setShowOffcanvas(true)}>
                                    {t('userInfo')}
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleLogout}>{t('logout')}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    ) : (
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="d-flex align-items-center text-decoration-none" style={{ color: isDarkTheme ? '#fff' : '#333' }}>
                                <FaUserAlt style={{ fontSize: '1.5rem' }} className="me-1" />
                                <span>{t('guest')}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => navigate('/login')}>{t('login')}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </div>

                {/* Offcanvas для отображения информации о пользователе */}
                <UserInfoOffcanvas
                    show={showOffcanvas}
                    handleClose={() => setShowOffcanvas(false)}
                    userData={userData}
                />
            </div>
        </nav>
    );
}

export default Navbar;

// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaUserCircle, FaUserAlt } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { Dropdown } from 'react-bootstrap';
import UserInfoOffcanvas from './UserInfoOffcanvas';
import CurrencyOffcanvas from './CurrencyOffcanvas';
import BanksOffcanvas from './BanksOffcanvas';
import AccountTypesOffcanvas from './AccountTypesOffcanvas';
import AccountsOffcanvas from './AccountsOffcanvas';
import CategoriesOffcanvas from './CategoriesOffcanvas';
import { useTranslation } from 'react-i18next';
import { fetchUserData } from '../api';

function Navbar({ isDarkTheme, toggleTheme }) {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    const [showUserOffcanvas, setShowUserOffcanvas] = useState(false);
    const [showCurrencyOffcanvas, setShowCurrencyOffcanvas] = useState(false);
    const [showBanksOffcanvas, setShowBanksOffcanvas] = useState(false);
    const [showAccountTypesOffcanvas, setShowAccountTypesOffcanvas] = useState(false);
    const [showAccountsOffcanvas, setShowAccountsOffcanvas] = useState(false);
    const [showCategoriesOffcanvas, setShowCategoriesOffcanvas] = useState(false);
    const [userData, setUserData] = useState({});
    const [currentLang, setCurrentLang] = useState(i18n.language);

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

    useEffect(() => {
        setCurrentLang(i18n.language.toUpperCase().slice(0, 2));
    }, [i18n.language]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setCurrentLang(lang.toUpperCase().slice(0, 2));
    };

    return (
        <nav className={`navbar navbar-expand-lg ${isDarkTheme ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
            <div className="container">
                <Link to="/" className="navbar-brand">Family Budget</Link>

                {/* Finances Dropdown */}
                <Dropdown align="end" className="ms-2">
                    <Dropdown.Toggle variant="link" className="text-decoration-none" style={{ color: isDarkTheme ? '#fff' : '#333' }}>
                        {t('finances')}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setShowAccountsOffcanvas(true)}>{t('accounts')}</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowAccountTypesOffcanvas(true)}>{t('accountTypes')}</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowBanksOffcanvas(true)}>{t('banks')}</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowCurrencyOffcanvas(true)}>{t('currency')}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                {/* Transactions Dropdown */}
                <Dropdown align="end" className="ms-2">
                    <Dropdown.Toggle variant="link" className="text-decoration-none" style={{ color: isDarkTheme ? '#fff' : '#333' }}>
                        {t('transactions')}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate('/transactions')}>{t('transactions')}</Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowCategoriesOffcanvas(true)}>{t('category')}</Dropdown.Item> {/* Открытие Offcanvas для категорий */}
                    </Dropdown.Menu>
                </Dropdown>

                {/* Reports Dropdown */}
                <Dropdown align="end" className="ms-2">
                    <Dropdown.Toggle variant="link" className="text-decoration-none" style={{ color: isDarkTheme ? '#fff' : '#333' }}>
                        {t('reports')}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate('/reports/accounts')}>{t('accountsReport')}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>


                <div className="d-flex align-items-center ms-auto">
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
                            {currentLang}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleLanguageChange('en')}>English</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleLanguageChange('ru')}>Русский</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleLanguageChange('hu')}>Magyar</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {authToken ? (
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="d-flex align-items-center text-decoration-none" style={{ color: isDarkTheme ? '#fff' : '#333' }}>
                                <FaUserCircle style={{ fontSize: '1.5rem' }} className="me-1" />
                                <span>{username}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setShowUserOffcanvas(true)}>
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
                    show={showUserOffcanvas}
                    handleClose={() => setShowUserOffcanvas(false)}
                    userData={userData}
                />

                {/* Offcanvas для отображения валют */}
                <CurrencyOffcanvas
                    show={showCurrencyOffcanvas}
                    handleClose={() => setShowCurrencyOffcanvas(false)}
                />

                {/* Offcanvas для отображения банков */}
                <BanksOffcanvas
                    show={showBanksOffcanvas}
                    handleClose={() => setShowBanksOffcanvas(false)}
                />

                {/* Offcanvas для отображения типов счетов */}
                <AccountTypesOffcanvas
                    show={showAccountTypesOffcanvas}
                    handleClose={() => setShowAccountTypesOffcanvas(false)}
                />

                {/* Offcanvas для отображения счетов */}
                <AccountsOffcanvas
                    show={showAccountsOffcanvas}
                    handleClose={() => setShowAccountsOffcanvas(false)}
                />

                {/* Offcanvas для отображения категорий */}
                <CategoriesOffcanvas
                    show={showCategoriesOffcanvas}
                    handleClose={() => setShowCategoriesOffcanvas(false)}
                />
            </div>
        </nav>
    );
}

export default Navbar;

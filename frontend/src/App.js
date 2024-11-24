// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TransactionsPage from './components/TransactionsPage';
import AccountsReportPage from './components/AccountsReportPage';
import TransactionsReportPage from './components/TransactionsReportPage';
import ExpenseBalanceReportPage from './components/ExpenseBalanceReportPage';
import BudgetPage from './components/BudgetPage';
import { ToastContainer } from 'react-toastify';
import './i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [isDarkTheme, setIsDarkTheme] = useState(
        () => JSON.parse(localStorage.getItem('isDarkTheme')) || false
    );

    const toggleTheme = () => {
        setIsDarkTheme((prevTheme) => !prevTheme);
    };

    useEffect(() => {
        localStorage.setItem('isDarkTheme', JSON.stringify(isDarkTheme));
    }, [isDarkTheme]);

    const isAuthenticated = !!localStorage.getItem('authToken');

    return (
        <Router>
            <div className={`${isDarkTheme ? 'bg-dark text-light' : 'bg-light text-dark'} min-vh-100 d-flex flex-column`}>
                <ToastContainer position="top-right" autoClose={3000} />
                <Navbar isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
                
                <div className="container py-4 flex-grow-1">
                    <Routes>
                        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
                        <Route path="/" element={isAuthenticated ? <div>Welcome to Dashboard</div> : <Navigate to="/login" />} />
                        <Route path="/transactions" element={<TransactionsPage isDarkTheme={isDarkTheme} />} />
                        <Route path="/reports/accounts" element={<AccountsReportPage />} />
                        <Route path="/reports/transactions" element={<TransactionsReportPage />} />
                        <Route path="/reports/ExpenseBalance" element={<ExpenseBalanceReportPage />} />
                        <Route path="/budgets" element={<BudgetPage />} />
                    </Routes>
                </div>
                
                <Footer />
            </div>
        </Router>
    );
}

export default App;

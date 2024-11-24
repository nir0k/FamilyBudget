import axios from 'axios';
import { fetchAccountTypes, addAccountType, updateAccountType, deleteAccountType, fetchAccounts, addAccount, updateAccount, deleteAccount, fetchAccountBalanceHistory } from './api/account';
import { fetchLocales, fetchAllPaginatedData } from './api/utils';
import { fetchBanks, addBank, updateBank, deleteBank } from './api/bank';
import { fetchCurrencies, addCurrency, updateCurrency, deleteCurrency } from './api/currency';
import { fetchBudgets, updateBudget, deleteBudget } from './api/budget';
import { fetchExpenseCategories, fetchIncomeCategories, addCategory, updateCategory, deleteCategory } from './api/category';
import { fetchExpenses, fetchIncomes, fetchTransactions } from './api/transaction';
import { loginUser, fetchUserData, changePassword, updateUserData } from './api/user';

// Base URL for all requests
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Axios instance configuration
const api = axios.create({
    baseURL: API_BASE_URL,
});

export default api;

export {
    fetchAccountTypes,
    addAccountType,
    updateAccountType,
    deleteAccountType,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    fetchAccountBalanceHistory,
    fetchLocales,
    fetchAllPaginatedData,
    fetchBanks,
    addBank,
    updateBank,
    deleteBank,
    fetchCurrencies,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    fetchBudgets,
    updateBudget,
    deleteBudget,
    fetchExpenseCategories,
    fetchIncomeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchExpenses,
    fetchIncomes,
    fetchTransactions,
    loginUser,
    fetchUserData,
    changePassword,
    updateUserData,
};

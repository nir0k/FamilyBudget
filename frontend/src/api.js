// src/api.js
import axios from 'axios';

// Base URL for all requests
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Axios instance configuration
const api = axios.create({
    baseURL: API_BASE_URL,
});

/**
 * Logs in a user.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The response data.
 * @throws {Error} If the request fails.
 */
export const loginUser = async (email, password) => {
    const response = await api.post('/auth/token/login/', {
        email,
        password,
    });
    return response.data;
};

/**
 * Logs out the current user.
 *
 * @returns {Promise<void>} A promise that resolves when the user is logged out.
 * @throws {Error} If the request fails.
 */
export const logoutUser = async () => {
    return api.post('/auth/token/logout/');
};

/**
 * Fetches user data from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The user data.
 * @throws {Error} If the request fails.
 */
export const fetchUserData = async (token) => {
    const response = await api.get('/users/me/', {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Changes the user's password.
 *
 * @param {string} currentPassword - The current password.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>} A promise that resolves when the password is changed.
 * @throws {Error} If the request fails.
 */
export const changePassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem('authToken');
    const response = await api.post(
        '/users/set_password',
        {
            current_password: currentPassword,
            new_password: newPassword,
        },
        {
            headers: {
                'Authorization': `Token ${token}`,
            },
        }
    );
    return response.data;
};

/**
 * Updates the user's data.
 *
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} The updated user data.
 * @throws {Error} If the request fails.
 */
export const updateUserData = async (data) => {
    const token = localStorage.getItem('authToken');
    const response = await api.put('/users/me/', data, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Fetches the list of currencies from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of currencies.
 * @throws {Error} If the request fails.
 */
export const fetchCurrencies = async (token) => {
    const response = await api.get('/currencies/', {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Adds a new currency.
 *
 * @param {Object} currency - The currency data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The added currency data.
 * @throws {Error} If the request fails.
 */
export const addCurrency = async (currency, token) => {
    const response = await api.post('/currencies/', currency, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Updates an existing currency.
 *
 * @param {number} id - The currency ID.
 * @param {Object} currency - The updated currency data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The updated currency data.
 * @throws {Error} If the request fails.
 */
export const updateCurrency = async (id, currency, token) => {
    const response = await api.put(`/currencies/${id}/`, currency, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Deletes a currency by ID.
 *
 * @param {number} id - The currency ID.
 * @param {string} token - The authentication token.
 * @returns {Promise<void>} A promise that resolves when the currency is deleted.
 * @throws {Error} If the request fails.
 */
export const deleteCurrency = async (id, token) => {
    await api.delete(`/currencies/${id}/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
};

/**
 * Fetches the list of banks from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of banks.
 * @throws {Error} If the request fails.
 */
export const fetchBanks = async (token) => {
    const response = await api.get('/banks/', {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Adds a new bank.
 *
 * @param {Object} bank - The bank data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The added bank data.
 * @throws {Error} If the request fails.
 */
export const addBank = async (bank, token) => {
    const response = await api.post('/banks/', bank, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Updates an existing bank.
 *
 * @param {number} id - The bank ID.
 * @param {Object} bank - The updated bank data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The updated bank data.
 * @throws {Error} If the request fails.
 */
export const updateBank = async (id, bank, token) => {
    const response = await api.put(`/banks/${id}/`, bank, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Deletes a bank by ID.
 *
 * @param {number} id - The bank ID.
 * @param {string} token - The authentication token.
 * @returns {Promise<void>} A promise that resolves when the bank is deleted.
 * @throws {Error} If the request fails.
 */
export const deleteBank = async (id, token) => {
    await api.delete(`/banks/${id}/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
};

/**
 * Fetches the list of account types from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of account types.
 * @throws {Error} If the request fails.
 */
export const fetchAccountTypes = async (token) => {
    const response = await api.get('/accountTypes/', {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Adds a new account type.
 *
 * @param {Object} accountType - The account type data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The added account type data.
 * @throws {Error} If the request fails.
 */
export const addAccountType = async (accountType, token) => {
    const response = await api.post('/accountTypes/', accountType, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Updates an existing account type.
 *
 * @param {number} id - The account type ID.
 * @param {Object} accountType - The updated account type data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The updated account type data.
 * @throws {Error} If the request fails.
 */
export const updateAccountType = async (id, accountType, token) => {
    const response = await api.put(`/accountTypes/${id}/`, accountType, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Deletes an account type by ID.
 *
 * @param {number} id - The account type ID.
 * @param {string} token - The authentication token.
 * @returns {Promise<void>} A promise that resolves when the account type is deleted.
 * @throws {Error} If the request fails.
 */
export const deleteAccountType = async (id, token) => {
    await api.delete(`/accountTypes/${id}/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
};

/**
 * Fetches the list of accounts from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of accounts.
 * @throws {Error} If the request fails.
 */
export const fetchAccounts = async (token) => {
    const response = await api.get('/accounts/', {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Adds a new account.
 *
 * @param {Object} account - The account data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The added account data.
 * @throws {Error} If the request fails.
 */
export const addAccount = async (account, token) => {
    const response = await api.post('/accounts/', account, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Updates an existing account.
 *
 * @param {number} id - The account ID.
 * @param {Object} account - The updated account data.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} The updated account data.
 * @throws {Error} If the request fails.
 */
export const updateAccount = async (id, account, token) => {
    const response = await api.put(`/accounts/${id}/`, account, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Deletes an account by ID.
 *
 * @param {number} id - The account ID.
 * @param {string} token - The authentication token.
 * @returns {Promise<void>} A promise that resolves when the account is deleted.
 * @throws {Error} If the request fails.
 */
export const deleteAccount = async (id, token) => {
    await api.delete(`/accounts/${id}/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
};

/**
 * Fetches the list of expenses from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of expenses.
 */
export const fetchExpenses = async (token) => {
    const response = await api.get('/expenses/', {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Fetches the list of incomes from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of incomes.
 */
export const fetchIncomes = async (token) => {
    const response = await api.get('/incomes/', {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
    return response.data;
};

/**
 * Fetches the list of income categories from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of income categories.
 */
export const fetchIncomeCategories = async (token) => {
    const response = await api.get('/incomeCategories/', {
        headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
};

/**
 * Fetches the list of expense categories from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of expense categories.
 */
export const fetchExpenseCategories = async (token) => {
    const response = await api.get('/expenseCategories/', {
        headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
};

/**
 * Updates a category in the API.
 *
 * @param {Object} category - The category object to update.
 * @param {string} type - The category type ('income' or 'expense').
 * @param {string} token - The authentication token.
 * @returns {Promise<void>} A promise that resolves after the category is successfully updated.
 */
export const updateCategory = async (category, type, token) => {
    const endpoint = type === 'income' ? '/incomeCategories/' : '/expenseCategories/';
    await api.put(`${endpoint}${category.id}/`, category, {
        headers: { 'Authorization': `Token ${token}` }
    });
};

/**
 * Deletes a category by its ID from the API.
 *
 * @param {number} categoryId - The category ID to delete.
 * @param {string} type - The category type ('income' or 'expense').
 * @param {string} token - The authentication token.
 * @returns {Promise<void>} A promise that resolves after the category is successfully deleted.
 */
export const deleteCategory = async (categoryId, type, token) => {
    const endpoint = type === 'income' ? '/incomeCategories/' : '/expenseCategories/';
    await api.delete(`${endpoint}${categoryId}/`, {
        headers: { 'Authorization': `Token ${token}` }
    });
};

/**
 * Adds a new category to the API.
 *
 * @param {Object} category - The new category object.
 * @param {string} type - The category type ('income' or 'expense').
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} A promise that returns the added category.
 */
export const addCategory = async (category, type, token) => {
    const endpoint = type === 'income' ? '/incomeCategories/' : '/expenseCategories/';
    const response = await api.post(endpoint, category, {
        headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
};

/**
 * Fetches the account balance history from the API.
 *
 * @param {number} accountId - The account ID.
 * @param {string} token - The authentication token.
 * @param {string} startDate - The start date.
 * @param {string} endDate - The end date.
 * @returns {Promise<Array>} The account balance history.
 */
export const fetchAccountBalanceHistory = async (accountId, token, startDate, endDate) => {
    const response = await api.get(`/accounts/${accountId}/balance-history/`, {
        params: { start_date: startDate, end_date: endDate },
        headers: {
            'Authorization': `Token ${token}`
        }
    });
    return response.data;
};

export default api;

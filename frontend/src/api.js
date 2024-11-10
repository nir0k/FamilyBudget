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
 * Получает список банков с API.
 *
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Array>} Список банков.
 * @throws {Error} Если запрос не удался.
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
 * Добавляет новый банк.
 *
 * @param {Object} bank - Данные банка.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Object>} Данные добавленного банка.
 * @throws {Error} Если запрос не удался.
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
 * Обновляет существующий банк.
 *
 * @param {number} id - ID банка.
 * @param {Object} bank - Обновленные данные банка.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Object>} Обновленные данные банка.
 * @throws {Error} Если запрос не удался.
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
 * Удаляет банк по ID.
 *
 * @param {number} id - ID банка.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<void>} Промис, который выполняется при успешном удалении.
 * @throws {Error} Если запрос не удался.
 */
export const deleteBank = async (id, token) => {
    await api.delete(`/banks/${id}/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
};

/**
 * Получает список типов счетов с API.
 *
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Array>} Список типов счетов.
 * @throws {Error} Если запрос не удался.
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
 * Добавляет новый тип счета.
 *
 * @param {Object} accountType - Данные типа счета.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Object>} Данные добавленного типа счета.
 * @throws {Error} Если запрос не удался.
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
 * Обновляет существующий тип счета.
 *
 * @param {number} id - ID типа счета.
 * @param {Object} accountType - Обновленные данные типа счета.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Object>} Обновленные данные типа счета.
 * @throws {Error} Если запрос не удался.
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
 * Удаляет тип счета по ID.
 *
 * @param {number} id - ID типа счета.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<void>} Промис, который выполняется при успешном удалении.
 * @throws {Error} Если запрос не удался.
 */
export const deleteAccountType = async (id, token) => {
    await api.delete(`/accountTypes/${id}/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
};

/**
 * Получает список счетов с API.
 *
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Array>} Список счетов.
 * @throws {Error} Если запрос не удался.
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
 * Добавляет новый счет.
 *
 * @param {Object} account - Данные счета.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Object>} Данные добавленного счета.
 * @throws {Error} Если запрос не удался.
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
 * Обновляет существующий счет.
 *
 * @param {number} id - ID счета.
 * @param {Object} account - Обновленные данные счета.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Object>} Обновленные данные счета.
 * @throws {Error} Если запрос не удался.
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
 * Удаляет счет по ID.
 *
 * @param {number} id - ID счета.
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<void>} Промис, который выполняется при успешном удалении.
 * @throws {Error} Если запрос не удался.
 */
export const deleteAccount = async (id, token) => {
    await api.delete(`/accounts/${id}/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
};

/**
 * Получает список расходов с API.
 *
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Array>} Список расходов.
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
 * Получает список доходов с API.
 *
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Array>} Список доходов.
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
 * Получает список категорий дохода с API.
 *
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Array>} Список категорий дохода.
 */
export const fetchIncomeCategories = async (token) => {
    const response = await api.get('/incomeCategories/', {
        headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
};

/**
 * Получает список категорий расхода с API.
 *
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Array>} Список категорий расхода.
 */
export const fetchExpenseCategories = async (token) => {
    const response = await api.get('/expenseCategories/', {
        headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
};

/**
 * Обновляет категорию в API.
 *
 * @param {Object} category - Объект категории для обновления.
 * @param {string} type - Тип категории ('income' или 'expense').
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<void>} Промис, который выполняется после успешного обновления категории.
 */
export const updateCategory = async (category, type, token) => {
    const endpoint = type === 'income' ? '/incomeCategories/' : '/expenseCategories/';
    await api.put(`${endpoint}${category.id}/`, category, {
        headers: { 'Authorization': `Token ${token}` }
    });
};

/**
 * Удаляет категорию по ее ID с API.
 *
 * @param {number} categoryId - Идентификатор категории для удаления.
 * @param {string} type - Тип категории ('income' или 'expense').
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<void>} Промис, который выполняется после успешного удаления категории.
 */
export const deleteCategory = async (categoryId, type, token) => {
    const endpoint = type === 'income' ? '/incomeCategories/' : '/expenseCategories/';
    await api.delete(`${endpoint}${categoryId}/`, {
        headers: { 'Authorization': `Token ${token}` }
    });
};

/**
 * Добавляет новую категорию в API.
 *
 * @param {Object} category - Объект новой категории.
 * @param {string} type - Тип категории ('income' или 'expense').
 * @param {string} token - Токен аутентификации.
 * @returns {Promise<Object>} Промис, который возвращает добавленную категорию.
 */
export const addCategory = async (category, type, token) => {
    const endpoint = type === 'income' ? '/incomeCategories/' : '/expenseCategories/';
    const response = await api.post(endpoint, category, {
        headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
};


export default api;

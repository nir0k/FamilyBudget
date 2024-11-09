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

export default api;

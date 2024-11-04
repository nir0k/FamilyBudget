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

export default api;

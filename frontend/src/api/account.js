import api from '../api';
import { fetchAllPaginatedData } from './utils';

/**
 * Fetches the list of account types from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of account types.
 * @throws {Error} If the request fails.
 */
export const fetchAccountTypes = async (authToken) => {
    const response = await api.get('/accountTypes/?limit=50', {
        headers: {
            'Authorization': `Token ${authToken}`,
        },
    });
    return response.data.results || [];
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
export const fetchAccounts = async (authToken) => {
    const initialUrl = `${process.env.REACT_APP_API_BASE_URL}/accounts/?limit=50`;
    return await fetchAllPaginatedData(initialUrl, authToken);
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
 * Fetches the account balance history from the API.
 *
 * @param {number} accountId - The account ID.
 * @param {string} token - The authentication token.
 * @param {string} startDate - The start date.
 * @param {string} endDate - The end date.
 * @returns {Promise<Array>} The account balance history.
 */
export const fetchAccountBalanceHistory = async (accountId, authToken, startDate, endDate) => {
    const initialUrl = `${process.env.REACT_APP_API_BASE_URL}/accounts/${accountId}/balance-history/?limit=50&start_date=${startDate}&end_date=${endDate}`;
    return await fetchAllPaginatedData(initialUrl, authToken);
};

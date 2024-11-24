import api from '../api';

/**
 * Fetches the list of banks from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of banks.
 * @throws {Error} If the request fails.
 */
export const fetchBanks = async (authToken) => {
    const response = await api.get('/banks/?limit=50', {
        headers: {
            'Authorization': `Token ${authToken}`,
        },
    });
    return response.data.results || [];
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
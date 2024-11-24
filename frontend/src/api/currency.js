import api from '../api';

/**
 * Fetches the list of currencies from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of currencies.
 * @throws {Error} If the request fails.
 */
export const fetchCurrencies = async (authToken) => {
    const response = await api.get('/currencies/?limit=50', {
        headers: {
            'Authorization': `Token ${authToken}`,
        },
    });
    return response.data.results || [];
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
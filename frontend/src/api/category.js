import api from '../api';

/**
 * Fetches the list of income categories from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of income categories.
 */
export const fetchIncomeCategories = async (authToken) => {
    const response = await api.get('/incomeCategories/?limit=50', {
        headers: {
            'Authorization': `Token ${authToken}`,
        },
    });
    return response.data.results || [];
};

/**
 * Fetches the list of expense categories from the API.
 *
 * @param {string} token - The authentication token.
 * @returns {Promise<Array>} The list of expense categories.
 */
export const fetchExpenseCategories = async (authToken) => {
    const response = await api.get('/expenseCategories/?limit=50', {
        headers: {
            'Authorization': `Token ${authToken}`,
        },
    });
    return response.data.results || [];
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
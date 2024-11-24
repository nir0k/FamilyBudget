import api from '../api';

/**
 * Fetches the list of budgets from the API.
 *
 * @param {string} authToken - The authentication token.
 * @returns {Promise<Object>} The list of budgets.
 */
export const fetchBudgets = async (authToken) => {
    try {
        const response = await api.get('/budgets/', {
            headers: {
                Authorization: `Token ${authToken}`,
            },
        });
        return response.data; // axios возвращает данные в response.data
    } catch (error) {
        console.error('Error in fetchBudgets:', error.response || error.message);
        throw new Error('Failed to fetch budgets');
    }
};

/**
 * Updates an existing budget in the API.
 *
 * @param {string} authToken - The authentication token.
 * @param {number} budgetId - The ID of the budget to update.
 * @param {Object} budgetData - The updated budget data.
 * @returns {Promise<Object>} The updated budget object.
 * @throws {Error} If the request fails.
 */
export const updateBudget = async (authToken, budgetId, budgetData) => {
    try {
        const response = await api.put(`/budgets/${budgetId}/`, budgetData, {
            headers: {
                Authorization: `Token ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data; // Возвращаем обновленный бюджет
    } catch (error) {
        console.error('Error updating budget:', error.response || error.message);
        throw new Error('Failed to update budget');
    }
};


/**
 * Deletes a budget from the API.
 *
 * @param {string} authToken - The authentication token.
 * @param {number} budgetId - The ID of the budget to delete.
 * @returns {Promise<void>}
 * @throws {Error} If the request fails.
 */
export const deleteBudget = async (authToken, budgetId) => {
    try {
        await api.delete(`/budgets/${budgetId}/`, {
            headers: {
                Authorization: `Token ${authToken}`,
            },
        });
    } catch (error) {
        console.error('Error deleting budget:', error.response || error.message);
        throw new Error('Failed to delete budget');
    }
};
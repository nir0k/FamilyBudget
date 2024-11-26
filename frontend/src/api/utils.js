import api from '../api';

/**
 * Function to fetch all paginated data from the API.
 * 
 * @param {string} url - The initial URL to fetch data from.
 * @param {string} authToken - The authentication token.
 * @returns {Promise<Array>} A promise that resolves to an array of all results.
 */
async function fetchAllPaginatedData(url, authToken) {
    const allResults = [];
    let nextUrl = url;

    while (nextUrl) {
        const response = await fetch(nextUrl, {
            headers: {
                Authorization: `Token ${authToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${nextUrl}`);
        }

        const data = await response.json();
        allResults.push(...data.results);
        nextUrl = data.next;
    }

    return allResults;
}

/**
 * Fetches the list of available locales.
 *
 * @returns {Promise<Array>} The list of locales with value and label.
 */
export const fetchLocales = async () => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { 'Authorization': `Token ${token}` } : {};
    const response = await api.get('/locale-choices/', { headers });

    return response.data;
};

export { fetchAllPaginatedData };
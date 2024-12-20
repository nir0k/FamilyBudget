import api from '../api';

export async function fetchTransactions(authToken, params = {}) {
    const url = new URL(`${process.env.REACT_APP_API_BASE_URL}/transactions/transactions/`);
    Object.keys(params).forEach((key) => {
        if (params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });

    const response = await api.get(url.toString(), {
        headers: {
            'Authorization': `Token ${authToken}`,
        },
    });

    return response.data;
}

export async function fetchExpenses(authToken, offset = 0, limit = 15) {
    try {
        console.log(`Fetching expenses with offset=${offset}, limit=${limit}`);
        const response = await api.get(`/expenses/?offset=${offset}&limit=${limit}`, {
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        });

        const data = response.data;
        console.log('Fetched expenses:', data);

        return {
            results: data.results || [],
            count: data.count || 0,
        };
    } catch (error) {
        console.error('Error in fetchExpenses:', error);
        throw error;
    }
}

export async function fetchIncomes(authToken, offset = 0, limit = 15) {
    try {
        console.log(`Fetching incomes with offset=${offset}, limit=${limit}`);
        const response = await api.get(`/incomes/?offset=${offset}&limit=${limit}`, {
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        });

        const data = response.data;
        console.log('Fetched incomes:', data);

        return {
            results: data.results || [],
            count: data.count || 0,
        };
    } catch (error) {
        console.error('Error in fetchIncomes:', error);
        throw error;
    }
}

export async function addExpense(authToken, expenseData) {
    const response = await api.post('/expenses/', expenseData, {
        headers: {
            Authorization: `Token ${authToken}`,
        },
    });
    return response.data;
}

export async function addIncome(authToken, incomeData) {
    const response = await api.post('/incomes/', incomeData, {
        headers: {
            Authorization: `Token ${authToken}`,
        },
    });
    return response.data;
}

export async function deleteTransaction(authToken, transactionId, transactionType) {
  const endpoint = transactionType === 'income' ? '/incomes/' : '/expenses/';
  await api.delete(`${endpoint}${transactionId}/`, {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
}

export async function updateTransaction(authToken, transactionData) {
  const response = await api.put(`/transactions/transactions/${transactionData.id}/`, transactionData, {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
  return response.data;
}
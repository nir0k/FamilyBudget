import React, { useEffect, useState } from 'react';
import { Table, Form } from 'react-bootstrap';
import { fetchExpenses, fetchIncomes, fetchCurrencies, fetchExpenseCategories, fetchIncomeCategories, fetchAccounts } from '../api';
import { useTranslation } from 'react-i18next';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function TransactionsPage() {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filter, setFilter] = useState('');
    const authToken = localStorage.getItem('authToken');

    const [currencies, setCurrencies] = useState({});
    const [categories, setCategories] = useState({});
    const [accounts, setAccounts] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const [currencyData, expenseCategoryData, incomeCategoryData, accountData] = await Promise.all([
                    fetchCurrencies(authToken),
                    fetchExpenseCategories(authToken),
                    fetchIncomeCategories(authToken),
                    fetchAccounts(authToken)
                ]);

                // Формируем объекты для быстрого доступа по ID
                const currencyMap = currencyData.reduce((map, currency) => {
                    map[currency.id] = currency.code;
                    return map;
                }, {});
                setCurrencies(currencyMap);

                const categoryMap = [...expenseCategoryData, ...incomeCategoryData].reduce((map, category) => {
                    map[category.id] = category.name;
                    return map;
                }, {});
                setCategories(categoryMap);

                const accountMap = accountData.reduce((map, account) => {
                    map[account.id] = account.name;
                    return map;
                }, {});
                setAccounts(accountMap);

                const [expenses, incomes] = await Promise.all([
                    fetchExpenses(authToken),
                    fetchIncomes(authToken)
                ]);

                const combinedTransactions = [
                    ...expenses.map(tx => ({ ...tx, type: 'expense' })),
                    ...incomes.map(tx => ({ ...tx, type: 'income' }))
                ];
                combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

                setTransactions(combinedTransactions);
                setFilteredTransactions(combinedTransactions);
            } catch (error) {
                console.error('Failed to fetch transactions or related data:', error);
            }
        };
        loadData();
    }, [authToken]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedTransactions = [...transactions].sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];

            if (key === 'time') {
                aValue = new Date(a.date).toLocaleTimeString();
                bValue = new Date(b.date).toLocaleTimeString();
            } else {
                aValue = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
                bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredTransactions(sortedTransactions);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        setFilter(value);
        setFilteredTransactions(
            transactions.filter(tx => {
                const dateStr = new Date(tx.date).toLocaleDateString().toLowerCase();
                const timeStr = new Date(tx.date).toLocaleTimeString().toLowerCase();
                const typeStr = tx.type === 'income' ? t('income').toLowerCase() : t('expense').toLowerCase();
                const currencyName = currencies[tx.currency] ? currencies[tx.currency].toLowerCase() : '';
                const categoryName = categories[tx.category] ? categories[tx.category].toLowerCase() : '';
                const accountName = accounts[tx.account] ? accounts[tx.account].toLowerCase() : '';

                return (
                    tx.description.toLowerCase().includes(value) ||
                    accountName.includes(value) ||
                    tx.amount.toString().includes(value) ||
                    currencyName.includes(value) ||
                    categoryName.includes(value) ||
                    dateStr.includes(value) ||
                    timeStr.includes(value) ||
                    typeStr.includes(value)
                );
            })
        );
    };

    return (
        <div className="container mt-4">
            <h2>{t('transactions')}</h2>
            <Form.Control
                type="text"
                placeholder={t('filter')}
                value={filter}
                onChange={handleFilterChange}
                className="mb-3"
            />
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('date')}>
                            {t('date')} {getSortIcon('date')}
                        </th>
                        <th onClick={() => handleSort('time')}>
                            {t('time')} {getSortIcon('time')}
                        </th>
                        <th onClick={() => handleSort('amount')}>
                            {t('amount')} {getSortIcon('amount')}
                        </th>
                        <th onClick={() => handleSort('currency')}>
                            {t('currency')} {getSortIcon('currency')}
                        </th>
                        <th onClick={() => handleSort('category')}>
                            {t('category')} {getSortIcon('category')}
                        </th>
                        <th onClick={() => handleSort('account')}>
                            {t('account')} {getSortIcon('account')}
                        </th>
                        <th onClick={() => handleSort('description')}>
                            {t('description')} {getSortIcon('description')}
                        </th>
                        <th onClick={() => handleSort('type')}>
                            {t('type')} {getSortIcon('type')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map((transaction) => {
                        const date = new Date(transaction.date);
                        const rowClass = transaction.type === 'income' ? 'bg-success-subtle' : 'bg-danger-subtle';

                        return (
                            <tr key={`${transaction.type}-${transaction.id}`} className={rowClass}>
                                <td>{date.toLocaleDateString()}</td>
                                <td>{date.toLocaleTimeString()}</td>
                                <td>{transaction.amount}</td>
                                <td>{currencies[transaction.currency] || transaction.currency}</td>
                                <td>{categories[transaction.category] || transaction.category}</td>
                                <td>{accounts[transaction.account] || transaction.account}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.type === 'income' ? t('income') : t('expense')}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
}

export default TransactionsPage;

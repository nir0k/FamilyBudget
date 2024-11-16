import React, { useEffect, useState } from 'react';
import { Table, Form, Pagination, Dropdown, ButtonGroup } from 'react-bootstrap';
import { fetchExpenses, fetchIncomes, fetchCurrencies, fetchExpenseCategories, fetchIncomeCategories, fetchAccounts } from '../api';
import { useTranslation } from 'react-i18next';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function TransactionsPage() {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(0);
    const authToken = localStorage.getItem('authToken');

    const [currencies, setCurrencies] = useState({});
    const [categories, setCategories] = useState({});
    const [accounts, setAccounts] = useState({});

    // Load initial data (currencies, categories, accounts)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [currencyData, expenseCategoryData, incomeCategoryData, accountData] = await Promise.all([
                    fetchCurrencies(authToken),
                    fetchExpenseCategories(authToken),
                    fetchIncomeCategories(authToken),
                    fetchAccounts(authToken),
                ]);

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
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
            }
        };

        loadInitialData();
    }, [authToken]);

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                // First, fetch counts
                const [expenseCountData, incomeCountData] = await Promise.all([
                    fetchExpenses(authToken, 0, 0), // Fetch with limit 0 to get count
                    fetchIncomes(authToken, 0, 0),
                ]);
    
                const totalExpenses = expenseCountData.count;
                const totalIncomes = incomeCountData.count;
                const totalTransactions = totalExpenses + totalIncomes;
    
                // Calculate proportions
                const expenseProportion = totalExpenses / totalTransactions || 0.5;
                const incomeProportion = totalIncomes / totalTransactions || 0.5;
    
                // Calculate limits
                const expenseLimit = Math.round(rowsPerPage * expenseProportion);
                const incomeLimit = Math.round(rowsPerPage * incomeProportion);
    
                // Calculate offsets
                const expenseOffset = (currentPage - 1) * expenseLimit;
                const incomeOffset = (currentPage - 1) * incomeLimit;
    
                // Fetch data with calculated limits
                const [expenseData, incomeData] = await Promise.all([
                    fetchExpenses(authToken, expenseOffset, expenseLimit),
                    fetchIncomes(authToken, incomeOffset, incomeLimit),
                ]);
    
                // Combine and sort transactions
                const combinedTransactions = [
                    ...expenseData.results.map(tx => ({ ...tx, type: 'expense' })),
                    ...incomeData.results.map(tx => ({ ...tx, type: 'income' })),
                ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
                setTransactions(combinedTransactions);
                setFilteredTransactions(combinedTransactions);
                setTotalPages(Math.ceil(totalTransactions / rowsPerPage));
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };
    
        loadTransactions();
    }, [authToken, currentPage, rowsPerPage]);
    
    

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedTransactions = [...filteredTransactions].sort((a, b) => {
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

    // Handle filtering
    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        setFilter(value);

        const filteredData = transactions.filter((tx) => {
            const dateStr = new Date(tx.date).toLocaleDateString().toLowerCase();
            const timeStr = new Date(tx.date).toLocaleTimeString().toLowerCase();
            const typeStr = tx.type === 'income' ? t('income').toLowerCase() : t('expense').toLowerCase();
            const currencyName = currencies[tx.currency]?.toLowerCase() || '';
            const categoryName = categories[tx.category]?.toLowerCase() || '';
            const accountName = accounts[tx.account]?.toLowerCase() || '';

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
        });

        setFilteredTransactions(filteredData);
    };

    // Handle pagination
    const handleRowsPerPageChange = (value) => {
        setRowsPerPage(value);
        setCurrentPage(1); // Reset to the first page
    };

    const renderPagination = () => {
        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        return (
            <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                {items}
                <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
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
            <div className="d-flex justify-content-between align-items-center mt-3">
                {renderPagination()}
                <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle variant="secondary">{rowsPerPage}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {[15, 30, 50, 100].map((value) => (
                            <Dropdown.Item key={value} onClick={() => handleRowsPerPageChange(value)}>
                                {value}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
}

export default TransactionsPage;

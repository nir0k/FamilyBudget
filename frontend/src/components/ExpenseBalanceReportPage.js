// src/components/ExpenseBalanceReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { fetchExpenses, fetchExpenseCategories, fetchAccounts, fetchAccountBalanceHistory } from '../api';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ExpenseBalanceReportPage() {
    const { t } = useTranslation();
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedExpenseCategories, setSelectedExpenseCategories] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [balanceData, setBalanceData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCombinedChart, setShowCombinedChart] = useState(false);
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadCategoriesAndAccounts = async () => {
            try {
                const [expenseCats, accountList] = await Promise.all([
                    fetchExpenseCategories(authToken),
                    fetchAccounts(authToken)
                ]);
                setExpenseCategories(expenseCats);
                setAccounts(accountList);

                const currentDate = new Date();
                const lastMonthDate = new Date();
                lastMonthDate.setMonth(currentDate.getMonth() - 1);
                setStartDate(lastMonthDate.toISOString().split('T')[0]);
                setEndDate(currentDate.toISOString().split('T')[0]);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        loadCategoriesAndAccounts();
    }, [authToken]);

    const handleFetchData = useCallback(async () => {
        try {
            const [expensesResponse, accountBalances] = await Promise.all([
                fetchExpenses(authToken),
                Promise.all(selectedAccounts.map(accountId =>
                    fetchAccountBalanceHistory(accountId, authToken, startDate, endDate)
                )),
            ]);
    
            // Извлекаем массив расходов из ответа
            const expenses = expensesResponse.results || [];
    
            // Преобразуем `endDate` к концу дня для корректной фильтрации
            const endDateTime = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    
            // Фильтрация по выбранным категориям и скорректированным датам
            const filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return selectedExpenseCategories.includes(expense.category) &&
                    expenseDate >= new Date(startDate) && expenseDate <= endDateTime;
            });
    
            const filteredBalances = accountBalances.flat().filter(balance => {
                const balanceDate = new Date(balance.date);
                return balanceDate >= new Date(startDate) && balanceDate <= endDateTime;
            });
    
            setExpenseData(filteredExpenses);
            setBalanceData(filteredBalances);
        } catch (error) {
            console.error('Failed to fetch transactions or balances:', error);
        }
    }, [selectedExpenseCategories, selectedAccounts, startDate, endDate, authToken]);
    
    

    const uniqueDates = Array.from(new Set([...expenseData, ...balanceData].map(entry => entry.date.split('T')[0]))).sort();

    const chartData = {
        labels: uniqueDates,
        datasets: [
            ...selectedExpenseCategories.map((categoryId, index) => ({
                label: expenseCategories.find(cat => cat.id === categoryId)?.name || `Expense Category ${categoryId}`,
                data: uniqueDates.map(date => expenseData
                    .filter(exp => exp.date.startsWith(date) && exp.category === categoryId)
                    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)),
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                fill: false,
            })),
            ...selectedAccounts.map((accountId, index) => ({
                label: accounts.find(acc => acc.id === accountId)?.name || `Account ${accountId}`,
                data: uniqueDates.map(date => balanceData
                    .filter(bal => bal.date.startsWith(date) && bal.account === accountId)
                    .reduce((sum, bal) => sum + parseFloat(bal.balance || 0), 0)),
                borderColor: `hsl(${index * 60 + 120}, 70%, 50%)`,
                fill: false,
            }))
        ]
    };

    if (showCombinedChart) {
        const combinedExpenses = uniqueDates.map(date => expenseData
            .filter(exp => exp.date.startsWith(date))
            .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0));
        const combinedBalances = uniqueDates.map(date => balanceData
            .filter(bal => bal.date.startsWith(date))
            .reduce((sum, bal) => sum + parseFloat(bal.balance || 0), 0));

        chartData.datasets = [
            {
                label: t('combinedExpenses'),
                data: combinedExpenses,
                borderColor: 'hsl(0, 70%, 50%)',
                fill: false,
            },
            {
                label: t('combinedBalances'),
                data: combinedBalances,
                borderColor: 'hsl(120, 70%, 50%)',
                fill: false,
            }
        ];
    }

    return (
        <div className="container mt-4">
            <h2>{t('expenseBalanceReport')}</h2>
            <Form>
                <Row className="align-items-center mb-3">
                    <Col md={6}>
                        <Form.Group controlId="selectExpenseCategories">
                            <Form.Label>{t('selectExpenseCategories')}</Form.Label>
                            <Form.Control as="select" multiple value={selectedExpenseCategories} onChange={e => setSelectedExpenseCategories([...e.target.selectedOptions].map(opt => Number(opt.value)))}>
                                {expenseCategories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="selectAccounts">
                            <Form.Label>{t('selectAccounts')}</Form.Label>
                            <Form.Control as="select" multiple value={selectedAccounts} onChange={e => setSelectedAccounts([...e.target.selectedOptions].map(opt => Number(opt.value)))}>
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group controlId="startDate">
                            <Form.Label>{t('startDate')}</Form.Label>
                            <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="endDate">
                            <Form.Label>{t('endDate')}</Form.Label>
                            <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group controlId="showCombinedChart" className="my-3">
                    <Form.Check type="checkbox" label={t('showCombinedChart')} checked={showCombinedChart} onChange={e => setShowCombinedChart(e.target.checked)} />
                </Form.Group>
                <Button onClick={handleFetchData}>{t('showReport')}</Button>
            </Form>
            {(expenseData.length > 0 || balanceData.length > 0) ? (
                <Line data={chartData} />
            ) : (
                <p>{t('noDataForSelectedCategories')}</p>
            )}
        </div>
    );
}

export default ExpenseBalanceReportPage;

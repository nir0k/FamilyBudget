// src/components/TransactionsReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { fetchExpenses, fetchIncomes, fetchExpenseCategories, fetchIncomeCategories } from '../api';
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
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

function TransactionsReportPage() {
    const { t } = useTranslation();
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [selectedExpenseCategories, setSelectedExpenseCategories] = useState([]);
    const [selectedIncomeCategories, setSelectedIncomeCategories] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [incomeData, setIncomeData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCombinedChart, setShowCombinedChart] = useState(false);
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const [expenseCats, incomeCats] = await Promise.all([
                    fetchExpenseCategories(authToken),
                    fetchIncomeCategories(authToken)
                ]);
                setExpenseCategories(expenseCats);
                setIncomeCategories(incomeCats);

                const currentDate = new Date();
                const lastMonthDate = new Date();
                lastMonthDate.setMonth(currentDate.getMonth() - 1);
                setStartDate(lastMonthDate.toISOString().split('T')[0]);
                setEndDate(currentDate.toISOString().split('T')[0]);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        loadCategories();
    }, [authToken]);

    const handleFetchTransactions = useCallback(async () => {
        try {
            const [expenses, incomes] = await Promise.all([
                fetchExpenses(authToken),
                fetchIncomes(authToken)
            ]);

            const filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
            });

            const filteredIncomes = incomes.filter(income => {
                const incomeDate = new Date(income.date);
                return incomeDate >= new Date(startDate) && incomeDate <= new Date(endDate);
            });

            setExpenseData(filteredExpenses);
            setIncomeData(filteredIncomes);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    }, [startDate, endDate, authToken]);

    const uniqueDates = Array.from(new Set([
        ...expenseData.map(entry => entry.date.split('T')[0]),
        ...incomeData.map(entry => entry.date.split('T')[0])
    ])).sort();

    const getMonthlyAnnotations = () => {
        const monthAnnotations = [];
        const seenMonths = new Set();

        uniqueDates.forEach(dateStr => {
            const date = new Date(dateStr);
            const monthYear = `${date.getMonth()}-${date.getFullYear()}`;

            if (!seenMonths.has(monthYear)) {
                seenMonths.add(monthYear);
                monthAnnotations.push({
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: dateStr,
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                    borderWidth: 1,
                    label: {
                        content: `${date.getMonth() + 1}/${date.getFullYear()}`,
                        enabled: true,
                        position: 'top'
                    }
                });
            }
        });

        return monthAnnotations;
    };

    const chartData = {
        labels: uniqueDates,
        datasets: [
            ...selectedExpenseCategories.map((categoryId, index) => ({
                label: expenseCategories.find(cat => cat.id === categoryId)?.name || `Expense Category ${categoryId}`,
                data: uniqueDates.map(date => {
                    const total = expenseData
                        .filter(exp => exp.category === categoryId && exp.date.startsWith(date))
                        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
                    return total;
                }),
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                fill: false,
            })),
            ...selectedIncomeCategories.map((categoryId, index) => ({
                label: incomeCategories.find(cat => cat.id === categoryId)?.name || `Income Category ${categoryId}`,
                data: uniqueDates.map(date => {
                    const total = incomeData
                        .filter(inc => inc.category === categoryId && inc.date.startsWith(date))
                        .reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
                    return total;
                }),
                borderColor: `hsl(${index * 60 + 120}, 70%, 50%)`,
                fill: false,
            }))
        ]
    };

    const chartOptions = {
        plugins: {
            annotation: {
                annotations: getMonthlyAnnotations()
            }
        }
    };

    if (showCombinedChart) {
        const combinedExpenseData = uniqueDates.map(date => {
            return expenseData
                .filter(exp => exp.date.startsWith(date))
                .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        });

        const combinedIncomeData = uniqueDates.map(date => {
            return incomeData
                .filter(inc => inc.date.startsWith(date))
                .reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
        });

        chartData.datasets = [
            {
                label: t('combinedExpenses'),
                data: combinedExpenseData,
                borderColor: 'hsl(0, 70%, 50%)',
                fill: false,
            },
            {
                label: t('combinedIncomes'),
                data: combinedIncomeData,
                borderColor: 'hsl(120, 70%, 50%)',
                fill: false,
            }
        ];
    }

    return (
        <div className="container mt-4">
            <h2>{t('transactionsReport')}</h2>
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
                        <Form.Group controlId="selectIncomeCategories">
                            <Form.Label>{t('selectIncomeCategories')}</Form.Label>
                            <Form.Control as="select" multiple value={selectedIncomeCategories} onChange={e => setSelectedIncomeCategories([...e.target.selectedOptions].map(opt => Number(opt.value)))}>
                                {incomeCategories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
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
                <Button onClick={handleFetchTransactions}>{t('showReport')}</Button>
            </Form>
            {expenseData.length > 0 || incomeData.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
            ) : (
                <p>{t('noDataForSelectedCategories')}</p>
            )}
        </div>
    );
}

export default TransactionsReportPage;

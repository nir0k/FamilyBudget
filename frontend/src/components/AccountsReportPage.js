// src/components/AccountsReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { fetchAccounts, fetchAccountBalanceHistory } from '../api';
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

// Регистрация компонентов Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function AccountsReportPage() {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [balanceHistory, setBalanceHistory] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCombinedChart, setShowCombinedChart] = useState(false);
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const data = await fetchAccounts(authToken);
                setAccounts(data);
                setSelectedAccounts(data.map(account => account.id));

                const currentDate = new Date();
                const lastMonthDate = new Date();
                lastMonthDate.setMonth(currentDate.getMonth() - 1);

                setStartDate(lastMonthDate.toISOString().split('T')[0]);
                setEndDate(currentDate.toISOString().split('T')[0]);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            }
        };
        loadAccounts();
    }, [authToken]);

    const handleFetchBalanceHistory = useCallback(async () => {
        if (selectedAccounts.length > 0 && startDate && endDate) {
            try {
                const promises = selectedAccounts.map(accountId =>
                    fetchAccountBalanceHistory(accountId, authToken, startDate, endDate)
                );
                const results = await Promise.all(promises);
                setBalanceHistory(results);
            } catch (error) {
                console.error('Failed to fetch balance history:', error);
            }
        }
    }, [selectedAccounts, startDate, endDate, authToken]);

    useEffect(() => {
        handleFetchBalanceHistory();
    }, [handleFetchBalanceHistory]);

    const chartData = {
        labels: balanceHistory.length > 0 ? balanceHistory[0].map(entry => entry.date) : [],
        datasets: showCombinedChart
            ? [{
                label: t('combinedBalance'),
                data: balanceHistory[0].map((_, idx) =>
                    balanceHistory.reduce((sum, history) => sum + history[idx].balance, 0)
                ),
                borderColor: 'hsl(0, 70%, 50%)',
                fill: false
            }]
            : balanceHistory.map((history, index) => ({
                label: accounts.find(acc => acc.id === selectedAccounts[index])?.name || `Account ${selectedAccounts[index]}`,
                data: history.map(entry => entry.balance),
                borderColor: `hsl(${index * 60}, 70%, 50%)`,
                fill: false
            }))
    };

    return (
        <div className="container mt-4">
            <h2>{t('accountsReport')}</h2>
            <Form>
                <Row className="align-items-center mb-3">
                    <Col md={8}>
                        <Form.Group controlId="selectAccounts">
                            <Form.Label>{t('selectAccounts')}</Form.Label>
                            <Form.Control as="select" multiple value={selectedAccounts} onChange={e => setSelectedAccounts([...e.target.selectedOptions].map(opt => Number(opt.value)))}>
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="startDate" className="mb-2">
                            <Form.Label>{t('startDate')}</Form.Label>
                            <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="endDate">
                            <Form.Label>{t('endDate')}</Form.Label>
                            <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group controlId="showCombinedChart" className="mb-3">
                    <Form.Check type="checkbox" label={t('showCombinedChart')} checked={showCombinedChart} onChange={e => setShowCombinedChart(e.target.checked)} />
                </Form.Group>
                <Button onClick={handleFetchBalanceHistory}>{t('showReport')}</Button>
            </Form>
            {balanceHistory.length > 0 && (
                <Line data={chartData} />
            )}
        </div>
    );
}

export default AccountsReportPage;

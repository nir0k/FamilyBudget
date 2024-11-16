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

// Register Chart.js components
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
                    fetchAccountBalanceHistory(accountId, authToken)
                        .then(data => ({
                            accountId,
                            data: data.filter(entry => {
                                const entryDate = new Date(entry.date);
                                const startDateTime = new Date(startDate);
                                const endDateTime = new Date(new Date(endDate).setHours(23, 59, 59, 999)); // Устанавливаем конец дня для корректной фильтрации
                                return entryDate >= startDateTime && entryDate <= endDateTime;
                            })
                        }))
                        .catch(() => ({ accountId, data: [] }))
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

    const accountsWithData = balanceHistory.filter(history => history.data.length > 0);
    const accountsWithoutData = balanceHistory.filter(history => history.data.length === 0);

    const chartData = {
        labels: accountsWithData.length > 0 ? accountsWithData[0].data.map(entry => entry.date) : [],
        datasets: showCombinedChart
            ? [{
                label: t('combinedBalance'),
                data: accountsWithData[0].data.map((_, idx) =>
                    accountsWithData.reduce((sum, history) => sum + (history.data[idx]?.balance || 0), 0)
                ),
                borderColor: 'hsl(0, 70%, 50%)',
                fill: false
            }]
            : accountsWithData.map((history, index) => ({
                label: accounts.find(acc => acc.id === history.accountId)?.name || `Account ${history.accountId}`,
                data: history.data.map(entry => entry.balance),
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
            {accountsWithData.length > 0 ? (
                <Line data={chartData} />
            ) : (
                <p>{t('noDataAvailable')}</p>
            )}
            {accountsWithoutData.length > 0 && (
                <div className="mt-3">
                    <p>{t('noDataForAccounts')}: {accountsWithoutData.map(history => accounts.find(acc => acc.id === history.accountId)?.name || `Account ${history.accountId}`).join(', ')}</p>
                </div>
            )}
        </div>
    );
}

export default AccountsReportPage;

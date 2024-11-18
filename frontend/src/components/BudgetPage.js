import React, { useEffect, useState } from 'react';
import { Table, Alert, Spinner, Accordion, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { fetchBudgets, fetchExpenseCategories, fetchIncomeCategories, updateBudget } from '../api';

const BudgetPage = () => {
    const { t } = useTranslation();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editBudget, setEditBudget] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadBudgetsAndCategories = async () => {
            try {
                const [budgetData, expenseCategories, incomeCategories] = await Promise.all([
                    fetchBudgets(authToken),
                    fetchExpenseCategories(authToken),
                    fetchIncomeCategories(authToken),
                ]);

                const categoryMap = [...expenseCategories, ...incomeCategories].reduce((acc, category) => {
                    acc[category.id] = category.name;
                    return acc;
                }, {});

                setCategories(categoryMap);
                setBudgets(budgetData.results);
            } catch (err) {
                setError(`${t('failedToFetchBudgets')}: ${err.message}`);
                console.error('Error fetching budgets or categories:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBudgetsAndCategories();
    }, [authToken, t]);

    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
            const newDirection = prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
            return { key, direction: newDirection };
        });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? '↑' : '↓';
        }
        return '';
    };

    const sortedCategories = (budgetCategories) => {
        return [...budgetCategories].sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'name') {
                aValue = categories[a.category]?.toLowerCase() || '';
                bValue = categories[b.category]?.toLowerCase() || '';
            } else if (sortConfig.key === 'amount') {
                aValue = parseFloat(a.amount);
                bValue = parseFloat(b.amount);
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const startEditing = (budget) => {
        setEditBudget({
            ...budget,
            budget_categories: [...budget.budget_categories],
        });
    };

    const cancelEditing = () => {
        setEditBudget(null);
    };

    const handleEditChange = (field, value) => {
        setEditBudget((prev) => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (index, field, value) => {
        const updatedCategories = [...editBudget.budget_categories];
        updatedCategories[index][field] = value;
        setEditBudget((prev) => ({ ...prev, budget_categories: updatedCategories }));
    };

    const addCategory = () => {
        setEditBudget((prev) => ({
            ...prev,
            budget_categories: [...prev.budget_categories, { id: null, category: '', amount: '0.00' }],
        }));
    };

    const removeCategory = (index) => {
        const updatedCategories = [...editBudget.budget_categories];
        updatedCategories.splice(index, 1);
        setEditBudget((prev) => ({ ...prev, budget_categories: updatedCategories }));
    };

    const saveChanges = async () => {
        try {
            await updateBudget(authToken, editBudget.id, editBudget);
            setBudgets((prevBudgets) =>
                prevBudgets.map((budget) => (budget.id === editBudget.id ? editBudget : budget))
            );
            setEditBudget(null);
        } catch (err) {
            console.error('Failed to save changes:', err);
            setError(t('failedToSaveChanges'));
        }
    };

    if (loading) {
        return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="container mt-4">
            <h2>{t('budgets')}</h2>
            {budgets.length === 0 ? (
                <Alert variant="info">{t('noBudgetsAvailable')}</Alert>
            ) : (
                <Accordion defaultActiveKey={null}>
                    {budgets.map((budget, index) => {
                        const remaining = parseFloat(budget.total_amount) - parseFloat(budget.total_spent);
                        const categoriesToSort = sortedCategories(budget.budget_categories);

                        return (
                            <Accordion.Item eventKey={index.toString()} key={budget.id}>
                                <Accordion.Header>
                                    <span className="me-3">{budget.name}</span>
                                    <small className="text-muted">
                                        {t('budgetDates', {
                                            start: budget.start_date,
                                            end: budget.end_date,
                                        })}
                                    </small>
                                </Accordion.Header>
                                <Accordion.Body>
                                    {editBudget && editBudget.id === budget.id ? (
                                            <Form>
                                            {/* Редактирование полей бюджета */}
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('budgetName')}</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editBudget.name}
                                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('budgetAmount')}</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={editBudget.total_amount}
                                                    onChange={(e) => handleEditChange('total_amount', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('budgetStartDate')}</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={editBudget.start_date}
                                                    onChange={(e) => handleEditChange('start_date', e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('budgetEndDate')}</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={editBudget.end_date}
                                                    onChange={(e) => handleEditChange('end_date', e.target.value)}
                                                />
                                            </Form.Group>
                                        
                                            {/* Редактирование категорий */}
                                            <h5 className="mt-4">{t('categories')}</h5>
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th>{t('category')}</th>
                                                        <th>{t('amount')}</th>
                                                        <th>{t('actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {editBudget.budget_categories.map((category, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <Form.Control
                                                                    as="select"
                                                                    value={category.category}
                                                                    onChange={(e) =>
                                                                        handleCategoryChange(idx, 'category', e.target.value)
                                                                    }
                                                                >
                                                                    <option value="">{t('selectCategory')}</option>
                                                                    {Object.entries(categories).map(([id, name]) => (
                                                                        <option key={id} value={id}>
                                                                            {name}
                                                                        </option>
                                                                    ))}
                                                                </Form.Control>
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    value={category.amount}
                                                                    onChange={(e) =>
                                                                        handleCategoryChange(idx, 'amount', e.target.value)
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    variant="danger"
                                                                    onClick={() => removeCategory(idx)}
                                                                >
                                                                    {t('delete')}
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <Button variant="success" onClick={addCategory}>
                                                {t('addCategory')}
                                            </Button>
                                        
                                            {/* Кнопки сохранения или отмены */}
                                            <div className="mt-3">
                                                <Button variant="primary" onClick={saveChanges} className="me-2">
                                                    {t('saveChanges')}
                                                </Button>
                                                <Button variant="secondary" onClick={cancelEditing}>
                                                    {t('cancel')}
                                                </Button>
                                            </div>
                                        </Form>                                    
                                    ) : (
                                        <>
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th>{t('budgetAmount')}</th>
                                                        <th>{t('totalSpent')}</th>
                                                        <th>{t('remaining')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{budget.total_amount}</td>
                                                        <td>{budget.total_spent.toFixed(2)}</td>
                                                        <td
                                                            className={
                                                                remaining >= 0 ? 'text-success' : 'text-danger'
                                                            }
                                                        >
                                                            {remaining.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <h5 className="mt-4">{t('categories')}</h5>
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => handleSort('name')}>
                                                            {t('category')} {getSortIcon('name')}
                                                        </th>
                                                        <th onClick={() => handleSort('amount')}>
                                                            {t('amount')} {getSortIcon('amount')}
                                                        </th>
                                                        <th>{t('spent')}</th>
                                                        <th>{t('remaining')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedCategories(budget.budget_categories).map((category) => {
                                                        const categoryName = categories[category.category] || t('unknownCategory');
                                                        const categoryRemaining = parseFloat(category.amount);

                                                        return (
                                                            <tr key={category.id}>
                                                                <td>{categoryName}</td>
                                                                <td>{category.amount}</td>
                                                                <td>0.00</td> {/* Spent пока всегда 0 */}
                                                                <td
                                                                    className={
                                                                        categoryRemaining >= 0
                                                                            ? 'text-success'
                                                                            : 'text-danger'
                                                                    }
                                                                >
                                                                    {categoryRemaining.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                            <Button variant="warning" onClick={() => startEditing(budget)}>
                                                {t('edit')}
                                            </Button>
                                        </>
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
};

export default BudgetPage;

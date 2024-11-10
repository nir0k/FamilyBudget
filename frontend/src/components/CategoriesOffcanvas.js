import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Offcanvas, Button, Form, Table, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { fetchIncomeCategories, fetchExpenseCategories, updateCategory, deleteCategory, addCategory } from '../api';
import './CurrencyOffcanvas.css';

function CategoriesOffcanvas({ show, handleClose }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [selectedType, setSelectedType] = useState('expense'); // 'expense' or 'income'
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [editMode, setEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null); // Stores the category object for deletion
    const authToken = localStorage.getItem('authToken');
    const contentRef = useRef(null);
    const [panelWidth, setPanelWidth] = useState('auto');
    const [isWidthCalculated, setIsWidthCalculated] = useState(false);

    const loadCategories = useCallback(async () => {
        try {
            if (selectedType === 'income') {
                const data = await fetchIncomeCategories(authToken);
                setCategories(data);
            } else {
                const data = await fetchExpenseCategories(authToken);
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, [selectedType, authToken]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        if (show && contentRef.current && !isWidthCalculated) {
            const contentWidth = contentRef.current.scrollWidth;
            const calculatedWidth = Math.min(Math.max(contentWidth, 300), 1000);
            setPanelWidth(`${calculatedWidth}px`);
            setIsWidthCalculated(true);
        }
    }, [show, isWidthCalculated]);

    useEffect(() => {
        if (!show) {
            setIsWidthCalculated(false);
        }
    }, [show]);

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleEditCategory = (category) => {
        setNewCategory(category);
        setEditMode(true);
    };

    const handleSaveCategory = async () => {
        try {
            if (editMode) {
                await updateCategory(newCategory, selectedType, authToken);
                setEditMode(false);
            } else {
                await addCategory(newCategory, selectedType, authToken);
            }
            setNewCategory({ name: '', description: '' });
            loadCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };

    const handleCancelEdit = () => {
        setNewCategory({ name: '', description: '' });
        setEditMode(false);
    };

    const handleDeleteCategory = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDeleteCategory = async () => {
        try {
            if (categoryToDelete) {
                await deleteCategory(categoryToDelete.id, selectedType, authToken);
                loadCategories();
                setShowDeleteModal(false);
                setCategoryToDelete(null);
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            className="dynamic-width-panel"
            style={{ width: panelWidth }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t('categories')}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body ref={contentRef}>
                <Form.Group controlId="categoryTypeSelect" className="mb-3">
                    <Form.Label>{t('selectCategoryType')}</Form.Label>
                    <Form.Select value={selectedType} onChange={handleTypeChange}>
                        <option value="expense">{t('expenseCategories')}</option>
                        <option value="income">{t('incomeCategories')}</option>
                    </Form.Select>
                </Form.Group>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>{t('name')}</th>
                            <th>{t('description')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.description}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => handleEditCategory(category)}
                                        className="me-2"
                                    >
                                        {t('edit')}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(category)}
                                    >
                                        {t('delete')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Form>
                    <Form.Group controlId="newCategoryName" className="mb-3">
                        <Form.Label>{t('name')}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={t('enterName')}
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group controlId="newCategoryDescription" className="mb-3">
                        <Form.Label>{t('description')}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={t('enterDescription')}
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        />
                    </Form.Group>
                    <div className="d-flex">
                        <Button variant="primary" onClick={handleSaveCategory} className="me-2">
                            {editMode ? t('saveChanges') : t('addCategory')}
                        </Button>
                        {editMode && (
                            <Button variant="secondary" onClick={handleCancelEdit}>
                                {t('cancel')}
                            </Button>
                        )}
                    </div>
                </Form>

                {/* Modal window for delete confirmation */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('confirmDelete')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {categoryToDelete && (
                            <p>
                                {t('confirmDeleteMessage', {
                                    itemType: selectedType === 'income' ? t('incomeCategory') : t('expenseCategory'),
                                    name: categoryToDelete.name
                                })}
                            </p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="danger" onClick={confirmDeleteCategory}>
                            {t('delete')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default CategoriesOffcanvas;

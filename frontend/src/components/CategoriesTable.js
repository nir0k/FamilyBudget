import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { fetchIncomeCategories, fetchExpenseCategories, deleteCategory } from '../api';
import CategoryModal from './CategoryModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function CategoriesTable({ selectedType }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const authToken = localStorage.getItem('authToken');

    // Загружаем категории при изменении типа или токена
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data =
                    selectedType === 'income'
                        ? await fetchIncomeCategories(authToken)
                        : await fetchExpenseCategories(authToken);
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        loadCategories();
    }, [selectedType, authToken]);

    const handleEdit = (category) => {
        setEditCategory(category);
        setShowModal(true);
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDeleteCategory = async () => {
        try {
            if (categoryToDelete) {
                await deleteCategory(categoryToDelete.id, selectedType, authToken);
                setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
                setShowDeleteModal(false);
                setCategoryToDelete(null);
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    return (
        <>
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
                                    onClick={() => handleEdit(category)}
                                    className="me-2"
                                >
                                    {t('edit')}
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(category)}
                                >
                                    {t('delete')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <CategoryModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                initialData={editCategory}
                selectedType={selectedType}
                reloadCategories={() => setCategories([])} // Загрузка категорий после обновления
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={confirmDeleteCategory}
                item={categoryToDelete}
                itemType={selectedType === 'income' ? 'incomeCategory' : 'expenseCategory'}
            />
        </>
    );
}

export default CategoriesTable;

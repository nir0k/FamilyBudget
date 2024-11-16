import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { addCategory, updateCategory } from '../api';

function CategoryModal({ show, handleClose, initialData, selectedType, reloadCategories }) {
    const { t } = useTranslation();
    const [category, setCategory] = useState({ name: '', description: '' });
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        if (initialData) {
            setCategory(initialData);
        } else {
            setCategory({ name: '', description: '' });
        }
    }, [initialData]);

    const handleSave = async () => {
        try {
            if (initialData) {
                await updateCategory(category, selectedType, authToken);
            } else {
                await addCategory(category, selectedType, authToken);
            }
            handleClose();
            reloadCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {initialData ? t('editCategory') : t('addCategory')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="categoryName" className="mb-3">
                        <Form.Label>{t('name')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={category.name}
                            onChange={(e) => setCategory({ ...category, name: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group controlId="categoryDescription" className="mb-3">
                        <Form.Label>{t('description')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={category.description}
                            onChange={(e) => setCategory({ ...category, description: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    {t('cancel')}
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    {t('saveChanges')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategoryModal;

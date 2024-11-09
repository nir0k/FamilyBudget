// src/components/AccountTypeModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function AccountTypeModal({ show, handleClose, handleSave, initialData }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
        } else {
            setName('');
        }
    }, [initialData]);

    const handleSubmit = () => {
        handleSave({ name });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{initialData ? t('editAccountType') : t('addAccountType')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formName">
                        <Form.Label>{t('name')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    {t('cancel')}
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    {t('saveChanges')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AccountTypeModal;

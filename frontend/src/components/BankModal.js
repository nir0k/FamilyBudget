// src/components/BankModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function BankModal({ show, handleClose, handleSave, initialData }) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCountry(initialData.country);
        } else {
            setName('');
            setCountry('');
        }
    }, [initialData]);

    const handleSubmit = () => {
        handleSave({ name, country });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{initialData ? t('editBank') : t('addBank')}</Modal.Title>
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
                    <Form.Group controlId="formCountry" className="mt-3">
                        <Form.Label>{t('country')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
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

export default BankModal;

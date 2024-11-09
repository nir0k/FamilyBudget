// src/components/CurrencyModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function CurrencyModal({ show, handleClose, handleSave, initialData }) {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setName(initialData.name);
            setSymbol(initialData.symbol);
        } else {
            setCode('');
            setName('');
            setSymbol('');
        }
    }, [initialData]);

    const handleSubmit = () => {
        handleSave({ code, name, symbol });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{initialData ? t('editCurrency') : t('addCurrency')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formCode">
                        <Form.Label>{t('code')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formName">
                        <Form.Label>{t('name')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formSymbol">
                        <Form.Label>{t('symbol')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
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

export default CurrencyModal;

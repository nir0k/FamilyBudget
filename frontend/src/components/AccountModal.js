// src/components/AccountModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function AccountModal({ show, handleClose, handleSave, initialData, accountTypes, banks, currencies }) {
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [accountType, setAccountType] = useState('');
    const [bank, setBank] = useState('');
    const [currency, setCurrency] = useState('');
    const [balance, setBalance] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setAccountType(initialData.account_type);
            setBank(initialData.bank);
            setCurrency(initialData.currency);
            setBalance(initialData.balance);
        } else {
            setName('');
            setAccountType('');
            setBank('');
            setCurrency('');
            setBalance('');
        }
    }, [initialData]);

    const handleSubmit = () => {
        handleSave({
            name,
            account_type: accountType,
            bank,
            currency,
            balance,
        });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{initialData ? t('editAccount') : t('addAccount')}</Modal.Title>
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

                    <Form.Group controlId="formAccountType" className="mt-3">
                        <Form.Label>{t('accountType')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                        >
                            <option value="">{t('selectAccountType')}</option>
                            {accountTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formBank" className="mt-3">
                        <Form.Label>{t('bank')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={bank}
                            onChange={(e) => setBank(e.target.value)}
                        >
                            <option value="">{t('selectBank')}</option>
                            {banks.map((bank) => (
                                <option key={bank.id} value={bank.id}>
                                    {bank.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formCurrency" className="mt-3">
                        <Form.Label>{t('currency')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="">{t('selectCurrency')}</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                    {currency.code.toUpperCase()} - {currency.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formBalance" className="mt-3">
                        <Form.Label>{t('balance')}</Form.Label>
                        <Form.Control
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
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

export default AccountModal;

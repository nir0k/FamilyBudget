// src/components/CurrencyTable.js
import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { fetchCurrencies, addCurrency, updateCurrency, deleteCurrency } from '../api';
import { useTranslation } from 'react-i18next';
import CurrencyModal from './CurrencyModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function CurrencyTable() {
    const { t } = useTranslation();
    const [currencies, setCurrencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(null);

    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                const data = await fetchCurrencies(authToken);
                setCurrencies(data);
            } catch (error) {
                console.error('Failed to fetch currencies:', error);
            }
        };
        loadCurrencies();
    }, [authToken]);

    const handleAdd = () => {
        setSelectedCurrency(null);
        setShowCurrencyModal(true);
    };

    const handleEdit = (currency) => {
        setSelectedCurrency(currency);
        setShowCurrencyModal(true);
    };

    const handleDelete = (currency) => {
        setSelectedCurrency(currency);
        setShowDeleteModal(true);
    };

    const handleSave = async (currencyData) => {
        try {
            if (selectedCurrency) {
                // Update currency
                const updatedCurrency = await updateCurrency(selectedCurrency.id, currencyData, authToken);
                setCurrencies((prevCurrencies) =>
                    prevCurrencies.map((currency) =>
                        currency.id === selectedCurrency.id ? updatedCurrency : currency
                    )
                );
            } else {
                // Add new currency
                const newCurrency = await addCurrency(currencyData, authToken);
                setCurrencies([...currencies, newCurrency]);
            }
            setShowCurrencyModal(false);
        } catch (error) {
            console.error('Failed to save currency:', error);
        }
    };

    const handleConfirmDelete = async (currencyId) => {
        try {
            await deleteCurrency(currencyId, authToken);
            setCurrencies(currencies.filter((currency) => currency.id !== currencyId));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete currency:', error);
        }
    };

    const filteredCurrencies = currencies.filter(currency =>
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.includes(searchTerm)
    );

    return (
        <div>
            <Form.Control
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
            />

            <Button variant="primary" onClick={handleAdd} className="mb-3">
                {t('addCurrency')}
            </Button>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>{t('code')}</th>
                            <th>{t('name')}</th>
                            <th>{t('symbol')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCurrencies.map(currency => (
                            <tr key={currency.id}>
                                <td>{currency.code.toUpperCase()}</td>
                                <td>{currency.name}</td>
                                <td>{currency.symbol}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(currency)}>
                                        {t('edit')}
                                    </Button>{' '}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(currency)}>
                                        {t('delete')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <CurrencyModal
                show={showCurrencyModal}
                handleClose={() => setShowCurrencyModal(false)}
                handleSave={handleSave}
                initialData={selectedCurrency}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                item={selectedCurrency || {}}
                itemType="currency"
            />

        </div>
    );
}

export default CurrencyTable;

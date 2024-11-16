// src/components/BanksTable.js

import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { fetchBanks, addBank, updateBank, deleteBank } from '../api';
import { useTranslation } from 'react-i18next';
import BankModal from './BankModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function BanksTable() {
    const { t } = useTranslation();
    const [banks, setBanks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBankModal, setShowBankModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);

    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadBanks = async () => {
            try {
                // Use updated fetchBanks to handle paginated data
                const data = await fetchBanks(authToken);
                setBanks(data);
            } catch (error) {
                console.error('Failed to fetch banks:', error);
            }
        };
        loadBanks();
    }, [authToken]);

    const handleAdd = () => {
        setSelectedBank(null);
        setShowBankModal(true);
    };

    const handleEdit = (bank) => {
        setSelectedBank(bank);
        setShowBankModal(true);
    };

    const handleDelete = (bank) => {
        setSelectedBank(bank);
        setShowDeleteModal(true);
    };

    const handleSave = async (bankData) => {
        try {
            if (selectedBank) {
                // Update an existing bank
                const updatedBank = await updateBank(selectedBank.id, bankData, authToken);
                setBanks((prevBanks) =>
                    prevBanks.map((bank) =>
                        bank.id === selectedBank.id ? updatedBank : bank
                    )
                );
            } else {
                // Add a new bank
                const newBank = await addBank(bankData, authToken);
                setBanks([...banks, newBank]);
            }
            setShowBankModal(false);
        } catch (error) {
            console.error('Failed to save bank:', error);
        }
    };

    const handleConfirmDelete = async (bankId) => {
        try {
            await deleteBank(bankId, authToken);
            setBanks(banks.filter((bank) => bank.id !== bankId));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete bank:', error);
        }
    };

    const filteredBanks = banks.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.country.toLowerCase().includes(searchTerm.toLowerCase())
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
                {t('addBank')}
            </Button>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>{t('name')}</th>
                            <th>{t('country')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBanks.map(bank => (
                            <tr key={bank.id}>
                                <td>{bank.name}</td>
                                <td>{bank.country}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(bank)}>
                                        {t('edit')}
                                    </Button>{' '}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(bank)}>
                                        {t('delete')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <BankModal
                show={showBankModal}
                handleClose={() => setShowBankModal(false)}
                handleSave={handleSave}
                initialData={selectedBank}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                item={selectedBank || {}}
                itemType="bank"
            />
        </div>
    );
}

export default BanksTable;

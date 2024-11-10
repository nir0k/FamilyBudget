// src/components/AccountTypesTable.js

import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { fetchAccountTypes, addAccountType, updateAccountType, deleteAccountType } from '../api';
import { useTranslation } from 'react-i18next';
import AccountTypeModal from './AccountTypeModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function AccountTypesTable() {
    const { t } = useTranslation();
    const [accountTypes, setAccountTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAccountType, setSelectedAccountType] = useState(null);

    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadAccountTypes = async () => {
            try {
                const data = await fetchAccountTypes(authToken);
                setAccountTypes(data);
            } catch (error) {
                console.error('Failed to fetch account types:', error);
            }
        };
        loadAccountTypes();
    }, [authToken]);

    const handleAdd = () => {
        setSelectedAccountType(null);
        setShowAccountTypeModal(true);
    };

    const handleEdit = (accountType) => {
        setSelectedAccountType(accountType);
        setShowAccountTypeModal(true);
    };

    const handleDelete = (accountType) => {
        setSelectedAccountType(accountType);
        setShowDeleteModal(true);
    };

    const handleSave = async (accountTypeData) => {
        try {
            if (selectedAccountType) {
                const updatedAccountType = await updateAccountType(selectedAccountType.id, accountTypeData, authToken);
                setAccountTypes((prevAccountTypes) =>
                    prevAccountTypes.map((accountType) =>
                        accountType.id === selectedAccountType.id ? updatedAccountType : accountType
                    )
                );
            } else {
                const newAccountType = await addAccountType(accountTypeData, authToken);
                setAccountTypes([...accountTypes, newAccountType]);
            }
            setShowAccountTypeModal(false);
        } catch (error) {
            console.error('Failed to save account type:', error);
        }
    };

    const handleConfirmDelete = async (accountTypeId) => {
        try {
            await deleteAccountType(accountTypeId, authToken);
            setAccountTypes(accountTypes.filter((accountType) => accountType.id !== accountTypeId));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete account type:', error);
        }
    };

    const filteredAccountTypes = accountTypes.filter(accountType =>
        accountType.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                {t('addAccountType')}
            </Button>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>{t('name')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccountTypes.map(accountType => (
                            <tr key={accountType.id}>
                                <td>{accountType.name}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(accountType)}>
                                        {t('edit')}
                                    </Button>{' '}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(accountType)}>
                                        {t('delete')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <AccountTypeModal
                show={showAccountTypeModal}
                handleClose={() => setShowAccountTypeModal(false)}
                handleSave={handleSave}
                initialData={selectedAccountType}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                item={selectedAccountType || {}}
                itemType="accountType"
            />
        </div>
    );
}

export default AccountTypesTable;

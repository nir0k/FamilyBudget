// src/components/AccountsTable.js

import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { fetchAccounts, addAccount, updateAccount, deleteAccount, fetchAccountTypes, fetchBanks, fetchCurrencies } from '../api';
import { useTranslation } from 'react-i18next';
import AccountModal from './AccountModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

function AccountsTable() {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const [accountTypes, setAccountTypes] = useState([]);
    const [banks, setBanks] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load accounts
                const accountsData = await fetchAccounts(authToken);
                setAccounts(accountsData);

                // Load related data
                const [accountTypesData, banksData, currenciesData] = await Promise.all([
                    fetchAccountTypes(authToken),
                    fetchBanks(authToken),
                    fetchCurrencies(authToken),
                ]);
                setAccountTypes(accountTypesData);
                setBanks(banksData);
                setCurrencies(currenciesData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        loadData();
    }, [authToken]);

    const handleAdd = () => {
        setSelectedAccount(null);
        setShowAccountModal(true);
    };

    const handleEdit = (account) => {
        setSelectedAccount(account);
        setShowAccountModal(true);
    };

    const handleDelete = (account) => {
        setSelectedAccount(account);
        setShowDeleteModal(true);
    };

    const handleSave = async (accountData) => {
        try {
            if (selectedAccount) {
                // Update account
                const updatedAccount = await updateAccount(selectedAccount.id, accountData, authToken);
                setAccounts((prevAccounts) =>
                    prevAccounts.map((account) =>
                        account.id === selectedAccount.id ? updatedAccount : account
                    )
                );
            } else {
                // Add new account
                const newAccount = await addAccount(accountData, authToken);
                setAccounts([...accounts, newAccount]);
            }
            setShowAccountModal(false);
        } catch (error) {
            console.error('Failed to save account:', error);
        }
    };

    const handleConfirmDelete = async (accountId) => {
        try {
            await deleteAccount(accountId, authToken);
            setAccounts(accounts.filter((account) => account.id !== accountId));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    const filteredAccounts = accounts.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Functions to get the names of related entities
    const getAccountTypeName = (id) => {
        const accountType = accountTypes.find(at => at.id === id);
        return accountType ? accountType.name : '';
    };

    const getBankName = (id) => {
        const bank = banks.find(b => b.id === id);
        return bank ? bank.name : '';
    };

    const getCurrencyCode = (id) => {
        const currency = currencies.find(c => c.id === id);
        return currency ? currency.code.toUpperCase() : '';
    };

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
                {t('addAccount')}
            </Button>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>{t('name')}</th>
                            <th>{t('accountType')}</th>
                            <th>{t('bank')}</th>
                            <th>{t('currency')}</th>
                            <th>{t('balance')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.map(account => (
                            <tr key={account.id}>
                                <td>{account.name}</td>
                                <td>{getAccountTypeName(account.account_type)}</td>
                                <td>{getBankName(account.bank)}</td>
                                <td>{getCurrencyCode(account.currency)}</td>
                                <td>{account.balance}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => handleEdit(account)}>
                                        {t('edit')}
                                    </Button>{' '}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(account)}>
                                        {t('delete')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <AccountModal
                show={showAccountModal}
                handleClose={() => setShowAccountModal(false)}
                handleSave={handleSave}
                initialData={selectedAccount}
                accountTypes={accountTypes}
                banks={banks}
                currencies={currencies}
            />

            <ConfirmDeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                item={selectedAccount || {}}
                itemType="account"
            />
        </div>
    );
}

export default AccountsTable;

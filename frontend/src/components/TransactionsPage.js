// TransactionsPage.js
import React, { useEffect, useState } from 'react';
import { Table, Form, Pagination, Dropdown, ButtonGroup, InputGroup, Button, Modal } from 'react-bootstrap';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { FaSort, FaSortUp, FaSortDown, FaPlus, FaTrash, FaEdit, FaTrashAlt } from 'react-icons/fa';
import {
  fetchTransactions,
  fetchCurrencies,
  fetchExpenseCategories,
  fetchIncomeCategories,
  fetchAccounts,
} from '../api';
import { addExpense, addIncome, deleteTransaction, updateTransaction } from '../api/transaction';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


function TransactionsPage({ isDarkTheme }) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState([]);
  const authToken = localStorage.getItem('authToken');
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const availableFields = React.useMemo(
    () => [
      { key: 'datetime_from', label: t('dateFrom'), type: 'datetime' },
      { key: 'datetime_to', label: t('dateTo'), type: 'datetime' },
      { key: 'transaction_type', label: t('transactionType'), type: 'dropdown' },
      { key: 'account', label: t('account'), type: 'dropdown' },
      { key: 'category', label: t('category'), type: 'dropdown' },
    ],
    [t]
  );

  const handleDeleteModalShow = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleDeleteModalClose = () => {
      setTransactionToDelete(null);
      setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async (transactionId) => {
      try {
          await deleteTransaction(authToken, transactionId, transactionToDelete.transaction_type);
          setTransactions(transactions.filter((tx) => tx.id !== transactionId));
          setShowDeleteModal(false);
      } catch (error) {
          console.error('Failed to delete transaction:', error);
          setShowDeleteModal(false);
      }
  };
  

  const [currencies, setCurrencies] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [transactionTypes] = useState([
    { value: 'income', label: t('income') },
    { value: 'expense', label: t('expense') },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date(),
    amount: '',
    currency: '',
    category: '',
    account: '',
    description: '',
    transaction_type: 'expense', // Default to 'expense'
  });
  const [editTransaction, setEditTransaction] = useState(null);

  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const handleEditModalShow = (transaction) => {
    setNewTransaction(transaction);
    setEditTransaction(transaction);
    setShowModal(true);
  };

  // const handleDeleteTransaction = async (transactionId, transactionType) => {
  //   if (window.confirm(t('confirmDeleteTransaction'))) {
  //     try {
  //       await deleteTransaction(authToken, transactionId, transactionType);
  //       setTransactions(transactions.filter(tx => tx.id !== transactionId));
  //       setCurrentPage(1); // Reset to first page after deleting
  //     } catch (error) {
  //       console.error('Failed to delete transaction:', error);
  //       if (error.response && error.response.status === 403) {
  //         alert(t('deleteFailedPermission'));
  //       } else {
  //         alert(t('deleteFailed'));
  //       }
  //     }
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setNewTransaction((prev) => ({ ...prev, date }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setNewTransaction((prev) => ({ ...prev, [name]: selectedOption.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTransaction) {
        await updateTransaction(authToken, newTransaction);
      } else {
        if (newTransaction.transaction_type === 'expense') {
          await addExpense(authToken, newTransaction);
        } else {
          await addIncome(authToken, newTransaction);
        }
      }
      setShowModal(false);
      setCurrentPage(1); // Reset to first page after adding or editing
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  // Загрузка начальных данных для выпадающих списков
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [currencyData, expenseCategoryData, incomeCategoryData, accountData] = await Promise.all([
          fetchCurrencies(authToken),
          fetchExpenseCategories(authToken),
          fetchIncomeCategories(authToken),
          fetchAccounts(authToken),
        ]);

        setCurrencies(
          currencyData.reduce((map, currency) => ({ ...map, [currency.id]: currency.code }), {})
        );
        setExpenseCategories(expenseCategoryData.map((category) => ({
          value: category.id,
          label: category.name,
        })));
        setIncomeCategories(incomeCategoryData.map((category) => ({
          value: category.id,
          label: category.name,
        })));
        setAccounts(
          accountData.map((account) => ({
            value: account.id,
            label: account.name,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    loadInitialData();
  }, [authToken]);

  const getFilteredCategories = () => {
    return newTransaction.transaction_type === 'expense' ? expenseCategories : incomeCategories;
  };

  // Загрузка транзакций на основе текущего состояния (пагинация, сортировка, фильтрация)
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const ordering = `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`;
        const params = {
          offset: (currentPage - 1) * rowsPerPage,
          limit: rowsPerPage,
          ordering,
          ...filters.reduce((acc, filter) => {
            acc[filter.field] = filter.value;
            return acc;
          }, {}),
        };

        const data = await fetchTransactions(authToken, params);

        setTransactions(data.results);
        setTotalCount(data.count);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };

    loadTransactions();
  }, [authToken, currentPage, rowsPerPage, sortConfig, filters]);

  // Обработка сортировки
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  // Добавление нового фильтра
  const addFilter = () => {
    setFilters([...filters, { field: 'description', value: '' }]);
  };

  // Обновление фильтра
  const updateFilter = (index, field, value) => {
    const updatedFilters = [...filters];
    if (field) updatedFilters[index].field = field;

    if (value !== undefined) {
      if (updatedFilters[index].field.includes('datetime')) {
        if (value instanceof Date && !isNaN(value.getTime())) {
          const year = value.getFullYear();
          const month = String(value.getMonth() + 1).padStart(2, '0');
          const day = String(value.getDate()).padStart(2, '0');
          const hours = String(value.getHours()).padStart(2, '0');
          const minutes = String(value.getMinutes()).padStart(2, '0');
          const seconds = String(value.getSeconds()).padStart(2, '0');

          const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
          updatedFilters[index].value = formattedDate;
        } else if (value === '' || value === null) {
          updatedFilters[index].value = '';
        } else {
          console.error('Invalid date selected:', value);
          return;
        }
      } else {
        updatedFilters[index].value = value;
      }
    } else if (field) {
      // Если только поле изменилось
      if (updatedFilters[index].field.includes('datetime')) {
        updatedFilters[index].value = '';
      } else {
        updatedFilters[index].value = '';
      }
    }

    setFilters(updatedFilters);
  };

  // Удаление фильтра
  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Обработка изменения количества строк на странице
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1); // Сброс на первую страницу
  };

  // Отрисовка фильтров
  const renderFilters = () =>
    filters.map((filter, index) => {
      const fieldConfig = availableFields.find((f) => f.key === filter.field) || {};
      return (
        <InputGroup className="mb-2" key={index}>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="outline-secondary">
              {fieldConfig.label || t('field')}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {availableFields.map((field) => (
                <Dropdown.Item key={field.key} onClick={() => updateFilter(index, field.key)}>
                  {field.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          {fieldConfig.type === 'datetime' ? (
            <DatePicker
              selected={filter.value ? new Date(filter.value) : null}
              onChange={(date) => updateFilter(index, null, date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption={t('time')}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText={t('selectDateAndTime')}
              isClearable
            />
          ) : fieldConfig.type === 'dropdown' ? (
            <Select
            options={
            filter.field === 'transaction_type'
                ? transactionTypes
                : filter.field === 'account'
                ? accounts
                : getFilteredCategories()
            }
            value={
            filter.value
                ? (
                    filter.field === 'transaction_type'
                    ? transactionTypes
                    : filter.field === 'account'
                    ? accounts
                    : getFilteredCategories()
                ).find((option) => option.value === filter.value)
                : null
            }
            onChange={(selected) => updateFilter(index, null, selected ? selected.value : '')}
            isClearable
            placeholder={t('selectValue')}
            styles={{
            control: (provided) => ({
                ...provided,
                backgroundColor: isDarkTheme ? '#343a40' : provided.backgroundColor,
                borderColor: isDarkTheme ? '#495057' : provided.borderColor,
                color: isDarkTheme ? '#fff' : provided.color,
            }),
            menu: (provided) => ({
                ...provided,
                backgroundColor: isDarkTheme ? '#343a40' : provided.backgroundColor,
            }),
            option: (provided, state) => ({
                ...provided,
                backgroundColor: isDarkTheme
                ? state.isSelected
                    ? '#495057'
                    : state.isFocused
                    ? '#495057'
                    : '#343a40'
                : state.isSelected
                ? '#007bff'
                : state.isFocused
                ? '#e9ecef'
                : provided.backgroundColor,
                color: isDarkTheme ? '#fff' : '#212529',
            }),
            singleValue: (provided) => ({
                ...provided,
                color: isDarkTheme ? '#fff' : provided.color,
            }),
            placeholder: (provided) => ({
                ...provided,
                color: isDarkTheme ? '#adb5bd' : provided.color,
            }),
            input: (provided) => ({
                ...provided,
                color: isDarkTheme ? '#fff' : provided.color,
            }),
            indicatorSeparator: (provided) => ({
                ...provided,
                backgroundColor: isDarkTheme ? '#495057' : provided.backgroundColor,
            }),
            dropdownIndicator: (provided) => ({
                ...provided,
                color: isDarkTheme ? '#fff' : provided.color,
            }),
            }}
            />

          ) : (
            <Form.Control
              type="text"
              value={filter.value}
              placeholder={t('enterValue')}
              onChange={(e) => updateFilter(index, null, e.target.value)}
            />
          )}
          <Button variant="outline-danger" onClick={() => removeFilter(index)}>
            <FaTrash />
          </Button>
        </InputGroup>
      );
    });

  // Отрисовка пагинации
  const renderPagination = () => {
    const totalPages = Math.ceil(totalCount / rowsPerPage);

    if (totalPages <= 7) {
      // Если страниц 7 или меньше, отображаем все номера страниц
      return (
        <Pagination>
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            {t('first')}
          </Pagination.First>
          <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            {t('previous')}
          </Pagination.Prev>
          {[...Array(totalPages)].map((_, number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => setCurrentPage(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {t('next')}
          </Pagination.Next>
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {t('last')}
          </Pagination.Last>
        </Pagination>
      );
    } else {
      // Если страниц больше 7, используем многоточия
      let items = [];

      items.push(
        <Pagination.Item key={1} active={currentPage === 1} onClick={() => setCurrentPage(1)}>
          1
        </Pagination.Item>
      );

      let startPage, endPage;

      if (currentPage <= 4) {
        // Близко к началу
        startPage = 2;
        endPage = 5;
        for (let number = startPage; number <= endPage; number++) {
          items.push(
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Pagination.Item>
          );
        }
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      } else if (currentPage >= totalPages - 3) {
        // Близко к концу
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        startPage = totalPages - 4;
        endPage = totalPages - 1;
        for (let number = startPage; number <= endPage; number++) {
          items.push(
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Pagination.Item>
          );
        }
      } else {
        // В середине
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        startPage = currentPage - 1;
        endPage = currentPage + 1;
        for (let number = startPage; number <= endPage; number++) {
          items.push(
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Pagination.Item>
          );
        }
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }

      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );

      return (
        <Pagination>
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            {t('first')}
          </Pagination.First>
          <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            {t('previous')}
          </Pagination.Prev>
          {items}
          <Pagination.Next
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {t('next')}
          </Pagination.Next>
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {t('last')}
          </Pagination.Last>
        </Pagination>
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t('transactions')}</h2>
      <div className="mb-3">
        {renderFilters()}
        <Button variant="outline-primary" onClick={addFilter}>
          <FaPlus /> {t('addFilter')}
        </Button>
        <Button variant="outline-primary" onClick={handleModalShow}>
          <FaPlus /> {t('addTransaction')}
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort('date')}>
              {t('date')} {getSortIcon('date')}
            </th>
            <th onClick={() => handleSort('time')}>
              {t('time')} {getSortIcon('time')}
            </th>
            <th onClick={() => handleSort('amount')}>
              {t('amount')} {getSortIcon('amount')}
            </th>
            <th onClick={() => handleSort('currency')}>
              {t('currency')} {getSortIcon('currency')}
            </th>
            <th onClick={() => handleSort('category')}>
              {t('category')} {getSortIcon('category')}
            </th>
            <th onClick={() => handleSort('account')}>
              {t('account')} {getSortIcon('account')}
            </th>
            <th>{t('description')}</th>
            <th>{t('type')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, rowIndex) => {
            const date = new Date(tx.date);
            return (
              <tr key={tx.id}>
                {['date', 'time', 'amount', 'currency', 'category', 'account', 'description', 'type'].map((col, colIndex) => (
                  <td
                    key={col}
                    onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                    onMouseLeave={() => setHoveredCell({ row: null, col: null })}
                  >
                    {col === 'date' && date.toLocaleDateString()}
                    {col === 'time' && date.toLocaleTimeString()}
                    {col === 'amount' && tx.amount}
                    {col === 'currency' && currencies[tx.currency]}
                    {col === 'category' && getFilteredCategories().find((cat) => cat.value === tx.category)?.label}
                    {col === 'account' && accounts.find((acc) => acc.value === tx.account)?.label}
                    {col === 'description' && tx.description}
                    {col === 'type' && (tx.transaction_type === 'income' ? t('income') : t('expense'))}
                    {hoveredCell.row === rowIndex && hoveredCell.col === colIndex && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <FaEdit
                          style={{ cursor: 'pointer', marginRight: '10px' }}
                          onClick={() => handleEditModalShow(tx)}
                        />
                        <FaTrashAlt
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDeleteModalShow(tx)}
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="d-flex justify-content-between align-items-center mt-3">
        {renderPagination()}
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle variant="secondary">{rowsPerPage}</Dropdown.Toggle>
          <Dropdown.Menu>
            {[15, 30, 50, 100].map((value) => (
              <Dropdown.Item key={value} onClick={() => handleRowsPerPageChange(value)}>
                {value}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editTransaction ? t('editTransaction') : t('addTransaction')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formTransactionType">
              <Form.Label>{t('transactionType')}</Form.Label>
              <Select
                options={transactionTypes}
                value={transactionTypes.find(
                  (type) => type.value === newTransaction.transaction_type
                )}
                onChange={(selected) => handleSelectChange('transaction_type', selected)}
                defaultValue={transactionTypes.find((type) => type.value === 'expense')}
              />
            </Form.Group>
            <Form.Group controlId="formDate">
              <Form.Label>{t('date')}</Form.Label>
              <DatePicker
                selected={newTransaction.date}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption={t('time')}
                dateFormat="yyyy-MM-dd HH:mm"
                className="form-control"
              />
            </Form.Group>
            <Form.Group controlId="formAmount">
              <Form.Label>{t('amount')}</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formCurrency">
              <Form.Label>{t('currency')}</Form.Label>
              <Select
                options={Object.keys(currencies).map((key) => ({
                  value: key,
                  label: currencies[key],
                }))}
                value={{
                  value: newTransaction.currency,
                  label: currencies[newTransaction.currency],
                }}
                onChange={(selected) => handleSelectChange('currency', selected)}
              />
            </Form.Group>
            <Form.Group controlId="formCategory">
              <Form.Label>{t('category')}</Form.Label>
              <Select
                options={getFilteredCategories()}
                value={getFilteredCategories().find((cat) => cat.value === newTransaction.category)}
                onChange={(selected) => handleSelectChange('category', selected)}
              />
            </Form.Group>
            <Form.Group controlId="formAccount">
              <Form.Label>{t('account')}</Form.Label>
              <Select
                options={accounts}
                value={accounts.find((acc) => acc.value === newTransaction.account)}
                onChange={(selected) => handleSelectChange('account', selected)}
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>{t('description')}</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {t('save')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <ConfirmDeleteModal
        show={showDeleteModal}
        handleClose={handleDeleteModalClose}
        handleConfirm={handleDeleteConfirm}
        item={transactionToDelete}
        itemType="transaction"
        itemName={transactionToDelete ? transactionToDelete.description : ''} // передаем описание транзакции
      />

    </div>
  );
}

export default TransactionsPage;


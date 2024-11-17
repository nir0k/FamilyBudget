// TransactionsPage.js
import React, { useEffect, useState } from 'react';
import { Table, Form, Pagination, Dropdown, ButtonGroup, InputGroup, Button } from 'react-bootstrap';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { FaSort, FaSortUp, FaSortDown, FaPlus, FaTrash } from 'react-icons/fa';
import {
  fetchTransactions,
  fetchCurrencies,
  fetchExpenseCategories,
  fetchIncomeCategories,
  fetchAccounts,
} from '../api';
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
  

  const [currencies, setCurrencies] = useState({});
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactionTypes] = useState([
    { value: 'income', label: t('income') },
    { value: 'expense', label: t('expense') },
  ]);

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
        setCategories([...expenseCategoryData, ...incomeCategoryData].map((category) => ({
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
                : categories
            }
            value={
            filter.value
                ? (
                    filter.field === 'transaction_type'
                    ? transactionTypes
                    : filter.field === 'account'
                    ? accounts
                    : categories
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
          {transactions.map((tx) => {
            const date = new Date(tx.date);
            return (
              <tr key={tx.id}>
                <td>{date.toLocaleDateString()}</td>
                <td>{date.toLocaleTimeString()}</td>
                <td>{tx.amount}</td>
                <td>{currencies[tx.currency]}</td>
                <td>{categories.find((cat) => cat.value === tx.category)?.label}</td>
                <td>{accounts.find((acc) => acc.value === tx.account)?.label}</td>
                <td>{tx.description}</td>
                <td>{tx.transaction_type === 'income' ? t('income') : t('expense')}</td>
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
    </div>
  );
}

export default TransactionsPage;

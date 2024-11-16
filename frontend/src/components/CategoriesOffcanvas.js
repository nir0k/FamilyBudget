import React, { useState, useEffect, useRef } from 'react';
import { Offcanvas, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import CategoriesTable from './CategoriesTable';

function CategoriesOffcanvas({ show, handleClose }) {
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState('expense');
    const contentRef = useRef(null);
    const [panelWidth, setPanelWidth] = useState('auto');

    useEffect(() => {
        if (show && contentRef.current) {
            const contentWidth = contentRef.current.scrollWidth;
            const calculatedWidth = Math.min(Math.max(contentWidth, 300), 1000);
            setPanelWidth(`${calculatedWidth}px`);
        }
    }, [show]);

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            className="dynamic-width-panel"
            style={{ width: panelWidth }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t('categories')}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body ref={contentRef}>
                <Form.Group controlId="categoryTypeSelect" className="mb-3">
                    <Form.Label>{t('selectCategoryType')}</Form.Label>
                    <Form.Select value={selectedType} onChange={handleTypeChange}>
                        <option value="expense">{t('expenseCategories')}</option>
                        <option value="income">{t('incomeCategories')}</option>
                    </Form.Select>
                </Form.Group>
                <CategoriesTable selectedType={selectedType} />
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default CategoriesOffcanvas;

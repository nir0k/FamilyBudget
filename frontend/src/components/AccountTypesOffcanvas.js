// src/components/AccountTypesOffcanvas.js

import React, { useEffect, useRef, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import AccountTypesTable from './AccountTypesTable';
import { useTranslation } from 'react-i18next';
import './CurrencyOffcanvas.css';

function AccountTypesOffcanvas({ show, handleClose }) {
    const { t } = useTranslation();
    const contentRef = useRef(null);
    const [panelWidth, setPanelWidth] = useState('auto');
    const [isWidthCalculated, setIsWidthCalculated] = useState(false);

    useEffect(() => {
        if (show && contentRef.current && !isWidthCalculated) {
            const contentWidth = contentRef.current.scrollWidth;
            const calculatedWidth = Math.min(Math.max(contentWidth, 300), 1000);
            setPanelWidth(`${calculatedWidth}px`);
            setIsWidthCalculated(true);
        }
    }, [show, isWidthCalculated]);

    useEffect(() => {
        if (!show) {
            setIsWidthCalculated(false);
        }
    }, [show]);

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            className="dynamic-width-panel"
            style={{ width: panelWidth }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{t('accountTypes')}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body ref={contentRef}>
                <AccountTypesTable />
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default AccountTypesOffcanvas;

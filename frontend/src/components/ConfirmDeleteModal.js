// src/components/ConfirmDeleteModal.js

import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function ConfirmDeleteModal({ show, handleClose, handleConfirm, item, itemType }) {
    const { t } = useTranslation();

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{t('confirmDelete')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {t('confirmDeleteMessage', { itemType: t(itemType), name: item.name })}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    {t('cancel')}
                </Button>
                <Button variant="danger" onClick={() => handleConfirm(item.id)}>
                    {t('delete')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmDeleteModal;

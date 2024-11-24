import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaEdit } from 'react-icons/fa';
import { changePassword, updateUserData, fetchLocales } from '../api';
import { toast } from 'react-toastify';

function UserInfoOffcanvas({ show, handleClose, userData, isDarkTheme }) {
    const { t } = useTranslation();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({
        username: userData.username,
        email: userData.email,
        telegram_id: userData.telegram_id || '',
        locale: userData.locale || '',
    });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [locales, setLocales] = useState([]);

    // Fetch available locales
    useEffect(() => {
        const loadLocales = async () => {
            try {
                const localesData = await fetchLocales();
                setLocales(localesData);
            } catch (error) {
                console.error('Failed to fetch locales:', error);
                toast.error(t('failedToFetchLocales'));
            }
        };
        loadLocales();
    }, [t]);

    // Update editableData when userData changes
    useEffect(() => {
        if (userData) {
            setEditableData({
                username: userData.username || '',
                email: userData.email || '',
                telegram_id: userData.telegram_id || '',
                locale: userData.locale || '',
            });
        }
    }, [userData]);

    const handleEditToggle = () => setIsEditing(!isEditing);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleLocaleChange = (locale) => {
        setEditableData((prevData) => ({ ...prevData, locale }));
    };

    const handleSaveChanges = async () => {
        try {
            await updateUserData(editableData);
            toast.success(t('userDataUpdated'));
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(t('updateFailed'));
        }
    };

    const handleCancelChanges = () => {
        setEditableData({
            username: userData.username,
            email: userData.email,
            telegram_id: userData.telegram_id || '',
            locale: userData.locale || '',
        });
        setIsEditing(false);
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            toast.error(t('passwordsDoNotMatch'));
            return;
        }

        setError(null);
        try {
            await changePassword(currentPassword, newPassword);
            toast.success(t('passwordChangedSuccessfully'));
            handleClosePasswordModal();
        } catch (error) {
            setError(t('passwordChangeFailed'));
            toast.error(t('passwordChangeFailed'));
        }
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
    };

    return (
        <>
            <Offcanvas
                show={show}
                onHide={handleClose}
                placement="end"
                className={`${isDarkTheme ? 'bg-dark text-light' : 'bg-light text-dark'}`}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{t('userInfo')}</Offcanvas.Title>
                    <Button variant="link" onClick={handleEditToggle} className="ms-2">
                        <FaEdit className={isDarkTheme ? 'text-light' : 'text-dark'} />
                    </Button>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        <Form.Group controlId="username">
                            <Form.Label>{t('username')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={editableData.username}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={isDarkTheme && isEditing ? 'bg-dark text-light' : ''}
                            />
                        </Form.Group>

                        <Form.Group controlId="email" className="mt-3">
                            <Form.Label>{t('email')}</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={editableData.email}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={isDarkTheme && isEditing ? 'bg-dark text-light' : ''}
                            />
                        </Form.Group>

                        <Form.Group controlId="telegramId" className="mt-3">
                            <Form.Label>{t('telegramId')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="telegram_id"
                                value={editableData.telegram_id}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={isDarkTheme && isEditing ? 'bg-dark text-light' : ''}
                            />
                        </Form.Group>

                        <Form.Group controlId="locale" className="mt-3">
                            <Form.Label>{t('locale')}</Form.Label>
                            <DropdownButton
                                title={
                                    locales?.find((l) => l.value === editableData.locale)?.label || t('selectLocale')
                                }
                                disabled={!isEditing}
                                onSelect={handleLocaleChange}
                                className={isDarkTheme && isEditing ? 'bg-dark text-light' : ''}
                            >
                                {locales?.map((locale) => (
                                    <Dropdown.Item key={locale.value} eventKey={locale.value}>
                                        {locale.label}
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </Form.Group>
                    </Form>

                    {isEditing ? (
                        <div className="mt-4">
                            <Button variant="success" onClick={handleSaveChanges} className="me-2">
                                {t('saveChanges')}
                            </Button>
                            <Button variant="secondary" onClick={handleCancelChanges}>
                                {t('cancel')}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={() => setShowPasswordModal(true)}
                            className="mt-4"
                        >
                            {t('changePassword')}
                        </Button>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            <Modal
                show={showPasswordModal}
                onHide={handleClosePasswordModal}
                contentClassName={isDarkTheme ? 'bg-dark text-light' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('changePassword')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="currentPassword">
                            <Form.Label>{t('currentPassword')}</Form.Label>
                            <Form.Control
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder={t('enterCurrentPassword')}
                            />
                        </Form.Group>
                        <Form.Group controlId="newPassword" className="mt-3">
                            <Form.Label>{t('newPassword')}</Form.Label>
                            <Form.Control
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('enterNewPassword')}
                            />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword" className="mt-3">
                            <Form.Label>{t('confirmNewPassword')}</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('confirmNewPassword')}
                            />
                        </Form.Group>
                        {error && <p className="text-danger mt-3">{error}</p>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePasswordModal}>
                        {t('cancel')}
                    </Button>
                    <Button variant="primary" onClick={handlePasswordChange}>
                        {t('confirmChange')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default UserInfoOffcanvas;

# FamilyBudget

**FamilyBudget** is a personal finance management application specifically designed for families. It allows you to create a family group, invite members, and manage a joint budget. Members can record their expenses both individually and for everyone. The application supports multiple currencies with the ability to convert between them.

## Features

### Current Features

#### Backend

- **Users**:
    - User registration and authentication.
    - Password change.
    - Profile management (username, email, Telegram ID).

- **Finance**:
    - **Currencies**:
        - Create, edit, and delete currencies.
    - **Account Types**:
        - Create, edit, and delete account types.
    - **Banks**:
        - Create, edit, and delete banks.
    - **Accounts**:
        - Create, edit, and delete accounts.
        - Track account balance history.

- **Transactions**:
    - **Income and Expense Categories**:
        - Create, edit, and delete categories.
    - **Transaction Management**:
        - Create, edit, and delete incomes and expenses.
        - Automatically update account balance when transactions change.

- **API**:
    - Implement RESTful API using Django REST Framework.
    - Token-based authentication.
    - Data validation and detailed documentation.

#### Frontend

- **Authentication**:
    - User login form.
    - Store and use authentication tokens.

- **User Interface**:
    - Implement light and dark themes with a toggle option.
    - Multilingual support (English, Russian, Hungarian).

- **Finance Management**:
    - **Currencies**:
        - View list of currencies.
        - Add, edit, and delete currencies.
    - **Account Types**:
        - View list of account types.
        - Add, edit, and delete account types.
    - **Banks**:
        - View list of banks.
        - Add, edit, and delete banks.
    - **Accounts**:
        - View list of accounts with details.
        - Add, edit, and delete accounts.
        - View account balance history with charts.

- **Transactions**:
    - **Categories**:
        - View lists of income and expense categories.
        - Add, edit, and delete categories.
    - **Transactions**:
        - View list of transactions (incomes and expenses).
        - Filter and sort transactions.
        - Add, edit, and delete transactions.

- **User Profile**:
    - View and edit profile information.
    - Change password.

- **Navigation and Usability**:
    - Navigation panel with access to all sections of the application.
    - Offcanvas panels for managing entities (currencies, banks, account types, etc.).
    - User action confirmation through modal windows.

- **API Integration**:
    - Use Axios for backend interaction.
    - Handle and display server errors.

### Planned Features

- **Family Groups**:
    - Create family groups and invite members.
    - Manage joint budget among family members.

- **Shared Expenses**:
    - Record expenses on behalf of all or selected family members.
    - Track who paid for what and how expenses are distributed.

- **Multi-currency Support**:
    - Enter expenses in different currencies.
    - Automatically convert between currencies based on exchange rates.

- **Advanced Reports**:
    - Detailed financial reports and analytics.
    - Tools for budget planning and forecasting.

- **Notifications**:
    - Set up alerts for exceeding budget limits.
    - Reminders for upcoming bills or payments.

- **Data Import/Export**:
    - Import financial data from bank statements or other applications.
    - Export data for external analysis.

- **Mobile Application**:
    - Develop a mobile app for convenient tracking on the go.

## Installation

### Backend (Django)

1. **Clone the repository**:

     ```bash
     git clone https://github.com/yourusername/FamilyBudget.git
     ```
2. Navigate to the backend directory:

        ```bash
        cd FamilyBudget/backend
        ```

3. Create a virtual environment:

        ```bash
        python -m venv env
        ```

4. Activate the virtual environment:

     - Windows:

                ```bash
                env\Scripts\activate
                ```

     - macOS/Linux:

                ```bash
                source env/bin/activate
                ```

5. Install dependencies:

        ```bash
        pip install -r requirements.txt
        ```

6. Apply migrations:

        ```bash
        python manage.py migrate
        ```

7. Create a superuser (optional, for admin panel access):

        ```bash
        python manage.py createsuperuser
        ```

8. Start the development server:

        ```bash
        python manage.py runserver
        ```

### Frontend (React)
1. Navigate to the frontend directory:

        ```bash
        cd ../frontend
        ```

2. Install dependencies:

        ```bash
        npm install
        ```

3. Create a `.env` file:

     - Create a `.env` file in the `frontend` directory.

     - Add the following line (replace the URL with your backend if necessary):

                ```bash
                REACT_APP_API_BASE_URL=http://localhost:8000/api
                ```

4. Start the development server:

        ```bash
        npm start
        ```

The application should now be available locally. Open your browser and go to `http://localhost:3000`.

### Contribution
If you want to contribute to the project, please open an issue or submit a pull request.

### License
This project is licensed under the [GNU GPL v3](LICENSE).
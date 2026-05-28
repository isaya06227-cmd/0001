# Entity Relationship Diagram (ERD): Takiang2.0

This document illustrates the **Entity Relationship Diagram (ERD)** for the Takiang2.0 system, detailing the database schema, table structures, and relationships between data entities.

## 1. ER Diagram (Mermaid)

```mermaid
erDiagram
    EMPLOYEE {
        int employee_id PK
        string full_name
        string department
        string position
    }

    USER_LOGIN_WORK {
        int user_id
        string username PK
        string password
        int employee_id FK
        string team
    }

    CUSTOMERS {
        int customer_id PK
        string customer_name
        string gender
        string phone
        string email
        string tax_id
        string billing_address
        string other_contact
    }

    PROJECTS {
        string project_id PK "Format: TK001"
        string project_name
        int customer_id FK
        decimal price
        string responsible_team
        string status
        date due_date
    }

    WORKS {
        string work_id PK "Format: Prefix+000"
        string works_name
        string work_type
        string project_id FK
        decimal price
        string description
        string assigned_to FK "Refers to username"
        date due_date
        string status
    }

    SUBMITTED_WORKS {
        int submitted_id PK
        string username FK
        string project_id FK
        string works_id FK
        int round_number
        string link
        date submitted_date
        string status
        string reviewer_comment
    }

    EXPORTED_WORKS {
        int export_id PK
        int submitted_id FK
        string username
        string project_id
        string works_id
        string reviewer_comment
        date review_date
    }

    %% Relationships
    EMPLOYEE ||--|| USER_LOGIN_WORK : "has account"
    CUSTOMERS ||--|{ PROJECTS : "requests"
    PROJECTS ||--|{ WORKS : "contains"
    USER_LOGIN_WORK ||--|{ WORKS : "assigned to"
    WORKS ||--|{ SUBMITTED_WORKS : "has submissions"
    USER_LOGIN_WORK ||--|{ SUBMITTED_WORKS : "submits"
    SUBMITTED_WORKS ||--o{ EXPORTED_WORKS : "archived as"
```

---

## 2. Table Descriptions

### 2.1 Master Data (Users & Customers)

*   **EMPLOYEE (`employee`)**: Stores personal information of the staff.
    *   `employee_id`: Unique identifier (Primary Key).
*   **USER_LOGIN_WORK (`user_login_work`)**: Authentication data linked to an employee.
    *   `username`: Unique login ID (Primary Key/Unique).
    *   `employee_id`: Link to the Employee table.
    *   `team`: The team the user belongs to (admin, graphic, etc.).
*   **CUSTOMERS (`customers`)**: Client information.
    *   `customer_id`: Unique identifier (Auto-increment PK).

### 2.2 Project & Task Management

*   **PROJECTS (`projects`)**: The main order or project requested by a customer.
    *   `project_id`: Custom formatted ID (e.g., TK001).
    *   `customer_id`: Links to the Customer who owns the project.
*   **WORKS (`works`)**: Individual tasks broken down from a project.
    *   `work_id`: Custom formatted ID based on work type (e.g., AL001, CNC001).
    *   `project_id`: Links to the parent Project.
    *   `assigned_to`: Stores the `username` of the employee responsible.

### 2.3 Operations & Logging

*   **SUBMITTED_WORKS (`submitted_works`)**: Records of work submissions by employees.
    *   `round_number`: Tracks revision rounds (1st submission, 2nd correction, etc.).
    *   `status`: Status of the specific submission (Pending, Pass, Fail).
*   **EXPORTED_WORKS (`exported_works`)**: A history/archive table for completed or approved works, often used for reporting or final records.

---

## 3. Key Relationships

1.  **One Employee has One Account:** `EMPLOYEE` is linked 1:1 with `USER_LOGIN_WORK`.
2.  **One Customer has Many Projects:** A `CUSTOMER` can order multiple `PROJECTS`.
3.  **One Project has Many Works:** A `PROJECT` is composed of multiple `WORKS` (Tasks).
4.  **One User (Employee) has Many Assigned Works:** `USER_LOGIN_WORK` (via username) is assigned to multiple `WORKS`.
5.  **One Work has Many Submissions:** `WORKS` can have multiple entries in `SUBMITTED_WORKS` (due to revisions/rounds).

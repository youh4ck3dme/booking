# 🗄️ Database Schema & Security

The application runs on a Supabase (PostgreSQL) backend. This document outlines the core tables and security policies.

## Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--|{ BOOKINGS : "makes"
    EMPLOYEES ||--|{ BOOKINGS : "provides service for"
    SERVICES ||--|{ BOOKINGS : "is type of"

    PROFILES {
        uuid id PK
        string full_name
        string role "user|admin"
        string phone
        timestamp created_at
    }

    EMPLOYEES {
        uuid id PK
        string name
        string role "stylist|barber"
        string[] specialties
        boolean is_active
        jsonb availability
    }

    SERVICES {
        uuid id PK
        string name
        int duration "minutes"
        decimal price
        string description
    }

    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid employee_id FK
        uuid service_id FK
        timestamp start_time
        timestamp end_time
        string status "confirmed|cancelled|completed"
        text notes
    }
```

## Security Policies (RLS)

### Profiles

- **Select**: Users see their own; Admins see all.
- **Update**: Users update their own; Admins update all.

### Bookings

- **Select**: Users see their own; Admins see all; Employees see their assigned.
- **Insert**: Authenticated users can create bookings.
- **Update**: Users can cancel their own pending bookings; Admins can update any status.

### Employees & Services

- **Select**: Public (Everyone can view available services and staff).
- **Update/Insert/Delete**: Admin only.

## Data Types

### `availability` (JSONB)

Stores simple working hours structure:

```json
{
  "monday": ["09:00", "17:00"],
  "tuesday": ["09:00", "17:00"]
}
```

### `role` (Enum)

- `user`: Standard customer.
- `admin`: Business owner with full dashboard access.

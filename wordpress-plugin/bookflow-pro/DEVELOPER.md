# BookFlow Pro Developer Documentation

## Architecture

WordPress plugin acts as frontend client for BookFlow Pro REST API.

## Core Components

- **BookFlow_API**: Singleton handling API communication with caching
- **BookFlow_Shortcodes**: Frontend rendering via shortcodes
- **BookFlow_Admin**: Settings page and AJAX handlers
- **BookFlow_Blocks**: Gutenberg block registration

## Shortcodes

- `[bookflow_widget]` - Full booking flow
- `[bookflow_services]` - Services grid
- `[bookflow_button]` - CTA button

## API Endpoints

All require `X-BookFlow-API-Key` header:

- GET `/api/v1/services` - List services
- GET `/api/v1/employees` - List employees
- GET `/api/v1/slots` - Available time slots
- POST `/api/v1/bookings` - Create booking

# CloudStay Property Management System

## Overview

CloudStay is a comprehensive vacation rental property management system built with React, Express.js, and PostgreSQL. It provides a complete solution for managing properties, bookings, guests, payments, and integrations with major vacation rental platforms like Airbnb, Booking.com, and VRBO.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Router**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling using shadcn/ui design system
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the entire application
- **API Style**: RESTful API endpoints with JSON responses
- **Middleware**: Express middleware for logging, error handling, and request parsing

### Database Architecture
- **Database**: SQLite with better-sqlite3 for local development and portability
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Native SQLite connection via better-sqlite3 driver

## Key Components

### Core Business Logic
1. **Property Management**: CRUD operations for vacation rental properties
2. **Booking System**: Reservation management with status tracking
3. **Guest Communication**: Message handling and AI-powered responses
4. **Housekeeping Tasks**: Cleaning and maintenance scheduling
5. **Payment Processing**: Stripe integration for secure payments
6. **Analytics Dashboard**: Performance metrics and revenue tracking
7. **OTA Integrations**: Channel management for external platforms

### User Management
- **Authentication**: Session-based authentication system
- **Role-based Access**: Admin, owner, and staff user roles
- **User Profiles**: Customer and staff information management

### External Integrations
- **Stripe**: Payment processing and subscription management
- **OTA Platforms**: Airbnb, Booking.com, VRBO integration capability
- **AI Assistant**: Automated guest communication system

## Data Flow

### Request Flow
1. Client makes HTTP request to Express.js server
2. Express middleware handles authentication and logging
3. Route handlers process business logic using Drizzle ORM
4. Database operations executed against PostgreSQL
5. JSON response returned to client
6. React Query manages client-side caching and state

### Authentication Flow
- Session-based authentication with Stripe customer integration
- Role-based authorization for different user types
- Secure password handling and user management

### Data Synchronization
- Real-time updates through React Query invalidation
- Optimistic updates for better user experience
- Error handling with user-friendly toast notifications

## External Dependencies

### Core Dependencies
- **better-sqlite3**: Fast SQLite3 bindings for Node.js
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@stripe/stripe-js**: Payment processing integration
- **@radix-ui/react-***: Accessible UI component primitives
- **zod**: Runtime type validation and schema parsing

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **tailwindcss**: Utility-first CSS framework
- **vite**: Frontend build tool and development server

### Optional Integrations
- **@types/better-sqlite3**: TypeScript definitions for SQLite
- **ws**: WebSocket support for real-time features
- Various date/time utilities and form libraries

## Deployment Strategy

### Development Environment
- Vite development server with HMR for frontend
- tsx for running TypeScript server with auto-reload
- Separate client and server build processes

### Production Build
1. **Frontend**: Vite builds optimized static assets to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Local SQLite database file (cloudstay.db)
- Stripe secret key for payment processing
- Environment-specific configurations for development vs production

### Hosting Considerations
- Designed for deployment on platforms supporting Node.js
- Static assets served from Express in production
- Self-contained SQLite database for portability
- No external database dependencies required

## Architecture Benefits

### Type Safety
- End-to-end TypeScript ensures compile-time error detection
- Shared schema types between client and server
- Zod validation provides runtime type checking

### Developer Experience
- Hot module replacement for fast development
- Comprehensive error handling and logging
- Modern toolchain with fast build times

### Scalability
- Serverless database architecture
- Component-based UI architecture
- Efficient data fetching with React Query caching

### User Experience
- Responsive design with mobile-first approach
- Accessible UI components from Radix
- Real-time updates and optimistic UI patterns
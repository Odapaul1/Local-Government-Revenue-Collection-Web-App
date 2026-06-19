# Local Government Revenue Collection Platform - TODO

## Project Overview
Build an elegant, production-ready government revenue collection and management platform for Nigeria with comprehensive features for dashboard, revenue management, payer registry, transaction processing, payment gateway integration, role-based access control, receipts, reporting, audit trails, and notifications.

## Design & Architecture
- [x] Database schema design complete (users, roles, revenue categories, payers, transactions, audit logs, notifications)
- [x] API architecture documented (tRPC procedures for all features)
- [x] UI/UX design system established (color palette, typography, component library)
- [ ] Remita API integration strategy documented

## Core Features

### 1. Authentication & Role-Based Access Control
- [x] Extend user table with role field (Super Admin, LGA Admin, Revenue Collector, Auditor)
- [x] Implement role-based procedure guards (protectedProcedure variants for each role)
- [x] Create user management backend (create, update, delete users with role assignment)
- [x] Implement LGA assignment for LGA Admin and Revenue Collector roles
- [x] Add role-based access control to all procedures
- [ ] Frontend: User profile page with role display
- [x] Frontend: Admin user management interface
- [ ] Vitest: Test role-based access control for all procedures

### 2. Revenue Category Management
- [x] Database: Create revenue_categories table (id, name, description, amount_type, calculation_logic, applicable_lgas, created_at, updated_at)
- [x] Backend: Create procedure for listing revenue categories
- [x] Backend: Create procedure for creating revenue category (Super Admin only)
- [x] Backend: Create procedure for updating revenue category (Super Admin only)
- [x] Backend: Create procedure for deleting revenue category (Super Admin only)
- [ ] Seed database with default revenue categories (market levies, business permits, property rates)
- [x] Frontend: Revenue category management page (list, create, edit, delete)
- [x] Frontend: Revenue category form with validation
- [ ] Vitest: Test revenue category CRUD operations

### 3. Payer/Taxpayer Registry
- [x] Database: Create payers table (id, name, address, contact_details, taxpayer_id, lga_id, created_at, updated_at)
- [x] Backend: Create procedure for listing payers (with filters by LGA)
- [x] Backend: Create procedure for creating payer
- [x] Backend: Create procedure for updating payer
- [x] Backend: Create procedure for deleting payer
- [ ] Backend: Create procedure for getting payer payment history
- [x] Frontend: Payer registry page (list, search, create, edit, delete)
- [ ] Frontend: Payer profile page with payment history
- [x] Frontend: Payer form with validation
- [ ] Vitest: Test payer CRUD operations

### 4. Transaction Processing
- [x] Database: Create transactions table (id, payer_id, revenue_category_id, amount_due, amount_paid, status, payment_reference, collector_id, lga_id, created_at, updated_at)
- [x] Database: Create transaction_status_history table for audit trail (transaction_id, old_status, new_status, changed_by, changed_at)
- [x] Backend: Create procedure for initiating transaction
- [x] Backend: Create procedure for updating transaction status
- [x] Backend: Create procedure for listing transactions (with filters)
- [ ] Backend: Create procedure for getting transaction details
- [ ] Backend: Implement Remita API integration for payment processing
- [ ] Backend: Create procedure for confirming payment from Remita webhook
- [ ] Backend: Create procedure for handling payment failures
- [x] Frontend: Transaction initiation form (select payer, revenue category, amount)
- [x] Frontend: Transaction list page with status indicators
- [ ] Frontend: Transaction detail page
- [ ] Vitest: Test transaction CRUD and status updates

### 5. Payment Gateway Integration (Remita)
- [ ] Research and document Remita API endpoints (payment initiation, confirmation, reconciliation)
- [ ] Backend: Create Remita API client wrapper
- [ ] Backend: Implement payment initiation logic
- [ ] Backend: Implement webhook handler for payment confirmations
- [ ] Backend: Implement payment reconciliation logic
- [ ] Backend: Create procedure for initiating Remita payment
- [ ] Backend: Create procedure for confirming Remita payment
- [ ] Backend: Error handling for payment gateway failures
- [ ] Environment: Add Remita API credentials (merchant ID, API key)
- [ ] Vitest: Test Remita API integration (mock responses)

### 6. Receipt Generation
- [x] Database: Create receipts table (id, transaction_id, receipt_number, generated_at, downloaded_at)
- [x] Backend: Create procedure for generating receipt (PDF generation)
- [x] Backend: Create procedure for downloading receipt
- [ ] Backend: Implement PDF generation with transaction details
- [x] Backend: Implement receipt numbering system
- [x] Frontend: Receipt view page (display receipt details)
- [x] Frontend: Print receipt button (browser print)
- [x] Frontend: Download receipt button (PDF download)
- [ ] Vitest: Test receipt generation and download

### 7. Reporting & Analytics
- [ ] Database: Create reports table (id, name, created_by, filters, created_at)
- [ ] Backend: Create procedure for generating transaction report (with filters: date range, LGA, revenue category, collector)
- [x] Backend: Create procedure for exporting report to CSV
- [ ] Backend: Create procedure for exporting report to Excel
- [ ] Backend: Create procedure for getting KPI data (total collected, pending, targets)
- [ ] Backend: Create procedure for getting revenue breakdown by category
- [ ] Backend: Create procedure for getting revenue breakdown by LGA
- [x] Frontend: Reports page with filter interface
- [x] Frontend: Report table with pagination
- [x] Frontend: Export buttons (CSV, Excel)
- [x] Frontend: KPI cards on dashboard
- [x] Frontend: Charts for revenue breakdown (by category, by LGA)
- [ ] Vitest: Test report generation and filtering

### 8. Audit Trail
- [x] Database: Create audit_logs table (id, user_id, action, entity_type, entity_id, old_values, new_values, timestamp)
- [x] Backend: Create audit logging middleware/helper
- [x] Backend: Log all transaction status changes
- [x] Backend: Log all user actions (create, update, delete)
- [x] Backend: Create procedure for listing audit logs (with filters)
- [ ] Backend: Create procedure for getting audit trail for specific transaction
- [x] Frontend: Audit trail page (list all logs with filters)
- [ ] Frontend: Transaction audit trail view (show history for specific transaction)
- [ ] Vitest: Test audit logging functionality

### 9. Notification System
- [ ] Database: Create notifications table (id, user_id, type, title, message, read, created_at)
- [ ] Backend: Create procedure for creating notification
- [ ] Backend: Create procedure for listing user notifications
- [ ] Backend: Create procedure for marking notification as read
- [ ] Backend: Create procedure for sending payment confirmation notification
- [ ] Backend: Create procedure for sending payment failure notification
- [ ] Backend: Create procedure for sending daily collection summary notification
- [ ] Frontend: Notification bell icon in header
- [ ] Frontend: Notification dropdown/panel
- [ ] Frontend: Mark notification as read
- [ ] Frontend: Toast notifications for real-time alerts
- [ ] Vitest: Test notification creation and retrieval

### 10. Dashboard
- [x] Frontend: Dashboard layout with KPI cards (total collected, pending, targets)
- [ ] Frontend: Real-time collection summary (today, this week, this month)
- [x] Frontend: Revenue breakdown chart (by category)
- [ ] Frontend: Revenue breakdown chart (by LGA)
- [x] Frontend: Recent transactions list
- [x] Frontend: Quick action buttons (new transaction, new payer, view reports)
- [ ] Frontend: Role-specific dashboard views (Super Admin, LGA Admin, Revenue Collector, Auditor)
- [ ] Vitest: Test dashboard data loading

### 11. Admin & Collector Interfaces
- [ ] Frontend: Super Admin dashboard (all LGAs, all users, all transactions)
- [ ] Frontend: LGA Admin dashboard (specific LGA, LGA users, LGA transactions)
- [ ] Frontend: Revenue Collector interface (transaction initiation, payer search)
- [ ] Frontend: Auditor interface (audit logs, reports, read-only access)
- [ ] Frontend: User management page (Super Admin only)
- [ ] Frontend: LGA management page (Super Admin only)
- [ ] Frontend: Settings page (role-specific)

### 12. UI/UX Implementation
- [ ] Frontend: Elegant color palette and typography (professional government aesthetic)
- [ ] Frontend: Responsive layout (desktop, tablet, mobile)
- [ ] Frontend: Navigation structure (sidebar for admin, top nav for public)
- [ ] Frontend: Form validation and error handling
- [ ] Frontend: Loading states and skeletons
- [ ] Frontend: Empty states for lists
- [ ] Frontend: Confirmation dialogs for destructive actions
- [ ] Frontend: Accessibility compliance (WCAG 2.1 AA)

### 13. Testing & Quality Assurance
- [ ] Vitest: Unit tests for all backend procedures
- [ ] Vitest: Unit tests for all database queries
- [ ] Vitest: Unit tests for Remita API integration
- [ ] Vitest: Unit tests for audit logging
- [ ] Vitest: Unit tests for notification system
- [ ] Manual testing: End-to-end transaction flow
- [ ] Manual testing: Role-based access control
- [ ] Manual testing: Receipt generation and download
- [ ] Manual testing: Report generation and export
- [ ] Manual testing: Audit trail logging

### 14. Security & Compliance
- [ ] Implement HTTPS enforcement
- [ ] Implement CSRF protection
- [ ] Implement rate limiting on API endpoints
- [ ] Implement input validation and sanitization
- [ ] Implement SQL injection prevention (using Drizzle ORM)
- [ ] Implement XSS prevention
- [ ] Implement secure password hashing (if applicable)
- [ ] Implement secure session management
- [ ] Implement audit logging for security events
- [ ] Implement data encryption for sensitive fields (payment references, contact details)
- [ ] Nigeria Data Protection Act 2023 compliance review
- [ ] Financial regulations compliance review

### 15. Performance Optimization
- [ ] Implement database indexing on frequently queried fields
- [ ] Implement query optimization (avoid N+1 queries)
- [ ] Implement caching for KPI data
- [ ] Implement pagination for large datasets
- [ ] Implement lazy loading for charts and reports
- [ ] Optimize frontend bundle size
- [ ] Implement code splitting for routes
- [ ] Implement image optimization

### 16. Deployment & Documentation
- [ ] Create deployment guide
- [ ] Create user documentation
- [ ] Create API documentation
- [ ] Create admin setup guide
- [ ] Create troubleshooting guide
- [ ] Set up monitoring and logging
- [ ] Set up error tracking (Sentry or similar)
- [ ] Set up performance monitoring

## Constraints & Requirements
- Role names must be exactly: Super Admin, LGA Admin, Revenue Collector, Auditor
- Revenue type examples: market levies, business permits, property rates
- Transaction statuses must be exactly: pending, paid, failed
- All receipts must support print and download actions
- Reports must support export capability (CSV, Excel)
- Visual design must be elegant, refined, and premium
- Platform must be production-ready and highly polished
- All code must follow best practices and be thoroughly tested
- Nigeria Data Protection Act 2023 compliance required

## Completed Items
(Items marked as [x] will be tracked here)


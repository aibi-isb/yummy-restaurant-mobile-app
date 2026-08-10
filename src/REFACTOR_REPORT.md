# YUMMY Static-to-Modular Refactor Report

## Food/Menu Lists
- Found: home, categories, and search screens rendered hardcoded food/category arrays directly from `src/data/restaurant.ts`.
- Problem: route files contained repeated list/grid/chip UI and bypassed service-driven data.
- Replacement: `useFoods`, `useMenuCategories`, `MealSection`, and `CategorySection`.
- Location: `src/hooks/useFoods.ts`, `src/features/menu/`, `src/components/sections/`.
- Academic modules: Software Engineering, Database I & II, Web Technology, Data Mining, Computer Graphics.

## Food Persistence
- Found: food data was local fallback-only and admin CRUD did not clearly separate backend access.
- Problem: food management was not backend-ready and repository concerns were mixed into app services.
- Replacement: Supabase food repository with AsyncStorage fallback.
- Location: `src/services/supabase/foodRepository.ts`, `src/services/foodService.ts`.
- Academic modules: Database I & II, Distributed Computing, Web Technology, E-Commerce.

## Categories
- Found: categories were a hardcoded screen import.
- Problem: category filters could drift from real menu records.
- Replacement: categories are derived from food service data with fallback constants.
- Location: `src/features/menu/services/menuService.ts`, `src/features/menu/hooks/useMenuCategories.ts`.
- Academic modules: Database I & II, Data Mining, Software Engineering.

## Cart, Checkout, Orders, Payments
- Found: cart, checkout, payment, and tracking used local mock lines or one-off state.
- Problem: e-commerce flow did not persist consistently across screens.
- Replacement: reusable cart/order/payment services and hooks with persisted local state and backend-ready boundaries.
- Location: `src/services/cartService.ts`, `src/services/orderService.ts`, `src/services/paymentService.ts`, `src/hooks/`.
- Academic modules: E-Commerce, Operating Systems, Software Engineering, Ethics.

## Notifications
- Found: notification screen used static Today/Yesterday arrays.
- Problem: admin payment/order actions could not create customer-visible updates.
- Replacement: notification service and hook backed by persisted records.
- Location: `src/services/notificationService.ts`, `src/hooks/useNotifications.ts`.
- Academic modules: Distributed Computing, E-Commerce, Ethics.

## Admin Customers
- Found: customer management listed repeated static customer rows.
- Problem: admin user management was not connected to registered profiles.
- Replacement: Supabase profile repository with a small demo fallback.
- Location: `src/services/supabase/customerRepository.ts`, `src/services/customerService.ts`, `src/hooks/useCustomers.ts`.
- Academic modules: Database I & II, Entrepreneurship, Ethics.

## SQLite
- Found: app startup initialized a persistent local SQLite database.
- Problem: the database created an unused offline persistence layer.
- Resolution: removed SQLite initialization, its service files, and the `expo-sqlite` dependency.

## Reusable Sections
- Found: food cards, category chips, and section layouts were repeated in multiple screens.
- Problem: duplicated UI increases maintenance cost and creates inconsistent behavior.
- Replacement: shared section components that receive data and handlers via props.
- Location: `src/components/sections/CategorySection.tsx`, `src/components/sections/MealSection.tsx`.
- Academic modules: Software Engineering, Computer Graphics.

## Authentication
- Found: username was collected but login only accepted email.
- Problem: assignment requires username/customer login behavior.
- Replacement: username-or-email login through `authService`.
- Location: `src/services/authService.ts`, `src/app/(public)/login.tsx`.
- Academic modules: Ethics, Web Technology, Database I & II.

## Supabase-Driven Services
- Found: cart, order, payment, notification, category, customer, and dashboard flows still depended on local storage or fixture services.
- Problem: admin approvals, tracking, dashboard counts, and notification reads were not backed by shared database state.
- Replacement: remote-first Supabase service modules with local offline fallback where useful.
- Location: `src/services/supabase/cartService.ts`, `orderService.ts`, `paymentService.ts`, `notificationService.ts`, `categoryService.ts`, `userService.ts`, `storageService.ts`, `authService.ts`.
- Academic modules: Database I & II, Data Communication and Networking, Distributed Computing, Operating Systems, Ethics.

## Admin Management Flows
- Found: dashboard, customer detail, order detail/status, food detail, and payment verification used fixture builders or static placeholders.
- Problem: admin screens could display plausible but false business data.
- Replacement: `useAdminDashboard`, `useOrders`, `usePayments`, `useCustomers`, and `useFoods` now derive these screens from real services.
- Location: `src/hooks/useAdminDashboard.ts`, `src/app/(admin)/index.tsx`, `admin-customers/[customer-id].tsx`, `admin-orders/[order-id].tsx`, `admin-orders/status-update/[order-id].tsx`, `admin-foods/[food-id]/index.tsx`, `admin-payment-verification.tsx`.
- Academic modules: Software Engineering, E-Commerce, Entrepreneurship, Ethics.

## Backend Contract
- Found: database tables and RLS requirements were implicit.
- Problem: the app expected `profiles`, `categories`, `foods`, `cart_items`, `orders`, `order_items`, `payments`, and `notifications`, but setup was undocumented.
- Replacement: Supabase schema reference with primary keys, foreign keys, status checks, indexes, and RLS policies.
- Location: `src/services/supabase/schema.sql`.
- Academic modules: Database I & II, Ethics, Distributed Computing.

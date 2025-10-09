# AI Development Rules

This document outlines the technical stack and provides strict guidelines for AI-driven development of this application. The goal is to maintain code consistency, quality, and maintainability.

## Tech Stack

The application is built with a modern, type-safe, and component-based architecture.

-   **Framework & Build Tool**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) for a fast development experience.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for static typing and improved code quality.
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for a pre-built, accessible, and customizable component library.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for all styling, following a utility-first approach.
-   **Backend & Database**: [Supabase](https://supabase.com/) is used for the database, authentication, and serverless functions.
-   **Data Fetching & Server State**: [TanStack Query](https://tanstack.com/query/latest) is used for managing asynchronous operations, caching, and server state.
-   **Form Management**: [React Hook Form](https://react-hook-form.com/) for building forms, paired with [Zod](https://zod.dev/) for schema validation.
-   **Routing**: [React Router](https://reactrouter.com/) for all client-side navigation.
-   **Notifications**: [Sonner](https://sonner.emilkowal.ski/) is used for displaying toast notifications.
-   **Icons**: [Lucide React](https://lucide.dev/) provides the icon set for the application.

## Library Usage Guidelines

To ensure consistency, follow these rules when adding or modifying features:

### 1. UI and Components

-   **Primary Library**: **ALWAYS** use components from `shadcn/ui` (`@/components/ui/*`) when available.
-   **Custom Components**: If a required component does not exist in `shadcn/ui`, create a new, small, single-purpose component in the `src/components/` directory. Style it with Tailwind CSS and build it using Radix UI primitives if necessary, following the `shadcn/ui` architecture.
-   **DO NOT** introduce other UI libraries like Material-UI, Ant Design, or Bootstrap.

### 2. Styling

-   **Exclusively use Tailwind CSS** for all styling.
-   Use the `cn` utility function from `@/lib/utils` to conditionally apply classes.
-   Avoid writing custom CSS in `.css` files. All styling should be done via Tailwind utility classes in your components.

### 3. State Management

-   **Server State**: Use **TanStack Query** for all data fetching, caching, and mutations. Use `useQuery` for reading data and `useMutation` for creating, updating, or deleting data.
-   **Client State**: For local component state, use React's built-in hooks (`useState`, `useReducer`). Avoid introducing global state managers like Redux or Zustand unless absolutely necessary and explicitly requested.

### 4. Forms

-   All forms **MUST** be implemented using **React Hook Form**.
-   All form validation **MUST** be handled using **Zod** schemas, connected via the `@hookform/resolvers` package.

### 5. Backend (Supabase)

-   All database interactions, authentication, and serverless function calls **MUST** go through the Supabase client located at `@/integrations/supabase/client.ts`.
-   Write RLS (Row Level Security) policies in Supabase for data protection.
-   For complex server-side logic, create Supabase Edge Functions.

### 6. Routing

-   Use **React Router** for all page navigation.
-   Define all routes within `src/App.tsx`.
-   Create new pages as components in the `src/pages/` directory.

### 7. Icons & Notifications

-   **Icons**: Use icons exclusively from the `lucide-react` package.
-   **Notifications**: Use `toast()` from the **Sonner** library to provide users with feedback for actions (e.g., success, error, loading).
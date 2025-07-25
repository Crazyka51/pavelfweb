# GitHub Copilot Instructions for Pavel Fišer Web Project

This document outlines instructions for GitHub Copilot to assist in the development of the Pavel Fišer web project.

## General Guidelines:

1.  **Context Awareness**: Always consider the existing codebase, especially the Next.js App Router structure, Drizzle ORM usage with Neon PostgreSQL, and Shadcn UI components.
2.  **Next.js App Router First**: Default to App Router conventions (server components, route handlers, `layout.tsx`, `page.tsx`, `loading.tsx`).
3.  **Drizzle ORM & Neon DB**: When interacting with the database, use Drizzle ORM with the `db` instance from `lib/database.ts` and `sql` from `@neondatabase/serverless`. Refer to `lib/schema.ts` for table definitions.
4.  **Shadcn UI**: Prioritize using components from `@/components/ui` for UI elements. Do not re-implement them.
5.  **TypeScript**: Always use TypeScript, ensuring strong typing and type safety.
6.  **Responsiveness**: All UI components should be responsive and work well on various screen sizes.
7.  **Accessibility**: Implement accessibility best practices (semantic HTML, ARIA attributes, alt text for images).
8.  **Error Handling**: Implement robust error handling for API calls and data operations.
9.  **Environment Variables**: Use environment variables for sensitive information (e.g., database URLs, API keys).
10. **Code Style**: Adhere to existing code style and formatting.

## Specific Tasks & Areas:

### 1. Admin Panel (`app/admin/*`)

*   **Authentication**: Use `lib/auth-utils.ts` for session management and authentication checks.
*   **Data Management**:
    *   **Articles**: Implement CRUD operations for articles using `lib/services/article-service.ts`.
    *   **Categories**: Implement CRUD operations for categories using `lib/services/category-service.ts`.
    *   **Newsletter**: Manage subscribers, campaigns, and templates using `lib/services/newsletter-service.ts`.
    *   **Settings**: Manage CMS settings using `lib/services/settings-service.ts`.
*   **UI Components**:
    *   `AdminLayout.tsx`: Main layout for the admin panel.
    *   `LoginForm.tsx`: Handles admin login.
    *   `ArticleManager.tsx`: Displays and manages a list of articles.
    *   `ArticleEditor.tsx`: Form for creating/editing articles.
    *   `CategoryManager.tsx`: Manages article categories.
    *   `NewsletterManager.tsx`: Manages newsletter subscribers and campaigns.
    *   `SettingsManager.tsx`: Manages general CMS settings.
    *   `AnalyticsManager.tsx`: Displays website analytics (mock data for now, but prepare for real integration).
    *   `TiptapEditor.tsx`: Rich text editor for article content.
*   **API Routes (`app/api/admin/*`)**: Implement API endpoints for all admin panel functionalities, ensuring proper authentication and authorization.

### 2. Public Website (`app/*`, excluding `app/admin`)

*   **Content Display**: Fetch and display articles from the database.
*   **Newsletter Signup**: Implement a form for users to subscribe to the newsletter.
*   **Contact Form**: Implement a contact form that sends emails via Resend API.
*   **Facebook Integration**: Display recent Facebook posts using the Facebook Graph API.
*   **Google Consent Mode v2**: Ensure proper implementation of cookie consent and Google Analytics integration based on user consent.
*   **SEO & Open Graph**: Generate dynamic Open Graph images and structured data for better social sharing and search engine visibility.

### 3. Services & Utilities (`lib/*`)

*   **`lib/database.ts`**: Centralized database connection and Drizzle ORM instance.
*   **`lib/schema.ts`**: Drizzle schema definitions for all database tables.
*   **`lib/auth-utils.ts`**: JWT-based authentication utilities for admin panel.
*   **`lib/cookie-consent.ts`**: Functions for managing cookie consent settings.
*   **`lib/google-analytics.ts`**: Helper for Google Analytics `gtag` commands.
*   **`lib/services/*.ts`**: Modularized services for interacting with specific database entities (articles, categories, newsletter, settings, analytics, Facebook).

### 4. Deployment & CI/CD

*   **Vercel Deployment**: Ensure the project is ready for deployment on Vercel.
*   **GitHub Actions**: Maintain and extend the existing GitHub Actions workflows for CI/CD (e.g., `neon_workflow.yml`).

## Example Interaction:

**User**: "I need to add a new field `author` to the `articles` table in the database. Update the schema, migration, and the article service to support this."

**Copilot's Expected Response**:
1.  **`lib/schema.ts`**: Suggest adding `author: text('author').notNull().default('Admin'),` to the `articles` table definition.
2.  **`database/migration.sql`**: Provide the SQL command `ALTER TABLE articles ADD COLUMN author TEXT DEFAULT 'Admin';` (or similar, depending on the current migration strategy).
3.  **`lib/services/article-service.ts`**: Update the `Article` interface and modify `createArticle`, `updateArticle`, and `getArticleById` to handle the new `author` field.
4.  **`app/admin/components/ArticleEditor.tsx`**: Suggest adding an input field for the author.
5.  **`app/api/admin/articles/route.ts`**: Update the API route to handle the new `author` field in POST/PUT requests.

By following these guidelines, GitHub Copilot can provide highly relevant and accurate assistance throughout the development of the Pavel Fišer web project.

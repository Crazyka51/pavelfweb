# Admin Panel Documentation

This document provides an overview and usage instructions for the administration panel of the Pavel Fišer website.

## Table of Contents

1.  [Overview](#1-overview)
2.  [Accessing the Admin Panel](#2-accessing-the-admin-panel)
3.  [Dashboard](#3-dashboard)
4.  [Article Management](#4-article-management)
    *   [Viewing Articles](#41-viewing-articles)
    *   [Creating New Articles](#42-creating-new-articles)
    *   [Editing Articles](#43-editing-articles)
    *   [Deleting Articles](#44-deleting-articles)
    *   [Publishing and Drafts](#45-publishing-and-drafts)
5.  [Category Management](#5-category-management)
    *   [Viewing Categories](#51-viewing-categories)
    *   [Creating/Editing Categories](#52-creatingediting-categories)
    *   [Deleting Categories](#53-deleting-categories)
6.  [Newsletter Management](#6-newsletter-management)
    *   [Subscribers](#61-subscribers)
    *   [Campaigns](#62-campaigns)
    *   [Templates](#63-templates)
7.  [Analytics](#7-analytics)
8.  [Settings](#8-settings)
9.  [Troubleshooting](#9-troubleshooting)

---

## 1. Overview

The admin panel is a centralized content management system (CMS) designed to allow Pavel Fišer and authorized users to manage the website's content, including articles, categories, newsletter subscribers, and general site settings. It provides a user-friendly interface for common administrative tasks.

## 2. Accessing the Admin Panel

The admin panel is accessible via the `/admin` route of the website.
You will be prompted to log in with your credentials.

**Login Credentials:**
*   **Username**: `admin` (or as configured in environment variables)
*   **Password**: Set via `ADMIN_PAVEL_PASSWORD` environment variable.

**Important**: Keep your login credentials secure. Do not share them publicly.

## 3. Dashboard

Upon successful login, you will be redirected to the Dashboard. This section provides a quick overview of key metrics and recent activities, such as:
*   Total number of articles
*   Number of published articles
*   Recent comments (if implemented)
*   Newsletter subscriber count
*   Quick links to common tasks (e.g., "New Article", "View Analytics").

## 4. Article Management

This section allows you to create, edit, publish, and manage all articles on the website.

### 4.1. Viewing Articles

Navigate to the "Články" (Articles) tab. Here you will see a table listing all articles.
*   **Search**: Use the search bar to find articles by title, content, or tags.
*   **Filter by Category**: Filter articles by their assigned category.
*   **Filter by Status**: Filter by "Publikováno" (Published), "Koncept" (Draft), or "Archivováno" (Archived).
*   **Pagination**: Use the "Předchozí" and "Další" buttons to navigate through pages of articles.

### 4.2. Creating New Articles

Click the "Nový článek" (New Article) button. You will be taken to the Article Editor.
Fill in the following fields:
*   **Název článku (Article Title)**: The main title of your article.
*   **URL Slug**: Automatically generated from the title, but can be edited for SEO-friendly URLs.
*   **Úryvek (Excerpt)**: A short summary of the article, used for previews.
*   **Obsah článku (Article Content)**: The main body of the article. Use the Tiptap editor for rich text formatting.
*   **Kategorie (Category)**: Select an existing category for the article.
*   **URL obrázku (Image URL)**: Link to a featured image for the article.
*   **Stav (Status)**: Set to "Koncept" (Draft), "Publikováno" (Published), or "Archivováno" (Archived).
*   **Datum publikace (Publication Date)**: Optionally schedule a future publication date.
*   **Doporučený článek (Featured Article)**: Mark as featured to highlight it on the homepage or other prominent sections.
*   **Meta Titulek (Meta Title)**: For SEO, the title that appears in search engine results.
*   **Meta Popis (Meta Description)**: For SEO, the description that appears in search engine results.

Click "Vytvořit koncept" to save as a draft, or "Publikovat" to immediately publish the article.

### 4.3. Editing Articles

From the article list, click the "Upravit" (Edit) button next to the article you wish to modify. The Article Editor will load with the existing content. Make your changes and click "Uložit změny".

### 4.4. Deleting Articles

From the article list, click the "Smazat" (Delete) button next to the article. A confirmation dialog will appear. Confirm to permanently delete the article. This action is irreversible.

### 4.5. Publishing and Drafts

*   **Drafts**: Articles saved with "Koncept" status are not visible to the public.
*   **Published**: Articles with "Publikováno" status are live on the website.
*   **Scheduled**: Articles with a future "Datum publikace" will automatically become "Publikováno" at the specified time.

## 5. Category Management

This section allows you to organize your articles into categories.

### 5.1. Viewing Categories

Navigate to the "Kategorie" (Categories) tab. You will see a list of all defined categories along with the number of articles in each.

### 5.2. Creating/Editing Categories

Click "Nová kategorie" to create a new one, or "Upravit" next to an existing category.
*   **Název (Name)**: The name of the category (e.g., "Aktuality", "Doprava").
*   **Popis (Description)**: An optional description for the category.

Click "Vytvořit" or "Uložit změny" to save.

### 5.3. Deleting Categories

Click "Smazat" next to a category. Confirm to delete. Articles previously assigned to this category will have their category set to `NULL`.

## 6. Newsletter Management

Manage your newsletter subscribers, create and send campaigns, and manage email templates.

### 6.1. Subscribers

Navigate to the "Odběratelé" (Subscribers) tab.
*   View a list of all subscribers, their subscription date, source, and status (active/unsubscribed).
*   You can manually unsubscribe users.
*   **Export CSV**: Download a CSV file of all subscribers.

### 6.2. Campaigns

Navigate to the "Kampaně" (Campaigns) tab.
*   **Nová kampaň (New Campaign)**: Create a new email campaign.
    *   **Předmět e-mailu (Email Subject)**: The subject line of your newsletter.
    *   **Obsah e-mailu (Email Content)**: The body of your newsletter. HTML content is supported.
    *   You can choose to send to selected active subscribers or all active subscribers.
    *   Click "Odeslat kampaň" to send.
*   **Historie kampaní (Campaign History)**: View a list of all previously sent campaigns, including subject, send date, and basic statistics (recipients, opens, clicks).

### 6.3. Templates

Navigate to the "Šablony" (Templates) tab.
*   Create and manage reusable email templates for your campaigns.

## 7. Analytics

Navigate to the "Analytika" (Analytics) tab.
*   View basic website traffic statistics, such as page views and visitors.
*   (Note: Advanced metrics and daily trends may require further integration.)

## 8. Settings

Navigate to the "Nastavení" (Settings) tab.
*   **Obecná nastavení (General Settings)**: Configure site title, description, contact email, and integration IDs (Google Analytics, Facebook Page ID).
*   **Nastavení administrátora (Admin Settings)**: View the admin username. You can change the admin password here (leave blank to keep current).
*   **Povolit newsletter (Enable Newsletter)**: Toggle the newsletter functionality on/off for the public website.

Remember to click "Uložit nastavení" after making any changes.

## 9. Troubleshooting

*   **Login Issues**: Double-check your username and password. Ensure the `ADMIN_PAVEL_PASSWORD` environment variable is correctly set on your deployment platform (Vercel).
*   **Data Not Loading**: Check your browser's developer console for network errors. Ensure your Neon PostgreSQL database is running and accessible, and `DATABASE_URL` is correctly configured.
*   **API Errors**: If you encounter errors when saving or fetching data, check the server logs on Vercel for more detailed error messages.
*   **UI Glitches**: Try clearing your browser cache or performing a hard refresh.

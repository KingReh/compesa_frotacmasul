# AI Development Rules for Fleet Management App

This document outlines the technical stack and coding conventions for the AI assistant working on this project. Adhering to these rules ensures consistency, maintainability, and simplicity.

## Tech Stack

The application is built with a simple, effective stack that avoids complex build steps.

*   **Core Technologies**: The foundation is built on vanilla HTML5, CSS3, and JavaScript (ES Modules). No frontend frameworks like React or Vue are used.
*   **Styling**: Styling is primarily handled by **Tailwind CSS** (loaded via CDN) for a utility-first approach. Custom styles for animations and complex components are located in `css/styles.css`.
*   **Database**: **Supabase** serves as the backend for all persistent data, including vehicle maintenance status, material stock levels, and maintenance notes.
*   **Data Visualization**: **Chart.js** is used to render all charts and graphs, such as the pie charts summarizing vehicle balances and operational status.
*   **File Parsing**: The **xlsx** library is used for parsing data from Excel (`.xls`) files. For HTML files, the native `DOMParser` API is used.
*   **Image Generation**: **html2canvas** provides the functionality to capture the main content area as a PNG image for downloading or sharing.
*   **Development Environment**: The project uses `live-server` for local development and `pnpm` as the package manager for development dependencies.

## Library and Convention Rules

Follow these rules when adding or modifying features.

### Styling (CSS)

*   **Prioritize Tailwind CSS**: For all new UI elements and styling changes, use Tailwind's utility classes directly in the `index.html` file.
*   **Use `styles.css` Sparingly**: Only add rules to `css/styles.css` for complex, reusable component styles, custom animations, or global base styles that are difficult to manage with utility classes alone. Do not create new CSS files.

### JavaScript and DOM Manipulation

*   **Vanilla JS Only**: All DOM manipulation, event handling, and application logic must be written in vanilla JavaScript. Do not introduce libraries like jQuery.
*   **Use Existing Functions**: Leverage the helper functions already present in `js/script.js` and `js/maintenance_notes.js`, such as:
    *   `showNotification(message)` for success messages.
    *   `showError(message)` for displaying errors to the user.
    *   `toggle...Modal(show)` and `manageBackdrop(show)` for handling all modal visibility.
*   **Modularity**: Keep logic separated. `js/script.js` handles the main application logic, while `js/maintenance_notes.js` is dedicated to the maintenance notes feature. Maintain this separation.

### Database (Supabase)

*   **Single Source of Truth**: All interactions with the database (reading or writing data) must be done through the Supabase client instance.
*   **Consistency**: Ensure the Supabase client is initialized and used consistently across all relevant JavaScript files.

### Third-Party Libraries

*   **Charts**: Use **Chart.js** for any new data visualizations.
*   **File Handling**: Use the global `XLSX` object for Excel files and `DOMParser` for HTML files.
*   **Adding New Libraries**: Prefer adding new client-side libraries via a CDN link in `index.html` to keep the project simple and avoid a build process. Only add npm dependencies if they are for development tooling.
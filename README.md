# Worcoor

A brief description....

## Technologies Used

*   Next.js
*   React
*   TypeScript
*   Tailwind CSS
*   Radix UI
*   Axios
*   React Hook Form
*   Zod
*   Recharts
*   date-fns
*   And more...

## Project Structure

The project follows a standard Next.js structure with a focus on separating concerns:

*   `src/`: Contains the main application logic, including services, utilities, contexts, and constants.
*   `components/`: Reusable UI components.
*   `lib/`: Utility functions and data.
*   `hooks/`: Custom React hooks.
*   `app/`: Next.js app router pages and layouts.

## Setup and Installation

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Install dependencies using your preferred package manager (npm, yarn, or pnpm):

    ```bash
    pnpm install
    # or npm install
    # or yarn install
    ```

4.  Copy the `.env.example` file to `.env.local` and update environment variables if necessary.

    ```bash
    cp .env.example .env.local
    ```

5.  Run the development server:

    ```bash
    pnpm dev
    # or npm run dev
    # or yarn dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

*   **Authentication:** User authentication managed via `AuthContext` and persisted in local storage.
*   **API Service:** Centralized service (`apiService.ts`) for making API calls with built-in authentication header handling and token refresh logic.
*   **Styling:** Utilizes Tailwind CSS with a custom theme and Radix UI components for a consistent and responsive design.

## Contributing

Instructions on how to contribute...

## License

Project license information...

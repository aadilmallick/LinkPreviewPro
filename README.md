# Link Preview Pro

This is a web application that allows users to generate a preview of a URL, similar to how social media sites like Twitter or Facebook display link previews. The user can enter a URL, and the application will fetch metadata from that URL (title, description, image, etc.) and display it in a customizable card format.

## Technical Overview

The project is a monorepo with a `client` and `server` directory.

*   **Frontend:** The client is a React application built with Vite and TypeScript. It uses `wouter` for routing, `@tanstack/react-query` for data fetching and state management, and `tailwindcss` for styling.
*   **Backend:** The server is a Deno application using an Express.js compatibility layer. It's responsible for fetching the metadata from the provided URL.

## Application Logic Flow

1.  The user lands on the homepage (`client/src/pages/home.tsx`).
2.  The `LinkPreviewForm` component (`client/src/components/link-preview-form.tsx`) is displayed, allowing the user to input a URL.
3.  As the user types, the input is validated in real-time to ensure it's a valid URL format.
4.  When the user submits the form, the `generatePreviewMutation` (using `@tanstack/react-query`) is triggered.
5.  A `POST` request is sent to the `/api/preview` endpoint on the backend server.
6.  The backend server (`server/routes.ts`) receives the request, validates the payload, and then uses `axios` and `cheerio` to fetch the HTML of the target URL and scrape the relevant metadata (Open Graph tags, Twitter card tags, title, description, etc.).
7.  The extracted metadata is returned to the client as a JSON response.
8.  On the client, the `onSuccess` callback of the mutation updates the application's state with the new preview data.
9.  The `StyledPreviewCard` component (`client/src/components/styled-preview-card.tsx`) re-renders to display the fetched preview information.
10. The user can then use the `StyleSelector` component to change the appearance of the preview card (e.g., dark mode, compact layout).
11. The user can also use the `ExportDialog` to get an image of the generated preview card.

## File Breakdown

### `server/`

*   **`main.ts`**: This is the entry point for the Deno server. It sets up the Express application, configures CORS, serves the static frontend files from the `client/dist` directory, and registers the API routes from `routes.ts`. It also includes a catch-all route to serve the `index.html` for any non-API requests, which is standard for single-page applications.
*   **`routes.ts`**: This file defines the API endpoints.
    *   `POST /api/preview`: This is the core endpoint. It takes a URL in the request body, calls the `extractMetadata` function to scrape the data, and returns the metadata as JSON. It includes error handling for invalid URLs or sites that can't be reached.
    *   `GET /api/styles`: This endpoint returns a predefined list of styles that the user can apply to the preview card on the frontend.
*   **`deno.json`**: The configuration file for Deno. It defines tasks for running, building, and deploying the application. It also manages dependencies.

### `client/`

*   **`package.json`**: Defines the project's dependencies (React, Vite, etc.) and scripts for development and building the frontend.
*   **`src/main.tsx`**: The entry point for the React application. It renders the main `App` component into the DOM.
*   **`src/App.tsx`**: The root component of the application. It sets up the `QueryClientProvider` for `@tanstack/react-query`, the `TooltipProvider`, the `Toaster` for notifications, and the `Router` using `wouter`.
*   **`src/pages/home.tsx`**: This is the main page of the application. It manages the state for the preview data and the selected style. It composes the main components of the UI: `LinkPreviewForm`, `StyleSelector`, `CacheControls`, `StyledPreviewCard`, `ExampleUrls`, and `FeaturesSection`.
*   **`src/components/link-preview-form.tsx`**: A form component with an input field for the URL. It handles URL validation and triggers the API call to the backend to generate the preview when the form is submitted. It uses `useMutation` from `@tanstack/react-query` to handle the API request state (loading, error, success).
*   **`src/components/preview-card.tsx`**: A simple, unstyled component that displays the link preview data. It's a basic representation of the fetched metadata.
*   **`src/components/styled-preview-card.tsx`**: This component takes the preview data and a `style` object and renders a styled version of the preview card. It handles different layouts (horizontal, vertical, compact) and allows for customization of colors, borders, etc. It also contains the logic for copying the URL and a dialog for exporting the card as an image.
*   **`src/components/style-selector.tsx`**: This component fetches the available styles from the `/api/styles` endpoint and allows the user to select one. When a style is selected, it updates the state in the `home.tsx` page.
*   **`src/components/cache-controls.tsx`**: This component provides buttons to force a refresh of the preview data, which bypasses any server-side caching.
*   **`src/components/export-dialog.tsx`**: A dialog component that uses `html2canvas` to take a "screenshot" of the `StyledPreviewCard` and allows the user to download it as a PNG or copy it to the clipboard.
*   **`src/lib/queryClient.ts`**: This file configures and exports the `QueryClient` instance for `@tanstack/react-query`. It also contains a helper function `apiRequest` for making requests to the backend.
*   **`src/types.ts`**: Contains TypeScript type definitions for the `LinkPreview` and `PreviewStyle` objects used throughout the application.

## How to Run

### Frontend (Development)

1.  `cd client`
2.  `npm install`
3.  `npm run dev`

### Backend (Development)

1.  `cd server`
2.  `deno run -A --watch main.ts`

### Production

1.  From the `server` directory, run `deno task start`. This will first build the client-side assets and then start the production server.

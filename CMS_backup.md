Prompt for Building a CMS Dashboard with Next.js and TypeScript
Project Overview
Create a CMS dashboard web application using Next.js 14 with TypeScript, styled with Tailwind CSS, featuring a responsive sidebar navigation and pages for the following features: Gallery, Social Media Analytics, Social Media Uploader, Website Analytics, Destination, Hotel, Package, Chatbot, and GIS. For this initial phase, focus on implementing the Gallery and Chatbot functionalities, as their APIs are available at https://backend.bidukbiduk.com/api/. Other features should have placeholder pages with a "Coming Soon" message. The dashboard should be secure, modular, use environment variables for API configuration, and follow best practices for Next.js and TypeScript.
Requirements
General Structure

Framework: Use Next.js 14 (App Router) with TypeScript.
Styling: Use Tailwind CSS for responsive and modern UI design.
Layout:
A fixed sidebar on the left (collapsible on mobile) with navigation links to all features (Gallery, Socmed Analytics, Socmed Uploader, Website Analytics, Destination, Hotel, Package, Chatbot, GIS).
A main content area displaying the active page.
Responsive design: Sidebar should collapse into a hamburger menu on mobile screens (<768px).


State Management: Use React's built-in hooks (useState, useEffect, etc.) for state management. Avoid external libraries like Redux for simplicity.
API Integration: Use Axios for HTTP requests to interact with the provided APIs for Gallery and Chatbot, with the base URL stored in an environment variable.
Routing: Use Next.js App Router for dynamic and static routes.
Type Safety: Define TypeScript interfaces for all API responses and component props.

Environment Variables

Store the API base URL in a .env file to avoid hardcoding.
Example .env configuration:NEXT_PUBLIC_API_BASE_URL=https://backend.bidukbiduk.com/api/


Use process.env.NEXT_PUBLIC_API_BASE_URL in API calls to dynamically construct endpoint URLs.
Ensure the .env file is included in .gitignore to prevent sensitive information from being committed.
Provide a .env.example file with the structure:NEXT_PUBLIC_API_BASE_URL=



Sidebar

Fixed sidebar with a logo or title at the top (e.g., "CMS Dashboard").
Navigation links/icons for all features:
Gallery
Socmed Analytics
Socmed Uploader
Website Analytics
Destination
Hotel
Package
Chatbot
GIS


Active link should be highlighted (e.g., with a different background or border).
Collapsible on mobile using a hamburger menu toggle.
Use Tailwind CSS for styling (e.g., bg-gray-800 for sidebar, text-white for links).

Pages

Gallery Page:

Subpages:
List View: Display a table or grid of gallery items fetched from GET /api/gallery/ (gallery_list).
Columns: ID, Title, Category, Thumbnail (if available), Actions (View, Edit, Delete).
Actions: Buttons for viewing details, editing, and deleting items.


Create View: Form to create a new gallery item using POST /api/gallery/ (gallery_create).
Fields: Title, Description, Category (dropdown from GET /api/gallery/categories/), Image URL or file upload.


Edit View: Form to update an existing gallery item using PUT /api/gallery/{id}/ or PATCH /api/gallery/{id}/ (gallery_update, gallery_partial_update).
Pre-filled with item details from GET /api/gallery/{id}/ (gallery_retrieve).


Category Management: Page to manage categories (list, create, edit, delete) using /api/gallery/categories/ endpoints.
List: Table of categories from GET /api/gallery/categories/ (gallery_categories_list).
Create: Form for POST /api/gallery/categories/ (gallery_categories_create).
Edit: Form for PUT /api/gallery/categories/{id}/ or PATCH /api/gallery/categories/{id}/ (gallery_categories_update, gallery_categories_partial_update).
Delete: Button for DELETE /api/gallery/categories/{id}/ (gallery_categories_destroy).




Features:
Pagination or infinite scroll for the list view (if API supports it).
Confirmation dialog for delete actions using DELETE /api/gallery/{id}/ (gallery_destroy).
Form validation (e.g., required fields, valid image URL).
Loading states and error handling for API calls.




Chatbot Page:

Simple chat interface to interact with POST /api/chatbot/message (chatbot_message_create).
Features:
Text input for user messages.
Display conversation history (user messages and bot responses).
Auto-scroll to the latest message.
Loading state while waiting for bot response.
Error handling for failed API calls.


UI: Chat bubbles (user: right-aligned, bot: left-aligned) styled with Tailwind CSS.


Other Pages (Socmed Analytics, Socmed Uploader, Website Analytics, Destination, Hotel, Package, GIS):

Placeholder pages with a centered "Coming Soon" message.
Each page should be accessible via the sidebar and have a consistent layout with the main content area.



API Integration
Use the following APIs for the Gallery and Chatbot features, with the base URL sourced from process.env.NEXT_PUBLIC_API_BASE_URL (e.g., https://backend.bidukbiduk.com/api/).
Gallery APIs

List all gallery items: GET ${NEXT_PUBLIC_API_BASE_URL}/gallery/ (gallery_list)
Create a new gallery item: POST ${NEXT_PUBLIC_API_BASE_URL}/gallery/ (gallery_create)
Get gallery item details: GET ${NEXT_PUBLIC_API_BASE_URL}/gallery/{id}/ (gallery_retrieve)
Update gallery item: PUT ${NEXT_PUBLIC_API_BASE_URL}/gallery/{id}/ (gallery_update)
Partially update gallery item: PATCH ${NEXT_PUBLIC_API_BASE_URL}/gallery/{id}/ (gallery_partial_update)
Delete gallery item: DELETE ${NEXT_PUBLIC_API_BASE_URL}/gallery/{id}/ (gallery_destroy)
List all gallery categories: GET ${NEXT_PUBLIC_API_BASE_URL}/gallery/categories/ (gallery_categories_list)
Create a new gallery category: POST ${NEXT_PUBLIC_API_BASE_URL}/gallery/categories/ (gallery_categories_create)
Get gallery category details: GET ${NEXT_PUBLIC_API_BASE_URL}/gallery/categories/{id}/ (gallery_categories_retrieve)
Update gallery category: PUT ${NEXT_PUBLIC_API_BASE_URL}/gallery/categories/{id}/ (gallery_categories_update)
Partially update gallery category: PATCH ${NEXT_PUBLIC_API_BASE_URL}/gallery/categories/{id}/ (gallery_categories_partial_update)
Delete gallery category: DELETE ${NEXT_PUBLIC_API_BASE_URL}/gallery/categories/{id}/ (gallery_categories_destroy)

Chatbot API

Send message to chatbot: POST ${NEXT_PUBLIC_API_BASE_URL}/chatbot/message (chatbot_message_create)

Implementation:

Create a dedicated api folder (e.g., /lib/api) with TypeScript functions for each API endpoint.
Use Axios for HTTP requests with proper error handling.
Construct API URLs dynamically using process.env.NEXT_PUBLIC_API_BASE_URL.
Example API function:import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getGalleryItems = async () => {
  const response = await axios.get(`${API_BASE_URL}/gallery/`);
  return response.data;
};


Define TypeScript interfaces for API request/response data (e.g., GalleryItem, GalleryCategory, ChatbotMessage).
Handle loading states and errors gracefully with user feedback (e.g., toast notifications or error messages).



Project Structure
Use a monorepo-like structure within a single Next.js project:
/project
├── /app
│   ├── /gallery
│   │   ├── page.tsx (List view)
│   │   ├── create/page.tsx (Create view)
│   │   ├── [id]/page.tsx (Details/Edit view)
│   │   └── categories/page.tsx (Category management)
│   ├── /chatbot
│   │   └── page.tsx
│   ├── /socmed-analytics/page.tsx (Placeholder)
│   ├── /socmed-uploader/page.tsx (Placeholder)
│   ├── /website-analytics/page.tsx (Placeholder)
│   ├── /destination/page.tsx (Placeholder)
│   ├── /hotel/page.tsx (Placeholder)
│   ├── /package/page.tsx (Placeholder)
│   ├── /gis/page.tsx (Placeholder)
│   ├── layout.tsx (Root layout with sidebar)
│   └── page.tsx (Dashboard homepage, e.g., redirect to Gallery)
├── /components
│   ├── Sidebar.tsx
│   ├── GalleryList.tsx
│   ├── GalleryForm.tsx
│   ├── ChatbotInterface.tsx
│   └── PlaceholderPage.tsx
├── /lib
│   ├── api
│   │   ├── gallery.ts (API functions for gallery)
│   │   └── chatbot.ts (API functions for chatbot)
│   └── types.ts (TypeScript interfaces)
├── /public
│   └── (static assets, e.g., logo)
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js

TypeScript Interfaces
Define interfaces for API data, e.g.:

GalleryItem: { id: number; title: string; description?: string; category: GalleryCategory; imageUrl?: string }
GalleryCategory: { id: number; name: string }
ChatbotMessage: { id?: number; userMessage: string; botResponse?: string; timestamp: string }

Additional Features

Authentication: Assume a simple auth check (e.g., token-based) for accessing the dashboard. Mock this for now (e.g., a hardcoded token in localStorage) since no auth API is provided.
Error Handling: Show user-friendly error messages for failed API calls (e.g., "Failed to load gallery items").
Loading States: Use spinners or skeleton UI for loading states.
Responsive Design: Ensure the dashboard is usable on mobile, tablet, and desktop.
Accessibility: Use semantic HTML and ARIA attributes for accessibility.

Dependencies

next: Latest version (14.x)
typescript: Latest version
tailwindcss: For styling
axios: For API requests
@headlessui/react: For accessible UI components (e.g., dropdowns, modals)
react-icons: For sidebar and button icons

Deliverables

Fully functional Next.js project with TypeScript.
Complete source code for the dashboard, including:
Sidebar component.
Gallery feature (list, create, edit, delete, category management).
Chatbot feature (chat interface with message history).
Placeholder pages for other features.
API integration with TypeScript functions using environment variables.


.env.example file with NEXT_PUBLIC_API_BASE_URL.
README with setup and running instructions, including how to configure the .env file.
Deployable to Vercel or similar platforms.

Notes

Focus on Gallery and Chatbot for now; other features are placeholders.
Ensure API calls use process.env.NEXT_PUBLIC_API_BASE_URL to avoid hardcoding.
Mock or test API calls with the provided base URL (https://backend.bidukbiduk.com/api/).
Use Tailwind CSS for a clean, modern look.
Keep the code modular and reusable for future expansion (e.g., adding APIs for other features).

# Biduk-Biduk CMS

A modern Content Management System built with Next.js for managing gallery items and content for the Biduk-Biduk tourism project.

## Features

- 🔐 **Authentication System** - Secure login/register with Indonesian language support
- 🖼️ **Gallery Management** - Upload, view, edit, and delete images with preview
- 📱 **Responsive Design** - Mobile-friendly interface built with Tailwind CSS
- 🗑️ **Delete Modals** - Professional confirmation dialogs for better UX
- 📁 **File Upload** - Direct file upload with image preview
- 🔧 **API Integration** - Proper authentication with backend services
- ✅ **Form Validation** - Comprehensive input validation and error handling

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Authentication**: JWT-based authentication
- **File Upload**: FormData with image preview
- **State Management**: React hooks and context

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Set up environment variables by creating a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://backend.bidukbiduk.com/api
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── gallery/           # Gallery management pages
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── contexts/             # React context providers
├── lib/                  # Utilities and API services
│   ├── api/             # API service functions
│   ├── types.ts         # TypeScript type definitions
│   └── utils/           # Utility functions
└── types/               # Additional type definitions
```

## Features Overview

### Authentication
- User registration and login
- Password reset functionality
- Indonesian language interface
- JWT token management

### Gallery Management
- Image upload with file preview
- Gallery item CRUD operations
- Category management
- Delete confirmation modals
- Responsive grid layout

### User Interface
- Clean, modern design
- Mobile-responsive layout
- Loading states and error handling
- Professional confirmation dialogs

## API Integration

The application integrates with a backend API for:
- User authentication
- Gallery item management
- File upload handling
- Category management

## Development

This project uses:
- **Next.js** for the React framework
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code linting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the Biduk-Biduk tourism initiative.

---

Built with ❤️ for the Biduk-Biduk community

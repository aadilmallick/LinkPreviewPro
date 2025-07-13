# Link Preview Generator

## Overview

This is a full-stack web application built to generate link previews for URLs. The app allows users to input a URL and generates a rich preview card displaying the website's metadata including title, description, image, and favicon. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data storage and Drizzle ORM for database management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Comprehensive set of Radix UI primitives wrapped in custom components

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API endpoints
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Custom middleware for API request/response logging

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema migrations
- **Storage Strategy**: Dual storage implementation (in-memory for development, PostgreSQL for production)

## Key Components

### Data Models
- **Link Previews**: Stores URL metadata including title, description, image, favicon, site name, and creation timestamp
- **Schema Definition**: Centralized in `shared/schema.ts` with Zod validation

### Core Features
1. **URL Input & Validation**: Real-time URL validation with visual feedback
2. **Metadata Extraction**: Server-side web scraping using Cheerio to extract Open Graph, Twitter Card, and standard HTML metadata
3. **Preview Generation**: Rich preview cards with fallback handling for missing data
4. **Example URLs**: Pre-configured example URLs for quick testing
5. **Responsive Design**: Mobile-first design with responsive layouts

### API Endpoints
- `POST /api/preview`: Accepts URL and returns extracted metadata
- Error handling for invalid URLs and extraction failures

## Data Flow

1. **User Input**: User enters URL in the frontend form
2. **Client Validation**: Real-time URL format validation using regex
3. **API Request**: Form submission triggers POST request to `/api/preview`
4. **Server Processing**: 
   - Server validates URL format using Zod schema
   - Checks database for existing preview (caching)
   - If not cached, extracts metadata using Axios + Cheerio
   - Stores result in database
   - Returns preview data to client
5. **UI Update**: Client displays preview card with extracted metadata
6. **Error Handling**: Toast notifications for success/failure states

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations
- **axios**: HTTP client for web scraping
- **cheerio**: Server-side HTML parsing and manipulation
- **zod**: Runtime schema validation

### UI Dependencies
- **@radix-ui/***: Primitive UI components for accessibility
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Production Mode**: Serves static files and API from single Node.js process

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Development**: Hot reloading with Vite dev server
- **Production**: Static file serving with Express

### Database Setup
- **Schema Management**: Drizzle migrations in `./migrations` directory
- **Push Command**: `npm run db:push` applies schema changes
- **Connection**: Configured for PostgreSQL with connection pooling

The application is designed to be deployed on platforms like Replit, Vercel, or similar Node.js hosting environments with PostgreSQL database support.
# FocusZen - Pomodoro Timer App

## Overview

FocusZen is a full-stack Pomodoro timer application built with React frontend and Express backend. The application provides productivity tracking through timer sessions, analytics, streak monitoring, and premium subscription features. It follows a modern web architecture with TypeScript throughout, shadcn/ui components, and PostgreSQL database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library following Material Design 3 principles
- **State Management**: React Context for theme and timer state, TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect for user authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with proper error handling and middleware

### Database Design
- **Database**: PostgreSQL with Neon Database as provider
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: User management, timer sessions, user settings, daily streaks, and motivational quotes
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Timer System
- **Timer Context**: React context managing timer state, session tracking, and background operation
- **Session Types**: Focus sessions, short breaks, and long breaks
- **Preset Durations**: 25/5, 50/10, 90/15 minute configurations
- **Background Operation**: Timer worker for continuous operation when tab is inactive

### User Management
- **Authentication**: Replit Auth integration with automatic user creation
- **Premium Subscriptions**: Stripe integration for payment processing
- **User Settings**: Customizable preferences for notifications, sounds, and timer defaults

### Analytics & Progress Tracking
- **Session History**: Complete tracking of all timer sessions with completion status
- **Daily Streaks**: Automatic streak calculation based on completed sessions
- **Analytics Dashboard**: Visual progress tracking with time-based filtering
- **Motivational Quotes**: Random quote system for user engagement

### Premium Features
- **Subscription Tiers**: Monthly and yearly premium plans via RevenueCat/Stripe
- **Enhanced Features**: Custom timer durations, premium ambient sounds, detailed analytics
- **Payment Integration**: Stripe Elements for secure payment processing

## Data Flow

### Timer Session Flow
1. User selects timer preset or custom duration
2. Timer context creates session record in database
3. Timer runs with real-time updates and background persistence
4. Session completion triggers streak updates and motivational quotes
5. Analytics are updated with new session data

### Authentication Flow
1. User accesses protected route
2. Replit Auth middleware validates session
3. User data retrieved from database or created if new
4. Premium status checked for feature access

### Subscription Flow
1. User initiates subscription from premium modal
2. Stripe payment intent created on backend
3. Payment processed via Stripe Elements
4. User premium status updated upon successful payment

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing

### UI & Styling
- **@radix-ui/***: Primitive UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Payment & Authentication
- **@stripe/stripe-js** & **@stripe/react-stripe-js**: Payment processing
- **openid-client**: OpenID Connect authentication
- **passport**: Authentication middleware

### Development Tools
- **typescript**: Type safety across the stack
- **vite**: Frontend build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and error overlay
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Neon Database with connection pooling
- **Environment**: Replit-optimized with cartographer plugin

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: Served via Express static middleware
- **Database**: Production PostgreSQL with connection pooling

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **Authentication**: Replit Auth configuration with `REPL_ID` and domain settings
- **Payments**: Stripe keys for payment processing
- **Sessions**: Secure session secret for user authentication

The application follows a monorepo structure with shared TypeScript schemas, enabling type safety across the full stack while maintaining clear separation between client and server code.
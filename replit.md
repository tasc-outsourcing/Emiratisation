# UAE Emiratisation Risk Assessment Application

## Overview
A comprehensive web application for assessing UAE emiratisation compliance risk. The system evaluates companies against emiratisation requirements based on industry, jurisdiction, and workforce composition, providing risk assessments, potential fine calculations, and compliance recommendations.

## Project Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Migrated from in-memory to persistent database storage
- **API**: RESTful endpoints for industries, assessments, configuration, and statistics

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state
- **UI**: Shadcn/ui components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation

### Database Schema
- **Industries**: Configurable sectors with emiratisation rates and risk multipliers
- **Assessments**: Company evaluations with calculated risk metrics
- **Configuration**: System-wide settings for thresholds and fine structures

## Key Features

### Risk Assessment
- Company details form with industry selection
- Real-time risk calculation based on workforce composition
- Jurisdiction-specific adjustments (mainland vs freezone)
- Visual risk indicators and recommendations

### Management Dashboard
- Industry configuration with CRUD operations
- Risk threshold management
- Fine structure configuration
- System statistics and reporting

### Risk Calculation Logic
- Emiratisation rate adjusted by jurisdiction multiplier
- Risk percentage based on Emirati employee gap
- Potential fine calculation with industry and jurisdiction factors
- Three-tier risk classification (low/medium/high)

## Recent Changes

### December 14, 2024
- **Database Migration**: Successfully migrated from in-memory storage to PostgreSQL
  - Created database tables for industries, assessments, and configuration
  - Implemented DatabaseStorage class replacing MemStorage
  - Populated default data for industries and configuration
  - Updated storage interface to use Drizzle ORM with proper error handling

### Technical Implementation
- Added database connection with Neon serverless PostgreSQL
- Implemented proper type safety with Drizzle schema validation
- Maintained existing API compatibility during storage migration
- Enhanced error handling for database operations

## Configuration
- **Colors**: UAE-themed color palette with primary blue (#3B82F6)
- **Typography**: Inter font family for modern, professional appearance
- **Icons**: Lucide React for consistent iconography
- **Responsive**: Mobile-first design with Tailwind CSS

## User Preferences
- Prefers clear, direct communication
- Values comprehensive solutions over partial implementations
- Focuses on UAE-specific business requirements and compliance
# TASC Emiratisation Risk Assessment Tool

## Overview
A lead-generation microtool for TASC Outsourcing that calculates UAE Emiratisation compliance risk and potential fines under MoHRE 2025 regulations. The application captures company data, determines compliance gaps, assigns risk scores, and converts users through strategic call-to-action elements.

## Project Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: DatabaseStorage implementing IStorage interface
- **API**: RESTful endpoints for assessments, configuration, and admin functions
- **Webhooks**: Zapier integration for lead capture to HubSpot

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state
- **UI**: Shadcn/ui components with TASC custom branding
- **Forms**: React Hook Form with Zod validation

### Database Schema
- **Assessments**: Complete company evaluations with lead capture and calculated risk metrics
- **Configuration**: Admin-configurable settings for emiratisation targets and fines

## Key Features

### Risk Assessment Flow
1. Company profile form (location, sector, workforce data)
2. Emirati workforce details (compliance status, recent departures)
3. Lead capture modal before results
4. Comprehensive results display with risk scoring
5. Three CTA cards (Book Call, Call Now, Download Guide)

### Business Logic
- **Emiratisation Requirements**: Based on location (freezone exempt), employee count thresholds, and sector designation
- **Risk Calculation**: 100-point scale with gap penalties, compliance bonuses
- **Fine Estimation**: AED 96,000 per missing Emirati with jurisdiction adjustments
- **Risk Levels**: Low (71-100), Medium (41-70), High (0-40)

### Admin Panel
- Password-protected admin access
- Configuration management (target %, fine amounts)
- Assessment statistics and analytics
- Data export functionality
- Real-time dashboard with sector breakdown

## TASC Branding
- **Colors**: Primary (#004267), Teal (#00A49E), Yellow (#FFC500), Light Blue (#007FAD), Green (#3EB54A)
- **Typography**: Inter font family
- **Components**: 12px border radius, 300px header height
- **CTA Elements**: Yellow primary CTA, blue secondary buttons

## Recent Changes

### June 24, 2025
- **Mobile Experience Improvements**: Enhanced mobile responsiveness and user experience
  - Fixed mobile padding issues for header logo and buttons
  - Repositioned logo to top-left on desktop (50% smaller), centered on mobile
  - Added proper padding throughout mobile interface
  
- **Form Simplification**: Streamlined assessment form structure and logic
  - Changed company location from radio buttons to dropdown with descriptive options
  - Removed group company questions to simplify user flow
  - Added explanatory descriptions to all form fields for better user guidance
  - Changed 'Skilled Employees' to 'Number of Skilled Employees' for clarity
  - Removed 'Are Emiratis in skilled roles' question (now assumes all are skilled)
  
- **Backend Updates**: Updated schema and logic to match simplified form
  - Removed group-related fields from database schema
  - Updated risk calculation to assume all Emiratis are in skilled roles
  - Simplified storage interface and validation logic

### December 22, 2024
- **Initial Implementation**: Built complete TASC Emiratisation Risk Assessment Tool from specifications
  - Implemented full assessment form with conditional logic
  - Created lead capture modal with contact information collection
  - Built comprehensive results display with TASC branding
  - Added admin panel with authentication and configuration management
  - Integrated database storage with PostgreSQL and Drizzle ORM
  - Applied TASC brand guidelines throughout UI components

### Technical Implementation
- Added MoHRE sector validation and regulated industry warnings
- Implemented grace period logic for recent Emirati departures
- Created webhook integration framework for HubSpot lead capture
- Built risk calculation engine matching specification requirements
- Added data export functionality for admin analytics

## Configuration
- **Emiratisation Target**: 8% default (admin configurable)
- **Fine Structure**: AED 96,000 per missing Emirati (admin configurable)
- **Regulated Sectors**: Banking, Insurance, Government (special handling)
- **Admin Access**: Password protection via ADMIN_PASSWORD environment variable

## User Preferences
- Focus on UAE business compliance requirements
- Prioritize lead generation and conversion optimization
- Maintain TASC professional branding standards
- Ensure accurate MoHRE regulation compliance calculations
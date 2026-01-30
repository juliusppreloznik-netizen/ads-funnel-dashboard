# Catalyst Command Center TODO

## Phase 1: Database & Schema
- [x] Create clients table with intake form fields
- [x] Create generated_assets table for VSL/ads/landing pages
- [x] Generate and apply database migrations

## Phase 2: Client Intake Flow
- [x] Build intake form page with all required fields
- [x] Create thank you confirmation page
- [x] Add form validation and submission logic
- [x] Send notification to owner on new submission

## Phase 3: Admin Dashboard
- [x] Implement triple-click logo access mechanism
- [x] Add password protection for admin route
- [x] Build client submissions table with sort/search
- [x] Create client selection interface

## Phase 4: Claude API Integration
- [x] Set up Claude API configuration
- [x] Create VSL generation endpoint with detailed prompt
- [x] Create 5 ads generation endpoint with hook variations
- [x] Create landing page generation endpoint with find-replace logic
- [x] Add separate API calls for each asset type

## Phase 5: Asset Management & Editor
- [x] Build asset viewing interface
- [x] Integrate GrapesJS for HTML editing
- [x] Add GHL embed fields (survey, calendar)
- [x] Implement save and download functionality
- [x] Add desktop/mobile preview modes

## Phase 6: Testing & Notifications
- [x] Test complete intake-to-generation flow
- [x] Test admin authentication
- [x] Test all three asset generation types
- [x] Test GrapesJS editor functionality
- [x] Add completion notifications

## Phase 7: Deployment
- [x] Final testing and verification
- [x] Create checkpoint
- [x] Deliver to user

## User Requested Changes

- [x] Remove visual suggestions and timestamps from ad generation - output clean ad copy only
- [x] Remove timestamps and section breaks from VSL generation - output continuous flowing copy
- [x] Replace landing page template with actual provided template
- [x] Keep VSL embed box and 2 testimonial slots open for embeds in landing page
- [x] Add hex color picker to admin dashboard for landing page generation

## Landing Page Generation Fix

- [x] Change approach: use Claude only to generate copy text, not to modify HTML
- [x] Implement programmatic find-and-replace in server code
- [x] Preserve full template structure with all Framer styling and scripts

## UI Updates

- [x] Add Catalyst Marketing logo to intake form
- [x] Change submit button color from blue to black

## Admin Access Update

- [x] Make logo clickable to navigate to admin dashboard
- [x] Remove triple-click mechanism

## Bug Fixes

- [x] Fix landing page template loading error - template file not found
- [x] Fix landing page generation displaying raw HTML instead of saving to database
- [ ] Fix landing page replacements - template not being fully preserved (only 1KB instead of 500KB)

## Unique Mechanism Feature

- [x] Add Unique Mechanism input field to admin dashboard
- [x] Update landing page generation to use template with minimal replacements
- [x] Preserve full 500KB template structure
- [x] Replace only "Funding Optimization" with client's unique mechanism
- [ ] Fix HTML/SVG code displaying on right side of admin dashboard

## Standalone Landing Page Builder

- [x] Create new route `/admin/landing-page-builder`
- [x] Build step-by-step UI (input → AI generation → editor → save)
- [x] Add AI copy generation endpoint
- [x] Integrate template with AI-generated copy
- [x] Add GrapesJS visual editor
- [x] Implement save and download functionality
- [x] Add link to landing page builder in admin dashboard

## UI Redesign - Modern Tech Aesthetic

- [x] Remove landing page builder route and components
- [x] Remove landing page generation from admin dashboard
- [x] Remove landing page generation from server routers
- [x] Redesign intake form with modern, sleek UI (glassmorphism, smooth animations, clean typography)
- [x] Redesign admin dashboard with tech startup aesthetic (dark mode option, gradient accents, modern card layouts)
- [x] Keep only VSL and Ads generation functionality
- [x] Update color scheme and typography for professional tech feel

## Logo Update

- [x] Remove black background from logo
- [x] Create transparent PNG with white logo mark only
- [x] Update logo file in project

## Copy Generation Updates

- [x] Read Funding Optimization VSL reference
- [x] Read ad scripts references (3 files)
- [x] Read copywriting guide and water ad
- [x] Update VSL generation prompt to match reference style, voicing, and length
- [x] Update ad generation prompt to match reference style, voicing, and length
- [x] Confirm ads generate 5 scripts (already set but verify)
- [x] Test VSL generation with new prompt
- [x] Test ad generation with new prompt

## Progress Tracking System

- [x] Update database schema: add password field to clients table
- [x] Create tasks table with status, notes, completion date
- [x] Add password field to intake form
- [x] Build client authentication (login/logout)
- [x] Create client-facing progress portal page
- [x] Build admin manual client creation interface
- [x] Add task status management to admin dashboard
- [x] Implement internal notes for each task
- [x] Add password reset functionality for admin
- [x] Set up email notifications for task completion
- [x] Test complete workflow (intake → tracking → client login)

## Bug Fixes & Improvements

- [x] Fix missing tasks issue - tasks not showing for existing clients
- [x] Add delete client functionality to admin interface
- [x] Test task creation for new clients
- [x] Test client deletion workflow
- [x] Add client login link to thank you page
- [x] Add "Create Tasks" button for clients with no tasks

## Welcome Email System

- [x] Create email notification helper for sending client welcome emails
- [x] Add welcome email to intake form submission flow
- [x] Add welcome email to manual client creation flow
- [x] Test email delivery for both scenarios

## Client Filtering & Archive System

- [x] Add archived boolean field to clients table
- [x] Create archive/unarchive procedures in backend
- [x] Add filter dropdown (All, In Progress, Completed, Archived)
- [x] Add archive button for completed clients
- [x] Add unarchive functionality for archived clients
- [x] Test filtering and archiving workflows

## Funnel Builder Performance Fix

- [x] Simplify iframe architecture - remove nested iframe causing message passing delays
- [x] Add console logging to debug generation timing
- [ ] Test funnel generation speed and verify 30-60 second completion
- [x] Fix JavaScript syntax errors in funnel-builder-reference.html (TypeError: can't access property "audiocts", Uncaught SyntaxError)
- [x] Download GrapesJS files locally to fix 404 CDN errors
- [x] Fix GrapesJS JSON parse error - re-download library files and verify integrity

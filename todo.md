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

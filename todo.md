# Project TODO

## Build New Funnel Builder from Scratch

- [x] Research GoHighLevel funnel builder features and UX patterns
- [x] Extract prompt templates and color schemes from current builder
- [x] Build three-panel layout (left: elements, center: preview, right: settings)
- [x] Implement AI generation with backend LLM (no API key needed)
- [x] Add "Load HTML" feature to import and edit existing funnels
- [x] Add "Export HTML" download functionality
- [x] Integrate AI Assistant chat for live editing
- [ ] Add element library and drag-drop functionality
- [x] Test all features end-to-end

## Remove Funnel Builder

- [x] Remove funnel builder button from admin dashboard
- [x] Remove funnel builder routes from App.tsx
- [x] Remove funnel builder components and files

## Add Past Clients

- [x] Insert 7 past clients into database (Alante, Apoleen, Ashton, Christian, Josh, Lee, Tae)

## Copy Tasks to New Clients

- [x] Query existing client tasks to find template
- [x] Insert task copies for 7 new clients (Alante, Apoleen, Ashton, Christian, Josh, Lee, Tae)

## Add New Standard Tasks

- [x] Add "Pre Launch Check" and "Ads Launched" tasks to all existing clients
- [x] Update client intake handler to automatically include new tasks for future submissions

## Fix Duplicate Tasks and Add Create Button

- [x] Remove duplicate tasks from all clients (keep only one set of 8 tasks per client)
- [x] Add "Create Task" button to client management interface
- [x] Add tRPC procedure to create custom tasks for clients


## Command Center Upgrade - New Generation Features

- [x] Add admin-only fields to client schema: ghl_api_token, ghl_location_id, funnel_accent_color
- [x] Generate database migration for new fields
- [x] Create "Generate Funnel" button and backend procedure (landing page + thank you page)
- [x] Create "Generate Survey CSS" button and backend procedure
- [x] Create "Revise All Assets" button and backend procedure
- [ ] Update asset storage to support funnel HTML files
- [ ] Add asset viewer tabs: VSL Script, Ad Scripts, Landing Page, Thank You Page, Survey CSS
- [ ] Add copy/download/preview buttons for each asset type
- [ ] Add version toggle for original vs revised assets
- [ ] Test all generation flows end-to-end

## UI Restructuring - Move Generation Buttons to Admin Dashboard

- [x] Revert ClientManagement.tsx to original version (with progress bars, tasks, archive/filter)
- [x] Move Generate Funnel, Generate Survey CSS, Revise All Assets buttons to admin dashboard page
- [x] Add asset viewer tabs to admin dashboard page (alongside existing VSL/Ads generation)
- [x] Keep Admin Fields dialog on admin dashboard page
- [x] Ensure mechanism name dialog works on admin dashboard page

## Client Details Viewer
- [x] Add client details dialog to admin dashboard showing all intake form answers
- [x] Display GHL email, GHL password (masked with show/hide toggle), Google Drive link
- [x] Add copy buttons for easy credential copying on hover
- [x] All 18 tests passing

## Add A2P and Domain Set Up Tasks
- [x] Add A2P task for all existing clients
- [x] Add Domain Set Up task for all existing clients
- [x] Update default task creation so new clients also get these tasks

## Manus Update Spec v2.1
- [x] Switch all API calls from claude-sonnet-4-5-20250929 to claude-opus-4-6
- [x] Add funnel_secondary_color field to schema and database (+ templateUsed, backgroundTreatment)
- [x] Replace landing page prompt with new version (reference templates, 15-color palette, design variation system)
- [x] Update response parsing to extract 4 metadata lines (ACCENT_PRIMARY, ACCENT_SECONDARY, TEMPLATE_USED, BACKGROUND_TREATMENT)
- [x] Store metadata in client record and new fields
- [x] Write/update tests (26 tests passing)

## Manus Update v2.2 CopyDNA + v2.3 DesignOverhaul + Design Bible
- [x] Rewrite funnelGenerationPrompt.ts with complete Design Bible (16 chapters)
- [x] Include v2.3 Design Overhaul (18 mandatory rules, 5 new components, 11-section order)
- [x] Include v2.2 Copy DNA (voice & tone, headline patterns, section-by-section copy guide)
- [x] Include v2.2 Landing Page Copy Guide
- [x] Include v2.2 Ad Copy Addendum in generationPrompts.ts
- [x] Include v2.2 VSL Copy Addendum in generationPrompts.ts
- [x] Include 3 Reference Templates (A: Purple Glassmorphism, B: Matrix/Hacker, C: Dark Fintech)
- [x] Include output format with metadata lines
- [x] Fix parseFunnelResponse to handle both old and new TY delimiters
- [x] All 31 tests passing (funnels: 21, clients: 9, auth: 1)

## Copy DNA Fix + Thank You Page Redesign
- [x] Verify v2.2 Copy DNA is fully embedded in landing page prompt (replaced generic with verbatim v2.2)
- [x] Add any missing Copy DNA sections (voice/tone, headline patterns, section copy guides)
- [x] Rewrite thank you page prompt to match simple format: green checkmark, "You're Confirmed", subtitle, 3 bullet points with green checks, footer
- [x] Update Ad and VSL prompts with verbatim Copy DNA addendums
- [x] All 31 tests passing

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

## Manus Update v2.4 - Copy Variation Engine
- [x] Add variation instruction to top of landing page prompt
- [x] Add variation instruction + em dash prohibition rule to funnelGenerationPrompt.ts
- [x] Add Variation Pool 1: Hero Eyebrow Hooks (8 options)
- [x] Add Variation Pool 2: Hero Headlines (8 options)
- [x] Add Variation Pool 3: Core Mechanism Analogies (8 analogies)
- [x] Add Variation Pool 4: How It Works Step Names & Analogies (4 complete sets)
- [x] Add Variation Pool 5: Testimonial Personas (14 personas with construction rules)
- [x] Add Variation Pool 6: Pain Section Card Titles & Copy (3 sets of 4 cards)
- [x] Add Variation Pool 7: CTA Button Text Rotation (5 positions x 4 options each)
- [x] Add Variation Pool 8: Guarantee Wording (4 options)
- [x] Add Variation Pool 9: Approval Table Datasets (3 industry datasets)
- [x] Add Variation Pool 10: Hidden Problem 85%/15% Stat Alternatives (4 frames)
- [x] Add ALL 10 variation pools to ad generation prompt in generationPrompts.ts
- [x] Add ALL 10 variation pools to VSL generation prompt in generationPrompts.ts
- [x] Add variation instruction + em dash rule to ad and VSL prompts
- [x] Run tests and verify all pass (31/31)
## Manus Update v2.5 - Mobile Optimization, Full-Width Rendering & GHL Deployment
- [x] Add Mobile Optimization CSS block (@media queries for 768px and 375px) to landing page prompt
- [x] Add 8 Mandatory Mobile Rules (M1-M8) to landing page prompt
- [x] Add Full-Width Rendering CSS fixes to landing page prompt
- [x] Add 5 Mandatory Full-Width Rules (F1-F5) to landing page prompt
- [x] Add GHL Deployment Overrides CSS to landing page prompt
- [x] Add GHL Modal System JS (open/close/backdrop/escape) to landing page prompt
- [x] Add 10 Mandatory GHL Rules (G1-G10) to landing page prompt
- [x] Add Single Modal pattern (MOD1) to landing page prompt
- [x] Update Thank You page prompt with v2.5 structure (confirmation hero, next steps card, expectation setter, footer)
- [x] Add Thank You page CSS requirements (checkmark animation, next-steps-card, step items)
- [x] Add Thank You page mobile optimization CSS
- [x] Add 10 Mandatory TY Rules (TY1-TY10) to thank you page prompt
- [x] Add GHL Deployment Overrides to thank you page prompt
- [x] Run tests and verify all pass (31/31)

## GHL Rendering Fixes
- [x] Fix full-width: Add stronger GHL container overrides to force 100vw width (override .row-fluid, .container-fluid, .col-*, .container, .row, .inner-container, .section-container, .content-wrapper, [data-page-element], #preview-container, .page-container, .hl_wrapper)
- [x] Fix glow bleed: Constrain background glows with overflow:hidden on all sections except hero, footer clips all effects, body has no ::after glow
- [x] Add explicit instructions in prompt to NOT place radial gradient glows below the last section (GLOW RULES 1-6, G11-G15, F6-F8)
- [x] Add glow containment checks to quality checklist (5 new items)
- [x] Add GHL full-width checks to layout checklist (4 new items)
- [x] Upgrade sections to use width: 100vw !important for full-bleed rendering
- [x] All 31 tests passing

## Thank You Page Template Fix
- [x] Rewrite TY page prompt to produce exact hardcoded template matching user's desired design
- [x] Green checkmark circle, "You're Confirmed" headline, subtitle, card with 3 bullet points, footer
- [x] No AI creativity on structure — must match screenshot exactly every time (LOCKED TEMPLATE with 10 TY rules)
- [x] Run tests and verify all pass (31/31)

## Remove Funnel & Survey CSS Generation
- [x] Remove "Generate Funnel" button from admin dashboard
- [x] Remove "Generate Survey CSS" button from admin dashboard
- [x] Remove "Revise All Assets" button from admin dashboard
- [x] Remove Landing Page, Thank You Page, Survey CSS tabs from asset viewer
- [x] Keep VSL and Ads generation buttons and tabs untouched
- [x] Run tests and verify all pass (31/31)

## Fix Unique Mechanism in VSL & Ads Generation
- [ ] Trace uniqueMechanism flow from frontend to backend
- [ ] Ensure uniqueMechanism is passed to VSL generation prompt
- [ ] Ensure uniqueMechanism is passed to Ads generation prompt
- [x] Run tests and verify all pass (74/74)

## Revert VSL & Ads Prompts to Original
- [x] Identify where VSL and Ads prompts are defined (getVSLPrompt, getAdsPrompt)
- [x] Restore original prompt content from initial checkpoint (7f43eb2)
- [x] Unique mechanism properly included via ${uniqueMechanism} interpolation throughout
- [x] Run tests and verify all pass (31/31)

## Make VSL & Ads Copy Adapt to Unique Mechanism
- [x] Rewrite VSL prompt to infer niche/industry from mechanism name instead of hardcoding funding copy
- [x] Rewrite Ads prompt to infer niche/industry from mechanism name instead of hardcoding funding copy
- [x] Keep the same structure quality (hook, body, mechanism reveal, proof, offer, close for VSL; 5 awareness-level ads)
- [x] Update tests and verify all pass (31/31)

## Lock VSL & Ads to Credit/Funding or Mortgage Only
- [x] Remove open-ended niche inference — LLM hallucinated investment/wealth management garbage
- [x] Lock prompts to ONLY two niches: (1) business credit & funding, (2) mortgage readiness
- [x] Add explicit FORBIDDEN topics list (no investment, wealth management, stocks, portfolio, etc.)
- [x] Make the prompt detect which of the two niches based on mechanism name (detectNiche function with mortgage keyword matching)
- [x] Run tests and verify all pass (33/33)

## Fix Notes Section Under Client Tasks
- [x] Find the notes input component under client tasks (ClientManagement.tsx)
- [x] Fix truncation/input issue — was firing API mutation on every keystroke, causing refetch + re-render + cursor reset
- [x] Added local state (localNotes) with debounced save (800ms delay) so typing is smooth
- [x] Textarea is now resizable (resize-y, min-h-[80px]) and saves properly
- [x] Run tests and verify all pass (33/33)

## Internal Notepad on Manage Clients Page
- [x] Add adminNotes column to clients table (migration 0007)
- [x] Add backend tRPC procedures (getAdminNotes, updateAdminNotes)
- [x] Build a notepad panel on the right side of the client list view (collapsible, sticky)
- [x] Debounced auto-save (800ms) with "Saving..." indicator
- [x] Run tests and verify all pass (37/37 — 4 new admin notes tests)

## Guided Video Onboarding Flow
- [x] Search YouTube for tutorial videos: GHL setup, domain setup, phone number, FB admin access, agency admin
- [x] Design onboardingProgress table for tracking client completion (migration 0008)
- [x] Build backend tRPC procedures for onboarding progress (getProgress, markComplete, markIncomplete, getStepDefinitions)
- [x] Build frontend onboarding page with step-by-step video flow (Onboarding.tsx)
- [x] After intake form → redirect to /onboarding/:clientId with clientId from create response
- [x] Step 1: GHL Account Setup + "Already have GHL Agency?" toggle showing agency admin video
- [x] Step 2: Domain setup in GHL (buy/transfer/connect)
- [x] Step 3: Phone number purchase in GHL
- [x] Step 4: Facebook Business Access (adding admin)
- [x] Each step: embedded YouTube video, written instructions, "Mark as Done" button with toggle
- [x] Track completion per client with progress bar in header
- [x] Run tests and verify all pass (45/45 — 8 new onboarding tests)

## Floating Change Request Button (Every Page)
- [x] Add change_requests table to database (migration 0009)
- [x] Add db helpers and tRPC procedures (create, list, updateStatus, delete)
- [x] Build floating button component with popup panel (submit request + view history)
- [x] Wire component into App.tsx so it appears on every page
- [x] Only visible to authenticated admin users (checks user.role === 'admin')
- [x] Run tests and verify all pass (53/53 — 8 new change request tests)

## Bug Fix: Site Crash "Rendered more hooks"
- [x] Root cause: ChangeRequestButton had early return (`if (!user || user.role !== 'admin') return null`) BEFORE tRPC hooks, violating React's rules of hooks
- [x] Fix: Moved all hooks (useQuery, useMutation, useMemo) above the conditional return
- [x] Site loads correctly, 53/53 tests passing

## Implement Manus Copy Directive (Full Rewrite)
- [x] Rewrite VSL prompt: ban all credit repair language, enforce 4-step mechanism, lock 3 approved case studies only
- [x] Rewrite VSL prompt: enforce exact narrative arc (Hook → Credibility → Problem → Alternatives Fail → Mechanism → Process → Proof → Cost of Inaction → Offer → Risk Reversal → Close)
- [x] Rewrite Ads prompt: 5 locked ad angles (Problem Awareness, Enemy, Case Study, Contrarian, Urgency)
- [x] Rewrite Ads prompt: every ad must include 27 bureaus, legal mechanism, domino effect, done-for-you, no results no fee
- [x] Add complete BANNED LANGUAGE blacklist to both prompts (ABSOLUTE BLACKLIST section)
- [x] Add REQUIRED LANGUAGE checklist to both prompts
- [x] Add OUTPUT VALIDATION CHECKLIST to both prompts (SELF-CHECK section)
- [x] Add tone/voice rules (investigative, conspiratorial, short punchy paragraphs, REMOVAL not ADDITION)
- [x] Lock approved case studies (Restaurant Owner $150K, Clark $75K, Tom $110K, Aggregate $2.3M) — no fabrication
- [x] Update tests to verify banned/required language rules (54/54 tests passing)

## Change Request Batch - Feb 17 (ALL DONE)
- [x] CR1: Remove GHL login and password fields from the intake form
- [x] CR2: Allow clients to resume onboarding if they leave and come back (Continue Onboarding banner in Client Portal)
- [x] CR3: Change GHL plan text to "choose $97/mo plan"
- [x] CR4: Changed to "add our email as a agency admin" — now a separate mandatory step
- [x] CR5: Added mandatory Step 2 "Add Us as Agency Admin" with video njgC28VeUEc
- [x] CR6: Agency admin step shows email employee@catalystmarketingco.net, name Catalyst Marketing in a highlighted card
- [x] CR7: FB step video changed to r9bwiFVUezE, quick steps updated to match Meta Business Manager flow
- [x] All 7 requests marked as resolved in database (54/54 tests passing)

## Onboarding Progress Badges on Client Cards
- [x] Add backend procedure getAllClientsOnboardingProgress (single query, grouped by clientId)
- [x] Add protectedProcedure onboarding.getAllProgress in router
- [x] Update client cards in Manage Clients page to show "Onboarding: X/5" badge
- [x] Color-coded: green (complete), amber (in-progress), gray (not started) with matching icons
- [x] Run tests and verify all pass (54/54)

## Admin Help Videos Library
- [x] Extract all 5 embedded YouTube video IDs from onboarding page
- [x] Build Help Videos page with categories (GHL Setup, Domain & Hosting, Phone & SMS, Facebook & Ads)
- [x] Add video thumbnails, titles, descriptions, and "Copy Link to Send" button for each
- [x] Add search/filter by keyword and category tabs
- [x] Add route /admin/help-videos and "Help Videos" button in admin dashboard header
- [x] Run tests and verify all pass (54/54)

## Add Custom Video Feature (Help Videos Library)
- [x] Create helpVideos database table with title, description, youtubeUrl, videoId, category, tags, sortOrder
- [x] Seed 5 default onboarding videos into the database
- [x] Add db.ts CRUD helpers: getAllHelpVideos, getHelpVideoById, createHelpVideo, updateHelpVideo, deleteHelpVideo, getHelpVideoCategories
- [x] Add tRPC routes: helpVideos.list, helpVideos.categories, helpVideos.create, helpVideos.update, helpVideos.delete
- [x] Rewrite HelpVideos page to fetch from database instead of hardcoded array
- [x] Add "Add Video" button with dialog: YouTube URL input with live preview, title, description, category picker + custom category, tags
- [x] Add edit button on each video card with pre-filled dialog
- [x] Add delete button with confirmation dialog
- [x] YouTube URL parser supports standard, short, embed, and bare ID formats
- [x] Categories dynamically derived from actual video data
- [x] Write 20 tests (12 CRUD + 8 YouTube URL extraction) — all 74 tests passing

## Change Request Batch #2 — Feb 17
- [x] CR#8: Remove Google Drive link field from the intake form
- [x] CR#9: On the Facebook onboarding step, add the agency admin email (employee@catalystmarketingco.net) with "give full access" instruction
- [x] Mark both change requests as done in database
- [x] Run tests and verify all pass (74/74)

## Help Videos in Client Portal
- [x] Create client-facing Help Videos page (ClientHelpVideos.tsx) — read-only, no edit/delete
- [x] Add route /portal/help-videos to App.tsx
- [x] Add Help Videos navigation link to client portal
- [x] Use public tRPC endpoint (helpVideos.list) so clients can view without admin role
- [x] Run tests and verify all pass (74/74)

## Shareable Links in Admin Command Center
- [x] Add "Quick Links" section to admin dashboard with copyable onboarding link
- [x] Create public /help-videos route (no login required) for direct sharing
- [x] Add copyable help videos link to admin dashboard Quick Links section

## Direct Onboarding Link (No Client ID Required)
- [x] Create /setup route that shows the onboarding flow without requiring a client ID
- [x] Add "Setup Guide" copyable link to admin Quick Links bar

## Internal Notes UI Improvement
- [x] Change client dropdown in Internal Notes to horizontal scrollable pill/chip selector
- [x] Change Internal Notes client selector from horizontal scroll to vertical scroll

## Change Request Batch #3
- [x] CR#60001: Change the email on the Facebook details section in /setup to duffyjamir@gmail.com
- [x] CR#30001: Change the email on the Facebook help video to duffyjamir@gmail.com
- [x] Mark both change requests as done in database

## Video Replacement
- [x] Replace the video on the "Add Agency Admin" onboarding step with https://youtu.be/m3MOW1xstbg

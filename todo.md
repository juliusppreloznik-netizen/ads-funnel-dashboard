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

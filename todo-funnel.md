# Funnel Builder Integration TODO

## Database
- [x] Add funnels table to schema
- [x] Generate and apply migration

## Backend
- [x] Copy EXACT funnel generation prompts from HTML (no changes)
- [x] Create backend funnel generation procedure using invokeLLM
- [x] Add funnel CRUD procedures (create, read, update, delete, list)

## Frontend
- [x] Install GrapesJS dependencies
- [x] Create FunnelBuilder.tsx page with all original features
- [x] Preserve all menus (top bar, left panel, right panel, tabs)
- [x] Preserve all tools (Undo, Redo, Refresh, Clear, Fullscreen, Templates, AI Assistant, Load, Preview, Export)
- [x] Preserve all blocks and components
- [x] Preserve device switching (Desktop/Tablet/Mobile)
- [x] Preserve style manager with color swatches
- [x] Remove API key input, connect to backend
- [x] Add autosave every 30 seconds
- [x] Add keyboard shortcuts (Cmd+S save, Cmd+Z undo, Cmd+Y redo)
- [x] Add mobile-first editing features
- [x] Add save/load project functionality

## Integration
- [x] Add Funnel Builder link to admin dashboard
- [x] Test generation quality matches original
- [x] Test all original features still work

## Fixes Needed

- [x] Remove API key field completely (currently still visible)
- [x] Replace 6 preset colors with full color wheel picker
- [x] Integrate AI Assistant tab with backend LLM for real-time funnel editing
- [x] Test all fixes work correctly

## Direct HTML Fixes

- [x] Remove API key HTML section (lines 1272-1279)
- [x] Remove API key JavaScript functions (saveFgApiKey, etc.)
- [x] Add color picker input after color presets
- [x] Convert AI Assistant to live chat interface
- [x] Test all fixes in browser

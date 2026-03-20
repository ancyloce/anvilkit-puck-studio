## [0.4.3](https://github.com/ancyloce/anvilkit-studio/compare/v0.4.2...v0.4.3) (2026-03-20)

### Refactors

* Add javascript-obfuscator for code obfuscation in build process and update tsup configuration to include obfuscation plugin. ([88eb4f8](https://github.com/ancyloce/anvilkit-studio/commit/88eb4f8b3bd00b942fd055d319a3e94217988b4b))

## [0.4.2](https://github.com/ancyloce/anvilkit-studio/compare/v0.4.1...v0.4.2) (2026-03-20)

### Refactors

* Add canvas viewport functionality with mobile, tablet, and desktop options, including corresponding tooltips. Update internationalization files for English and Chinese translations. Enhance state management in the store for canvas viewport settings. ([ec2a77e](https://github.com/ancyloce/anvilkit-studio/commit/ec2a77e01e9645f518bf1d3f7ac32c444416a6e2))
* Add Spinner component for loading indication and refactor Separator component for improved styling consistency. ([54d5eae](https://github.com/ancyloce/anvilkit-studio/commit/54d5eae5d1aa98ba4f95e6d0707771f078b28bcd))
* Enhance ActionBar component with dynamic positioning based on visible bounds and clipping ancestors. Introduce utility functions for managing clipping and scrollable ancestors, improving layout responsiveness. Update ViewportPreview to utilize normalization functions for canvas dimensions, ensuring consistent rendering across different zoom levels. ([9f3319b](https://github.com/ancyloce/anvilkit-studio/commit/9f3319bb70a02fadae1a7ae34d68759d426b7556))
* Enhance canvas zoom functionality by introducing normalization functions for zoom levels and root height. Update related components to ensure consistent zoom behavior across the application. Improve type handling in viewport functions for better robustness. ([e1cef3a](https://github.com/ancyloce/anvilkit-studio/commit/e1cef3a41c8f2184e7b5a8127cc59682a35bafca))
* Enhance CanvasIframe toolbar interaction by preventing focus shift on mouse down events. Update Header component for improved layout and button size consistency. ([1735618](https://github.com/ancyloce/anvilkit-studio/commit/1735618ae01b5702831d31b9c650f560c09061a7))
* Enhance CanvasIframe with viewport selection and undo/redo functionality. Introduce new viewports utility for managing canvas display options. Update CanvasPreview for consistent styling. ([55c7dbb](https://github.com/ancyloce/anvilkit-studio/commit/55c7dbba53022654ad783caa80d29ccf356ebcc0))
* Extract toolbar and viewport preview into separate components for improved organization and maintainability. Simplify CanvasIframe by removing unnecessary code and enhancing clarity in the layout structure. ([2e5762d](https://github.com/ancyloce/anvilkit-studio/commit/2e5762d3c83abb13299a2e52f431ff771bb356e2))
* Implement canvas zoom functionality with new hooks and UI components. Enhance ToolBar and ViewportPreview to support zoom in/out actions and display current zoom level. Update internationalization files for zoom-related tooltips and labels, improving user experience and accessibility. ([02fab15](https://github.com/ancyloce/anvilkit-studio/commit/02fab159d273fed88f9e25b8862ca9e5f65e04fb))
* Introduce studio action types and context for improved action handling in Studio components. Refactor imports and layout structure to enhance code organization and maintainability. Add utility functions for managing studio UI state and viewports. ([0e70c84](https://github.com/ancyloce/anvilkit-studio/commit/0e70c84c2358bf7473806b0a7a1f04d968c7309d))
* Introduce StudioActionContext and useReportStudioAction for improved action handling in Studio. Refactor Studio component to utilize new context for header actions, enhancing state management and user experience. ([8727c9b](https://github.com/ancyloce/anvilkit-studio/commit/8727c9b43bd15128613d0bd41b7767e9a8e38824))
* Transition to new editor-ui and editor-i18n modules for improved organization and maintainability. Update imports across various components to utilize the new store structure, enhancing code clarity and consistency in state management. ([ac2cc57](https://github.com/ancyloce/anvilkit-studio/commit/ac2cc5782ee5727e5083ca177471533df3a19d4f))
* Update CanvasIframe to use new useCanvasLibraryDropBridge hook for improved library drag-and-drop functionality. Refactor ToolBar and ViewportPreview to import viewports from the new lib path, enhancing code organization and maintainability. Introduce new utility functions for handling canvas drop targets and element highlighting. ([0905847](https://github.com/ancyloce/anvilkit-studio/commit/09058477295ac78414bc4d685536e712c49128e1))
* Update Separator component styling for improved consistency by adjusting className formatting. ([37c1809](https://github.com/ancyloce/anvilkit-studio/commit/37c1809630021696e31f6f83d95bcdb15cdd6d87))

## [0.4.1](https://github.com/ancyloce/anvilkit-studio/compare/v0.4.0...v0.4.1) (2026-03-20)

### Refactors

* Implement draft saving functionality in EditorPage, including state management for saving status and last saved timestamp. Enhance Studio component with onSaveDraft handler for improved user experience. ([c3a1463](https://github.com/ancyloce/anvilkit-studio/commit/c3a14634db863a09fa36cdb60892381eaf8d06cf))
* Introduce StudioActionHandler and StudioHeaderAction types, enhancing the Studio component's action handling capabilities. Update StudioProps interface to include new action handlers for save, publish, share, and collaborators. Refactor related components to utilize these new types for improved type safety and clarity. ([afbabab](https://github.com/ancyloce/anvilkit-studio/commit/afbababe9b39d64467353e2425da587838f0cdb4))

## [0.4.0](https://github.com/ancyloce/anvilkit-studio/compare/v0.3.4...v0.4.0) (2026-03-20)

### Features

* Add TypeScript declaration for external CSS module "@puckeditor/plugin-ai/styles.css" to support styling integration ([354fc53](https://github.com/ancyloce/anvilkit-studio/commit/354fc5304e7f35602f0609a852baf33553ae0396))
* Enhance ImageLibrary component with pagination support and virtual scrolling for improved performance ([47458dd](https://github.com/ancyloce/anvilkit-studio/commit/47458ddf8e62aba2f6b8593f5165ada69083d98d))
* Implement pagination and search functionality in CopyLibrary component for improved user experience ([910ac43](https://github.com/ancyloce/anvilkit-studio/commit/910ac433fcb55db35d142fac203ebc686ccb2827))
* Introduce new data structures and constants for image and copy libraries, enhancing demo capabilities and organization in the Studio component ([9448598](https://github.com/ancyloce/anvilkit-studio/commit/9448598d33c75fbf083a927d3c3a689334080ab9))

### Refactors

* Extend ScrollArea component to accept viewportRef prop for improved flexibility ([f4eb40c](https://github.com/ancyloce/anvilkit-studio/commit/f4eb40c18f1f11c62c85307c1c570936c1949842))
* Remove TypeScript error suppression for CSS import in Studio component to improve code clarity ([faf1edd](https://github.com/ancyloce/anvilkit-studio/commit/faf1edd0d49d75058025b1161f4e0cbded1e929d))
* Replace usePuck with usePuckSelector in multiple components for improved state management and code consistency ([a0a6b36](https://github.com/ancyloce/anvilkit-studio/commit/a0a6b3658eb36e1a7a90c963f404ac60e5cd9af5))
* Simplify EditorDrawer component by introducing DrawerGrid for layout management and removing legacy EditorComponents export ([c6dc209](https://github.com/ancyloce/anvilkit-studio/commit/c6dc2094c1c4182e4b74a052708090170081a1ff))

## [0.3.4](https://github.com/ancyloce/anvilkit-studio/compare/v0.3.3...v0.3.4) (2026-03-19)

### Refactors

* Update PopoverPanel styles to include a border for improved visual consistency ([c210d81](https://github.com/ancyloce/anvilkit-studio/commit/c210d818a50b0dbbb1ca6a1096147f7599c2f0e0))

## [0.3.3](https://github.com/ancyloce/anvilkit-studio/compare/v0.3.2...v0.3.3) (2026-03-19)

### Refactors

* Remove unused primary color variables from styles.css to streamline CSS and improve maintainability ([432c81d](https://github.com/ancyloce/anvilkit-studio/commit/432c81d6cf66ee17f77ae3477286df1ebf7eab21))

## [0.3.2](https://github.com/ancyloce/anvilkit-studio/compare/v0.3.1...v0.3.2) (2026-03-19)

### Refactors

* Update build script to link compiled stylesheet to package entrypoints and adjust README for auto-loading styles ([757edd8](https://github.com/ancyloce/anvilkit-studio/commit/757edd81d7be53b95a127d4f7a6e9a9c0ae94a3b))

## [0.3.1](https://github.com/ancyloce/anvilkit-studio/compare/v0.3.0...v0.3.1) (2026-03-19)

### Refactors

* Update package.json to adjust module paths for CommonJS and ESM formats, modify build script for better artifact validation, and add validate-package-exports script to ensure package export targets are correctly defined. ([4f62af4](https://github.com/ancyloce/anvilkit-studio/commit/4f62af4fe0ccddf9354efb9f6c36e250da0bb4a9))

## [0.3.0](https://github.com/ancyloce/anvilkit-studio/compare/v0.2.0...v0.3.0) (2026-03-19)

### Features

* Add @anvilkit/puck-studio dependency and configure path mappings in TypeScript for improved module resolution ([37e98fe](https://github.com/ancyloce/anvilkit-studio/commit/37e98fe00198c01e4cdaffb14d634fd68b451562))

## [0.2.0](https://github.com/ancyloce/anvilkit-studio/compare/v0.1.0...v0.2.0) (2026-03-19)

### Features

* Add optional back-button handler to Editor and Header components, enhancing navigation functionality. Update documentation to reflect new prop. ([ed242c9](https://github.com/ancyloce/anvilkit-studio/commit/ed242c9f71a5120ee78c490186fed9ddf8490737))

### Refactors

* Enhance FieldWrapper component styling by updating class names for improved layout consistency and maintainability. ([72a334f](https://github.com/ancyloce/anvilkit-studio/commit/72a334f1812c785a7964005fd4818f435ac6b172))
* Update Separator component styling by adjusting class names for improved consistency and maintainability. ([9a5ec33](https://github.com/ancyloce/anvilkit-studio/commit/9a5ec33c38c320163ef7f0c9223680a12cb24757))

## [0.1.0](https://github.com/ancyloce/anvilkit-studio/compare/v0.0.1...v0.1.0) (2026-03-18)

### Features

* Add ESLint configuration to enforce import restrictions on public types, preventing deep-path imports from component files and ensuring consistent type usage across the project. ([b6b10a7](https://github.com/ancyloce/anvilkit-studio/commit/b6b10a7b8699b0253871d914ae9e52f9dce2d677))
* Add global font styling and integrate Inter font in layout for improved typography consistency across the application. ([2269080](https://github.com/ancyloce/anvilkit-studio/commit/226908077c1883af5c38e52eb1ed61648aadae1b))
* Add useCanvasThemeSync and useLibraryDropBridge hooks for improved theme synchronization and drag-and-drop functionality in the canvas, along with unit tests for prop replacement utilities. ([02e8758](https://github.com/ancyloce/anvilkit-studio/commit/02e875877e1a7313c48dbf2e12557a078198e46c))
* Add useThemeSync hook to synchronize theme state with document class, and update activeTab type to improve type safety in the UI store. ([fa281a7](https://github.com/ancyloce/anvilkit-studio/commit/fa281a7d52fc828d7972c6ff703edf33aed734ad))
* Consolidate public types in src/types/public.ts for improved API clarity, and enhance index.ts with new exports for store context and providers. ([607297a](https://github.com/ancyloce/anvilkit-studio/commit/607297ada608b5828fe6d23af9f16cfb1498b83c))
* Enhance CanvasIframe component with library drag-and-drop support, integrating typed event contracts and utility functions for image and text replacement, while improving iframe document styling and interaction handling. ([3cc2018](https://github.com/ancyloce/anvilkit-studio/commit/3cc20183dc50345c94e677ebb330638a5eb913fe))
* Enhance TooltipTrigger component to support render prop and maintain asChild functionality for better flexibility in rendering child elements. ([2da2458](https://github.com/ancyloce/anvilkit-studio/commit/2da245899b12bf09377ed3c27c030d7050ab17bf))
* Implement drag-and-drop functionality for library items with typed event contracts and prop-replacement utilities. Includes hooks for managing ghost elements during drag operations. ([16e7646](https://github.com/ancyloce/anvilkit-studio/commit/16e7646e748e1db3f19f909516b50adbf3d7fefa))
* Introduce core overrides for Puck editor components, including new field types, layout enhancements, and drag-and-drop functionality for improved user experience and customization. ([d7fdc9b](https://github.com/ancyloce/anvilkit-studio/commit/d7fdc9b73c05b549bfc759f5bb1bd64849e6db09))
* Introduce legacy compatibility re-exports in index.legacy.ts for deprecated APIs, and add type-level tests for public API surface in api.test-d.ts to ensure type safety and prevent accidental changes. ([1d5b395](https://github.com/ancyloce/anvilkit-studio/commit/1d5b39537c73f955942a4134eeb52314564c3c30))
* Introduce stable public types for @anvilkit/puck-studio, re-exporting consumer-facing types for better API management and internal refactoring. ([de2cb02](https://github.com/ancyloce/anvilkit-studio/commit/de2cb02ad40bce6e4eaa2de509f0ec8077c335ed))
* Refactor CanvasIframe component to utilize useCanvasThemeSync and useLibraryDropBridge hooks, removing legacy drag-and-drop logic and improving theme synchronization and styling management. ([2cf3c7a](https://github.com/ancyloce/anvilkit-studio/commit/2cf3c7a63bf1000dda603f5958a89175541ad19a))
* Refactor sidebar components to utilize typed active tab management and streamline drag-and-drop functionality for library items, enhancing user experience and code maintainability. ([4238a93](https://github.com/ancyloce/anvilkit-studio/commit/4238a93ec27cb6a905391f0aaaae75fd2cc75707))

### Refactors

* Consolidate type imports in Layout component and remove unused EditorHeader and EditorHeaderActions components from overrides. ([624f95d](https://github.com/ancyloce/anvilkit-studio/commit/624f95d1fe5bd43f0ddf560413201e367eaae083))
* Refactor Studio component to consolidate type imports from public types and add useEffect for synchronizing i18n store with locale and messages changes. ([3c0506d](https://github.com/ancyloce/anvilkit-studio/commit/3c0506df611996ed10cfd037e5dcb3f7ad355040))
* Standardize component styling by updating class names and structure across various UI components for improved consistency and maintainability. ([7696ede](https://github.com/ancyloce/anvilkit-studio/commit/7696ede84444cfed15c5c2d9ccedd03c28b78cf6))
* Update components.json to change style to 'base-vega', add RTL support, and define menu color and accent for improved UI customization. ([b13169b](https://github.com/ancyloce/anvilkit-studio/commit/b13169bf7780f368bf73d8ccc4f2af8949c0e56d))
* Update import path for Studio component to streamline module resolution and improve code organization. ([f6f8d5b](https://github.com/ancyloce/anvilkit-studio/commit/f6f8d5b8fe28de8e6f4fdf049ab9f59f70396c3d))
* Update Tailwind CSS import path in components.json to improve project structure and maintain consistency in styling. ([5b0d7aa](https://github.com/ancyloce/anvilkit-studio/commit/5b0d7aa248bf8664ac0dcfc8700720525fa4837b))

# Changelog

All notable changes to this project will be documented in this file.

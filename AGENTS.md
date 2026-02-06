# Routine Builder - Agents & Developer Guide

## 1. Project Overview
**Routine Builder** is a local-first, offline-capable Progressive Web App (PWA) designed for building and tracking workout routines. It prioritizes privacy (no cloud sync), speed, and a mobile-first user experience.

### Key Characteristics
- **Offline-First:** All data is stored locally in the browser using IndexedDB.
- **Mobile-First:** The UI is optimized for handheld usage. Desktop viewports display a `MobileExperienceWarning`.
- **Privacy-Focused:** No analytics, no login, no remote servers.

---

## 2. Tech Stack
- **Runtime:** React 19 + TypeScript
- **Build Tool:** Vite
- **Package Manager:** **pnpm** (Strictly enforced)
- **Styling:** Tailwind CSS v4
- **State/Persistence:** IndexedDB (via `idb` library)
- **Routing:** React Router v7 (HashRouter)
- **Internationalization:** i18next + react-i18next
- **Icons:** Material Symbols (Outlined)

---

## 3. Architecture & Data
The application follows a standard Client-Side Rendering (CSR) architecture.

### Database (IndexedDB)
The database logic is centralized in `src/lib/db.ts`.
**DB Name:** `routine-db`

#### Stores:
1.  **`inventory`**: Equipment available to the user.
    *   *Schema:* `{ id, name, icon, tagIds, status, condition, quantity }`
2.  **`exercises`**: Workout definitions.
    *   *Schema:* `{ id, title, tagIds, primaryEquipmentIds, media, defaultType }`
3.  **`routines`**: Structured workout plans.
    *   *Schema:* `{ id, name, series: [ { type, exercises: [...] } ] }`
4.  **`tags`**: Categories for filtering (e.g., "Push", "Legs").
    *   *Schema:* `{ id, name, color }`

### Data Flow
1.  **Read:** Components fetch data asynchronously from `dbPromise`.
2.  **Write:** Mutations occur directly against the IDB stores.
3.  **Validation:** Data is validated using `src/lib/validations.ts` before persistence.

---

## 4. Directory Structure
```
/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   └── ui/          # Reusable UI primitives (Buttons, Modals, Inputs)
│   ├── hooks/           # Custom hooks (e.g., useTheme)
│   ├── lib/             # Core logic & utilities
│   │   ├── db.ts        # Database configuration
│   │   ├── validations.ts # Validation schemas
│   │   └── utils.ts     # General helpers (cn, etc.)
│   ├── locales/         # i18n JSON files (en, es)
│   ├── pages/           # Route components
│   ├── types.ts         # TypeScript definitions
│   ├── App.tsx          # Main router configuration
│   └── main.tsx         # Entry point
├── AGENTS.md            # This file
├── package.json
└── README.md
```

---

## 5. Development Rules (Agents Directives)

### 🚨 Critical Directives
1.  **Package Manager:** Always use **`pnpm`**. Never use `npm` or `yarn`.
2.  **Data Safety:** Never implement logic that deletes user data (clearing DB) without an explicit, user-confirmed action (e.g., using `ConfirmationDialog`).
3.  **Mobile Performance:** Prioritize performance on low-end mobile devices. Avoid heavy computations on the main thread during render.
4.  **Component Reuse:** Strictly use existing UI components located in `src/components/ui/` whenever possible. Do not create new components or use raw HTML elements if an existing UI component can serve the purpose.

### 🌍 Internationalization (i18n)
*   **Strict Requirement:** All user-facing text **MUST** be internationalized.
*   **No Hardcoding:** Never write raw strings in components (e.g., `<div>Hello</div>`). Use `t('welcome_message')`.
*   **Structure:** Add new keys to `src/locales/en/translation.json` and `src/locales/es/translation.json`.
*   **Naming:** Use nested keys for organization (e.g., `exercises.form.title`).

### 📱 UI/UX Guidelines
*   **Mobile Viewport:** Test changes assuming a generic mobile viewport (approx. 375x667).
*   **Touch Targets:** Ensure buttons and interactive elements have a minimum touch area of 44x44px.
*   **Feedback:** Provide immediate feedback for actions (e.g., saving data, validation errors).

### 🛡️ Code Quality
*   **TypeScript:** Strict mode is enabled. Do not use `any`. Define proper interfaces in `src/types.ts`.
*   **Validation:** Use the `validators` object in `src/lib/validations.ts` for form inputs.
*   **Components:** Prefer functional components with named exports.

---

## 6. Key Systems

### Validation System
Located in `src/lib/validations.ts`.
*   Returns standardized `ValidationResult` objects.
*   Error messages are returned as translation keys (e.g., `validations.required`), not raw strings.

### Theming & Colors (Semantic Tokens)
The app uses a **Semantic Token System** to ensure consistency and contrast across Light and Dark modes.
*   **Do not use hardcoded colors** (e.g., `bg-white`, `text-slate-900`, `bg-gray-800`).
*   **Use semantic tokens** defined in `src/index.css` and exposed via Tailwind.

#### Key Tokens:
*   `bg-background`: Main page background (Light: Off-white, Dark: Tinted `#18141E`).
*   `bg-surface`: Cards, Modals, Inputs (Light: White, Dark: Tinted Surface).
*   `bg-surface-highlight`: Hover states, secondary backgrounds.
*   `text-text-main`: Primary content (High contrast).
*   `text-text-secondary`: Subtitles, meta info.
*   `text-text-muted`: Disabled states, placeholders.
*   `border-border`: Default borders.

**Note:** The design philosophy prioritizes "softer" high-contrast colors. Avoid pure black (`#000000`) or pure white (`#FFFFFF`) for text. Dark mode strictly follows the tinted background to maintain brand identity.

### Routing
Uses `HashRouter` to ensure compatibility with static file hosting (e.g., GitHub Pages) where rewriting rules might not be available.

---

## 7. Development & Maintenance Scripts

### Standard Commands
*   `pnpm dev`: Starts the Vite development server.
*   `pnpm build`: Runs TypeScript validation (`tsc -b`) and builds the production bundle.
*   `pnpm lint`: Runs ESLint checks.

### Utility Scripts
*   **Locale Validation:** `python3 validate_locales.py`
    *   *Purpose:* Scans source code for usage of `t('key')` and compares against `src/locales` JSON files.
    *   *Use When:* Adding new text or debugging missing translations.
    *   *Checks:* Reports missing keys in JSON and unused keys in code.

---

## 8. State Management & Data Pattern
The app does **not** use a global state manager (Redux, Zustand). It uses a **"Database-as-Single-Source-of-Truth"** pattern.

### The Hook Pattern (e.g., `useExercises`)
1.  **Fetch:** Hooks simply fetch all data from IDB on mount into a local `useState`.
2.  **Mutation:** Functions like `addExercise` write directly to IDB first.
3.  **Sync:** After a successful DB write, the local state is re-fetched/updated to reflect the change.

**Rule:** Do not create duplicate complex state logic. Write to DB, then update UI.

---

## 9. Styling Conventions
*   **Utility:** Always use the `cn()` helper from `src/lib/utils.ts` for conditional class names.
    *   *Bad:* `` className={`btn ${isActive ? 'active' : ''}`} ``
    *   *Good:* `className={cn("btn", isActive && "active")}`
*   **Component Library:** You **MUST** use existing components in `src/components/ui/` whenever possible to promote reuse. Check `src/components/ui/` before building new primitives.
*   **Mobile-First Config:** Do not use `sm:` for default styles. Default styles are for mobile. Use `md:` or `lg:` only for desktop-specific overrides (which should be minimal).
*   **Color Usage:** Always prefer `text-text-main` over `text-black` or `text-slate-900`.

---

## 10. Testing Strategy
*   **Current State:** No automated unit/integration tests are currently configured.
*   **Expectation:** Changes must be manually verified.
*   **Critical Paths to Check:**
    1.  Data persistence (Refresh page after saving).
    2.  Offline functionality (Disconnect network tab).
    3.  Mobile viewport rendering.

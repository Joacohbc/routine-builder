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
    - _Schema:_ `{ id, name, icon, tagIds, status, condition, quantity }`
2.  **`exercises`**: Workout definitions.
    - _Schema:_ `{ id, title, tagIds, primaryEquipmentIds, media, defaultType }`
3.  **`routines`**: Structured workout plans.
    - _Schema:_ `{ id, name, series: [ { type, exercises: [...] } ] }`
4.  **`tags`**: Categories for filtering (e.g., "Push", "Legs").
    - _Schema:_ `{ id, name, color }`

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
5.  **Asset Handling (Base URL):** The application is served from a subdirectory (`/routine-builder/`). **Never** use absolute paths (e.g., `/img/logo.png`) as they will break in production. Always import assets (e.g., `import logo from '@/assets/logo.png'`) or use relative paths.

### 🌍 Internationalization (i18n)

- **Strict Requirement:** All user-facing text **MUST** be internationalized.
- **No Hardcoding:** Never write raw strings in components (e.g., `<div>Hello</div>`). Use `t('welcome_message')`.
- **Structure:** Add new keys to `src/locales/en/translation.json` and `src/locales/es/translation.json`.
- **Naming:** Use nested keys for organization (e.g., `exercises.form.title`).

### 📱 UI/UX Guidelines

- **Mobile Viewport:** Test changes assuming a generic mobile viewport (approx. 375x667).
- **Touch Targets:** Ensure buttons and interactive elements have a minimum touch area of 44x44px.
- **Feedback:** Provide immediate feedback for actions (e.g., saving data, validation errors).

### 🛡️ Code Quality

- **TypeScript:** Strict mode is enabled. Do not use `any`. Define proper interfaces in `src/types.ts`.
- **Validation:** Use the `validators` object in `src/lib/validations.ts` for form inputs.
- **Components:** Prefer functional components with named exports.

---

## 6. Key Systems

### Validation System

Located in `src/lib/validations.ts`.

- Returns standardized `ValidationResult` objects.
- Error messages are returned as translation keys (e.g., `validations.required`), not raw strings.

### Custom Form System

The project uses a specialized form system located in `src/components/ui/Form.tsx`.

- **Directive:** **DO NOT** install external libraries like `react-hook-form` or `formik`.
- **Usage:** Use the `<Form>` component and its children (`Form.Input`, `Form.Select`, `Form.IconPicker`, etc.).
- **Validation:** Integrate strictly with `src/lib/validations.ts`.

### Icon Management

Icons are managed via `public/icon_names.json`, which feeds the `IconPicker`.

- **Source:** The JSON file contains a list of available Material Symbols.
- **Updates:** If new icons are needed, update `public/icon_names.json`.
- **Tool:** Use `extract_icon_names.py` to regenerate the list if you have the source `icons.json`.

### Theming & Colors (Semantic Tokens)

The app uses a **Semantic Token System** to ensure consistency and contrast across Light and Dark modes.

- **Do not use hardcoded colors** (e.g., `bg-white`, `text-slate-900`, `bg-gray-800`).
- **Use semantic tokens** defined in `src/index.css` and exposed via Tailwind.

#### Key Tokens:

- `bg-background`: Main page background (Light: Off-white, Dark: Tinted `#18141E`).
- `bg-surface`: Cards, Modals, Inputs (Light: White, Dark: Tinted Surface).
- `bg-surface-highlight`: Hover states, secondary backgrounds.
- `text-text-main`: Primary content (High contrast).
- `text-text-secondary`: Subtitles, meta info.
- `text-text-muted`: Disabled states, placeholders.
- `border-border`: Default borders.

**Note:** The design philosophy prioritizes "softer" high-contrast colors. Avoid pure black (`#000000`) or pure white (`#FFFFFF`) for text. Dark mode strictly follows the tinted background to maintain brand identity.

### Routing

Uses `HashRouter` to ensure compatibility with static file hosting (e.g., GitHub Pages) where rewriting rules might not be available.

---

## 7. Development & Maintenance Scripts

### Standard Commands

- `pnpm dev`: Starts the Vite development server.
- `pnpm build`: Runs TypeScript validation (`tsc -b`) and builds the production bundle.
- `pnpm lint`: Runs ESLint checks.

### Utility Scripts

- **Locale Validation:** `python3 validate_locales.py`
  - _Purpose:_ Scans source code for usage of `t('key')` and compares against `src/locales` JSON files.
  - _Use When:_ Adding new text or debugging missing translations.
  - _Checks:_ Reports missing keys in JSON and unused keys in code.

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

- **Utility:** Always use the `cn()` helper from `src/lib/utils.ts` for conditional class names.
  - _Bad:_ ``className={`btn ${isActive ? 'active' : ''}`}``
  - _Good:_ `className={cn("btn", isActive && "active")}`
- **Component Library:** You **MUST** use existing components in `src/components/ui/` whenever possible to promote reuse. Check `src/components/ui/` before building new primitives.
- **Mobile-First Config:** Do not use `sm:` for default styles. Default styles are for mobile. Use `md:` or `lg:` only for desktop-specific overrides (which should be minimal).
- **Color Usage:** Always prefer `text-text-main` over `text-black` or `text-slate-900`.

---

## 10. Testing Strategy

- **Current State:** No automated unit/integration tests are currently configured.
- **Expectation:** Changes must be manually verified.
- **Critical Paths to Check:**
  1.  Data persistence (Refresh page after saving).
  2.  Offline functionality (Disconnect network tab).
  3.  Mobile viewport rendering.

---

## 11. Code Design Directives

These rules apply to every task that involves writing, reviewing, or refactoring code. They are based on the principles from the CodeAesthetic channel and must be followed by default, unless the project context explicitly states otherwise.

### 1. Don’t write comments

- If you need a comment to explain what the code does, refactor the code until it explains itself. A comment is a signal of poor design, not good documentation.
- Comments lie over time: code gets updated, comments don’t. Avoid desynchronized documentation debt.
- Never use comments to track changes or history. That’s what git is for. A well-written commit message replaces any history comment in the code.
- Replace every “magic number” with a named constant that explains what the value represents: not `if (status === 3)` but `if (status === ORDER_STATUS.CANCELLED)`.
- Use the type system to document intent: `Optional<User>` communicates that the value may not exist; a generic wrapper communicates ownership or lifecycle. The type replaces the comment.
- **Valid exceptions** (the only cases where a comment is justified):
    - Public API documentation (parameters, contracts, return values).
    - Origin of a non-trivial mathematical algorithm (reference to a paper or formula).
    - Explanation of the **why** behind a non-obvious business decision or an anomalous and imperative optimization, accompanied by metrics or context external to the code.
- **Naming well IS documenting.** Before writing a comment, apply one of these strategies:
    - **Complex function:** extract the block into a function with a name that describes its intent. The name replaces the comment.
    - **Hard-to-read conditional or expression:** assign it to a descriptively named boolean variable. The name explains what is being evaluated.
    - **Long expression or calculation:** extract it into an intermediate variable whose name describes what the result represents.

**Example:**

```javascript
// BAD — comment explains what the code should say on its own
if (user.age >= 18 && user.country === 'UY' && !user.isBanned) { // can vote
  allowVote();
}

// GOOD — named variable that documents the intent
const isEligibleToVote = user.age >= 18 && user.country === 'UY' && !user.isBanned;
if (isEligibleToVote) {
  allowVote();
}

// BAD — comment above a complex block
// calculate volume discount and apply regional tax
const total = applyTax(applyDiscount(price, qty), region);

// GOOD — intermediate variables that narrate the process
const discountedPrice = applyDiscount(price, qty);
const totalWithTax = applyTax(discountedPrice, region);
```

### 2. Name things correctly

- **Variables** must be nouns that describe exactly what they contain. Forbid generic names like `data`, `info`, `temp`, `val`, or single letters like `x` outside explicit mathematical contexts.
- **Functions** must be verbs that describe the action they perform: `calculateTax()`, `fetchUserProfile()`, `validateInput()`. If a function does two things, its name is a signal that it should be split.
- **Booleans** must read as questions: `isVisible`, `hasPermission`, `canEdit`. Never: `flag`, `status`, `check`, `result`.
- Longer, descriptive names are almost always better than short, cryptic ones. Readability matters more than brevity when writing.
- **Consistency:** If `get` is used to retrieve data, don’t mix it with `fetch` or `load` for the same purpose. Uniform vocabulary reduces the team’s cognitive load.
- **Units:** Variables representing measurable magnitudes must communicate their unit unambiguously. Hierarchy to follow:
    1. Use a language type if one exists (`Duration`, `Money`, `Distance`, `DateTime`).
    2. Include the unit explicitly in the name: `timeout_ms`, `weight_kg`, `distance_km`, `price_usd`.
- **Avoid Generic Suffixes:** `Manager`, `Helper`, `Utils`, `Handler`, or `Service` must not be used alone as a full name. They must be anchored to concrete business logic: not `UserManager` but `UserSessionManager`.

### 3. Don’t nest your code

- Limit nesting to **2 levels maximum**. More than that is a signal that the function is too complex and should be split.
- **Guard clauses / Early return:** Validate error conditions at the start of the function and return immediately. The happy path stays unnested and flows top to bottom.
- **Extraction:** If a nested block is complex, extract it into its own function with a descriptive name. Each function must have a single responsibility.

**Example:**

```javascript
// BAD — deep nesting
function process(data) {
  if (data) {
    if (data.user) {
      if (data.user.isActive) {
        // main logic here
      }
    }
  }
}

// GOOD — guard clauses
function process(data) {
  if (!data) return;
  if (!data.user) return;
  if (!data.user.isActive) return;
  // main logic here
}
```

### 4. Prefer composition over inheritance

- Use inheritance only when a genuine “is-a” relationship exists and the Liskov Substitution Principle holds. Don’t use it just to reuse code.
- Deep inheritance hierarchies become fragile: a change in the base class can break all subclasses in unexpected ways.
- Favor small, specific interfaces combined through composition. The system is easier to reason about and easier to change in the future.
- If when modeling a class you feel the need to override or empty inherited methods, that’s a signal that inheritance is the wrong tool.

### 5. Use dependency injection

- Don’t instantiate dependencies inside a class. Pass them from the outside, preferably through the constructor. Constructor injection guarantees that the object is born complete and valid.
- Program against abstractions (interfaces or types), not concrete implementations. This decouples classes and allows swapping implementations without modifying the client.
- A class must do one thing. If it also creates its own dependencies, it’s doing two things (Single Responsibility Principle).
- The ultimate goal of DI is loosely coupled code, not the pattern itself. Apply DI where decoupling has real value.

### 6. Don’t optimize prematurely

- First make the code correct and readable. Optimize only when you have measurable evidence (profiling, benchmarks) of a real performance problem.
- 97% of the time, premature optimization damages maintainability with no real benefit.
- Code complicated for unproven performance reasons is technical debt.
- When you do optimize, prioritize improving algorithm selection and data structures — that solves 80% of real performance problems.

### 7. Don’t over-abstract

- Abstract only when you have at least real use cases for the same pattern. Abstracting earlier is speculative and creates indirection with no demonstrated value (YAGNI).
- Duplication is better than the wrong abstraction. Duplicated code can be cleanly refactored; a bad abstraction propagates and becomes hard to replace.
- Every layer of abstraction is a layer of indirection the reader must traverse. Always ask: does this level of abstraction help or hinder understanding of the system?

### 8. Pragmatism over paradigms

- Pure functions (without side effects) are easier to reason about, test, and compose. Favor them when possible — but without dogmatism.
- Don’t force functional structures where imperative programming or OOP is more natural and readable for the team.
- Immutability reduces shared state errors and makes behavior predictable. Model data so it is not reassigned in memory over time where possible.
- The ultimate goal is always readable, maintainable, and correct code. No paradigm is an end in itself.

---

### Guiding principle

Code is written to be read by people, not just executed by machines. When something feels hard to name, explain, or understand, that is a design signal — not a signal that documentation is missing.

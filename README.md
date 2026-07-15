# VeoLMS — Frontend

> React 19 single-page application for the VeoLMS Learning Management System.  
> Built with **Vite · React 19 · TypeScript · TailwindCSS · React Query · Zustand**

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Packages & Why](#packages--why)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture Decisions](#architecture-decisions)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Bundler | Vite 8 |
| Framework | React 19 |
| Language | TypeScript 6 |
| Styling | TailwindCSS 3 + custom design tokens |
| Server state | TanStack React Query v5 |
| Client state | Zustand v5 |
| Routing | React Router DOM v7 |
| Forms | Formik + Yup |
| HTTP client | Axios (with interceptors for auth + CSRF) |
| Rich text editor | Tiptap v3 |
| Video player | Plyr + HLS.js |
| Animations | Framer Motion |
| Icons | Lucide React + React Icons |

---

## Folder Structure

```
frontend/
├── public/                    # Static assets served as-is
│
├── src/
│   ├── assets/                # Images, SVGs bundled by Vite
│   │
│   ├── components/            # Reusable UI building blocks
│   │   ├── home/              # Home page specific components
│   │   ├── layout/            # App shell layouts
│   │   │   ├── AdminLayout.tsx      # Admin sidebar + header wrapper
│   │   │   ├── DashboardLayout.tsx  # Student dashboard wrapper
│   │   │   └── PublicLayout.tsx     # Navbar + Footer wrapper
│   │   ├── routing/           # Route guard components
│   │   │   ├── AdminRoute.tsx       # Checks role === 'admin' server-side
│   │   │   ├── AuthInitializer.tsx  # Restores auth state from cookie on boot
│   │   │   └── ProtectedRoute.tsx   # Blocks unauthenticated access
│   │   └── ui/                # Generic design-system components (buttons, cards, etc.)
│   │
│   ├── config/
│   │   └── index.ts           # API base URL constant (swap dev/prod)
│   │
│   ├── containers/            # Page-level data containers (fetch + pass to views)
│   │
│   ├── contexts/              # React Contexts (if any global context providers)
│   │
│   ├── crud/                  # Axios API call functions, one file per domain
│   │   ├── admin.crud.ts
│   │   ├── auth.crud.ts
│   │   ├── coupon.crud.ts
│   │   ├── course.crud.ts
│   │   ├── enrollment.crud.ts
│   │   ├── payment.crud.ts
│   │   └── progress.crud.ts
│   │
│   ├── hooks/                 # Custom React hooks (useQuery wrappers, etc.)
│   │
│   ├── lib/
│   │   └── axios.ts           # Axios instance with request/response interceptors
│   │                          #   → attaches Bearer token + x-csrf-token header
│   │                          #   → transparently refreshes expired access tokens
│   │
│   ├── pages/                 # Route-level page components
│   │   ├── admin/             # Admin portal pages
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminCoursesPage.tsx
│   │   │   ├── AdminPaymentsPage.tsx
│   │   │   ├── AdminSettingsPage.tsx
│   │   │   ├── CouponFormPage.tsx
│   │   │   ├── CouponsPage.tsx
│   │   │   ├── CreateCoursePage.tsx
│   │   │   ├── EditCoursePage.tsx
│   │   │   ├── EnrollmentsPage.tsx
│   │   │   ├── InstructorsPage.tsx
│   │   │   └── StudentsPage.tsx
│   │   ├── auth/              # Authentication flow pages
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   ├── checkout/
│   │   │   └── CheckoutPage.tsx     # Razorpay checkout with coupon support
│   │   ├── courses/
│   │   │   ├── CourseDetailPage.tsx
│   │   │   └── CoursesPage.tsx
│   │   ├── dashboard/         # Student dashboard pages
│   │   │   ├── BrowseCoursesPage.tsx
│   │   │   ├── MyCoursesPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── PurchaseHistoryPage.tsx
│   │   │   └── StudentDashboard.tsx
│   │   ├── payment/
│   │   │   ├── PaymentFailedPage.tsx
│   │   │   └── PaymentSuccessPage.tsx
│   │   ├── player/
│   │   │   └── CoursePlayerPage.tsx  # HLS video player with progress tracking
│   │   ├── Home.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── reusable/              # Shared compound components (modals, tables, forms)
│   │
│   ├── routes/                # Route definitions (empty — routing is in App.tsx)
│   │
│   ├── seo/                   # SEO meta tag components
│   │
│   ├── services/              # Non-HTTP service helpers (formatting, etc.)
│   │
│   ├── store/
│   │   └── authStore.ts       # Zustand store — accessToken + user (in-memory only)
│   │
│   ├── themes/                # Design token files (colors, typography)
│   │
│   ├── types/                 # Shared TypeScript type definitions
│   │
│   ├── Utils/                 # Pure utility functions (date, string, price formatters)
│   │
│   ├── validation/            # Yup schemas for Formik forms
│   │   ├── auth.validation.ts
│   │   └── profile.validation.ts
│   │
│   ├── App.tsx                # Route tree — public / protected / admin guards
│   ├── App.css
│   ├── index.css              # Tailwind base + custom CSS variables / design tokens
│   └── main.tsx               # React root render
│
├── .env                       # Local env vars (git-ignored)
├── .env.example               # Template — copy and fill
├── index.html                 # Vite HTML entry point
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Packages & Why

### Runtime Dependencies

| Package | Version | Why |
|---|---|---|
| **react** + **react-dom** | ^19 | UI framework. v19 ships the React Compiler (enabled via babel-plugin-react-compiler) which automatically memoises components — fewer manual `useMemo` / `useCallback` calls. |
| **react-router-dom** | ^7 | Client-side routing. v7 uses the same data router APIs as Remix — enables nested routes, layout routes, and route-level data loading. |
| **@tanstack/react-query** | ^5 | Server state management. Handles caching, background refetching, and loading/error states for all API calls. Retry logic is customised to skip retries on 401/403/404. |
| **zustand** | ^5 | Lightweight client state for auth (`accessToken`, `user`, `isAuthenticated`). No boilerplate, no context wrappers needed. State lives in memory — never persisted to localStorage to avoid XSS token theft. |
| **axios** | ^1.18 | HTTP client with interceptors. Request interceptor attaches `Authorization: Bearer` + `x-csrf-token` headers. Response interceptor transparently refreshes expired access tokens using the httpOnly refresh cookie. |
| **formik** | ^2.4 | Form state management. Handles field values, touched state, and submission. Paired with Yup for validation. |
| **yup** | ^1.7 | Schema-based form validation. Mirrors backend Zod schemas — passwords, email format, OTP digits, username regex. |
| **framer-motion** | ^12 | Production-quality animations and transitions. Used for page transitions, modals, and micro-interactions. |
| **tailwindcss** | ^3.4 | Utility-first CSS. Custom design tokens defined in `index.css` keep the UI consistent across components. |
| **hls.js** | ^1.6 | HLS (HTTP Live Streaming) player polyfill. Required because Bunny Stream delivers videos as `.m3u8` playlists — native `<video>` doesn't support HLS on most browsers. |
| **plyr** + **plyr-react** | ^3.8 / ^6 | Video player UI wrapper around hls.js. Provides timeline scrubbing, volume, fullscreen, and playback speed controls with a clean interface. |
| **@tiptap/react** + extensions | ^3 | Rich text editor for course description editing in the admin panel. Tiptap is Headless/unstyled — works seamlessly with Tailwind. |
| **lucide-react** | ^1.23 | Clean, consistent SVG icon set. Tree-shakeable — only imported icons are bundled. |
| **react-icons** | ^5.7 | Extended icon set (brands, social media, etc.) for icons not available in Lucide. |
| **react-toastify** | ^11 | Toast notification library. Used globally for success/error feedback. |
| **react-easy-crop** | ^6.1 | Image crop UI for avatar uploads. Outputs a cropped canvas blob sent to the backend. |
| **@radix-ui/react-label** + **react-slot** | ^2 | Headless, accessible primitives. Used as the foundation for custom form label and button components. |
| **class-variance-authority** | ^0.7 | Utility for building variant-based component APIs (`size="sm"`, `variant="ghost"`, etc.) in a type-safe way. |
| **clsx** + **tailwind-merge** | ^2 / ^3 | `clsx` composes class names conditionally. `tailwind-merge` deduplicates conflicting Tailwind classes (e.g. two `text-*` utilities). Used together in a `cn()` utility. |

### Dev Dependencies

| Package | Why |
|---|---|
| **vite** | Bundler and dev server. ES module-native, instant HMR, and extremely fast production builds. |
| **@vitejs/plugin-react** | Vite plugin that enables React Fast Refresh and JSX transform. |
| **typescript** | Strict static typing. |
| **tailwindcss** + **autoprefixer** + **postcss** | Tailwind requires PostCSS for its build pipeline. Autoprefixer adds vendor prefixes for browser compatibility. |
| **@tailwindcss/typography** | Tailwind plugin for the `prose` class — styles HTML from the Tiptap rich text editor. |
| **babel-plugin-react-compiler** | Enables the React 19 Compiler which auto-memoises components. |
| **eslint** + plugins | Linting — enforces React Hooks rules and catches stale closure bugs. |

---

## Environment Variables

The frontend has **one** environment variable — the backend API URL.

Create a `.env` file in the `frontend/` directory:

```bash
# frontend/.env
VITE_API_URL=http://localhost:4001/api
```

For production (Vercel / Netlify):

```bash
VITE_API_URL=https://your-production-backend.up.railway.app/api
```

> **Note:** All Vite env variables must be prefixed with `VITE_` to be exposed to the browser bundle.  
> The current `src/config/index.ts` hardcodes the URL — swap it to `import.meta.env.VITE_API_URL` when deploying multiple environments.

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4001/api` | Backend REST API base URL |

---

## Scripts

```bash
npm run dev        # Start Vite dev server with HMR (http://localhost:5173)
npm run build      # Type-check + production bundle → dist/
npm run preview    # Serve the production bundle locally to test before deploy
npm run lint       # Run ESLint across all source files
```

---

## Architecture Decisions

### Auth — Tokens in Memory, Not localStorage

The `accessToken` is stored in **Zustand memory only** — never in `localStorage` or `sessionStorage`. This prevents XSS attacks from stealing tokens. The `refreshToken` lives exclusively in an `httpOnly` cookie set by the backend and is completely invisible to JavaScript.

### CSRF Protection

Every mutating request (`POST`, `PUT`, `PATCH`, `DELETE`) automatically attaches the `x-csrf-token` header via the Axios request interceptor. The token is read from the `csrfToken` cookie (set by the backend on every response) and cached in memory if third-party cookies are blocked.

### Silent Token Refresh

When the backend returns `401`, the Axios response interceptor automatically calls `POST /auth/refresh-token` (which uses the httpOnly refresh cookie), updates the Zustand store with the new access token, and retries the original request — completely transparent to the user.

### Route Guards

- **`AuthInitializer`** — runs once on app boot, calls `/auth/me` to restore session from cookie before any route renders.
- **`ProtectedRoute`** — re-validates session on mount before rendering student routes.
- **`AdminRoute`** — validates session AND checks `user.role === 'admin'` before rendering admin routes. Redirects to `/dashboard` if role is insufficient.

### Server State vs. Client State

- **TanStack Query** handles all server-derived data (courses, enrollments, payments). It caches, deduplicates, and background-refreshes.
- **Zustand** handles only auth identity (`user`, `accessToken`, `isAuthenticated`) which is pure client state that doesn't need caching.

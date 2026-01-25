# Copilot Instructions for Mysha (Angular 16 Love Journey Website)

## Architecture Overview
**Entry → Password (protected) → RootPage (nested routes on protected `/app`)**

Single-page app with layered guards: PasswordComponent is public; all others protected by AuthGuard (`localStorage.unlocked === 'true'`).

### Route Structure
```
/ → PasswordComponent (login + intro animations)
/app → RootPageComponent (shell with navbar + outlet)
  ├── home → HomeComponent
  ├── thoughts → ThoughtsComponent (CRUD with Supabase)
  ├── timeline → TimelineComponent
  ├── gallery → GalleryComponent
  ├── memory-recap → MemoryRecapComponent
  ├── games → GamesComponent (grid view)
  │   ├── games/todo → TodoGameComponent
  │   └── games/drawing → DrawingGameComponent
  └── love-counter → LoveCounterComponent
```

## Critical Patterns

### 1. Authentication & Navigation
- **PasswordComponent** (`/`): On success, sets `localStorage.unlocked = 'true'` + plays Love.json animation
- **AuthGuard**: Blocks `/app` routes if `unlocked !== 'true'`; no AuthGuard on root
- **NavbarComponent**: Scroll-based menu (not route-based). Toggle `menuOpen` flag to add/remove `menu-open` class on `document.body`. Calls `scrollToSection(sectionId)` to smooth-scroll to IDs like `home-section`, `thoughts-section`, etc.
- **RootPageComponent**: Bare shell—only renders navbar + `<router-outlet>`. No content of its own.

### 2. Data Layer (Services)
All services use `@Injectable({ providedIn: 'root' })` for singletons.

| Service | Pattern | Details |
|---------|---------|---------|
| **ThoughtsService** | BehaviorSubject `thoughts$` | Tries Supabase REST API first; falls back to localStorage. CRUD: `addThought()`, `updateThought(id, text)`, `deleteThought(id)`, `updateReply(id, reply)`. Emits via `thoughtsSubject.next()`. |
| **AuthService** | Hardcoded credentials | `login(username, password)` checks vs `hardcodedUser` object. Sets `isAuthenticated` flag (in-memory only). |
| **SignatureService** | Cloudinary + Supabase | Uploads images to Cloudinary, stores URLs in Supabase. CRUD: `getSignature(id)`, `saveSignature(url)`, `deleteSignature(id)`. |
| **GalleryService** / **TimelineService** | Planned (not yet integrated) | Follow same BehaviorSubject pattern. |

**Key pattern**: Components subscribe to `service$` observables in `ngOnInit()`, unsubscribe in `ngOnDestroy()` using takeUntil pattern for cleanup.

### 3. Animations (Lottie)
- Load in `AfterViewInit` (not `OnInit`); must wait for DOM
- Pattern: `this.anim = lottie.loadAnimation({ container, renderer: 'svg', path, loop, autoplay })`
- Always destroy in `OnDestroy`: `this.anim.destroy()` to prevent memory leaks
- Files: `src/assets/animations/` (Book.json, Love.json, LoveLine.json, pencil.json)

### 4. Styling & Theme
- **Variables**: `src/app/theme/_variables.scss` defines `$primary-color` (#ff6f91), `$secondary-color` (#ffe6eb), `$heart-color` (#ff3366), etc.
- **Mixins**: `src/app/theme/_mixins.scss` has breakpoints and utilities
- **Mobile-first**: Use rem/em; avoid px for responsive design
- Import in component SCSS: `@import '../../theme/variables';`

### 5. Component Patterns
- **Registration**: All components declared in `AppModule.declarations[]` and routed in `AppRoutingModule`
- **Edit/Reply Draft State**: ThoughtsComponent uses `draftText` and `draftReply` dicts to track unsaved inline edits before API calls
- **ContentEditable**: Thoughts use contenteditable divs; listen to input events to update draft state, then `saveEdit()` on user action

## Development Commands
| Command | Purpose |
|---------|---------|
| `npm start` | Dev server at localhost:4200 (ng serve) |
| `npm build` | Production build → `dist/` |
| `npm test` | Unit tests via Karma |
| `npm run watch` | Rebuild on file changes |

## Adding Features

### New Menu Section
1. Create component: `src/app/components/<name>/<name>.component.ts|html|scss`
2. Declare in `AppModule.declarations[]`
3. Add route in `AppRoutingModule` (under `/app` children)
4. Add section ID to component template (e.g., `id="my-section"`)
5. Add navbar link + section ID to `NavbarComponent.sectionIds` array
6. Add navbar `<a (click)="onMenuClick($event, 'my-section')">` button

### New Game
1. Create game component under `src/app/components/games/`
2. Add route under `/app/games/` (e.g., `games/my-game`)
3. Add grid item in `GamesComponent` template that links to route
4. No navbar entry needed (accessed from games grid only)

### New Data
Create service in `src/app/services/` exposing BehaviorSubject Observables. Inject in components and subscribe with takeUntil pattern.

## Backend Integration
- **Supabase**: `ThoughtsService` + `SignatureService` use REST API via fetch + localStorage fallback
- **Firebase**: `@angular/fire` installed but unused; available for scaling auth/storage
- **Environment**: `src/environments/environment.ts` contains `supabase.url` and `supabase.anonKey`
- **Fallback**: Network errors → services gracefully degrade to localStorage; check browser console for failures

## Debug Checklist
| Issue | Debug Steps |
|-------|-------------|
| Auth not working | Check DevTools → Application → Local Storage → `unlocked` key; clear to reset |
| Animations not loading | Verify `src/assets/animations/<name>.json` exists; check browser console for 404 |
| Service data stale | Ensure component unsubscribes with `takeUntil(this.destroy$)` on Observable |
| Navbar height issues | Navbar sets `--navbar-height` CSS custom property in `ngAfterViewInit()`; child components use it |

---
**Last updated:** January 25, 2026

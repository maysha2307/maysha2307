# Copilot Instructions for Mysha (Angular 16 Love Journey Website)

## Project Overview
- Angular 16, SCSS, mobile-first, romantic/cute love theme.
- Entry flow: Lottie animation + welcome message, blur effect, then password modal (pop-up card).
- On correct password: heart splash animation, then navigate to RootPage.
- RootPage: fixed navbar (logo/name left, animated hamburger/close button right), all child routes/components load below.
- Hamburger toggles a full-screen, animated menu under navbar; close button replaces hamburger when open.
- Menu items: Home, Thoughts, Timeline, Gallery, Memory Recap, Games, Love Counter (all separate components).
- Games: grid of squares (each game as a square with image, click to open game component); easy to add more games later.
- All navigation/components optimized for mobile use.
- Firebase for storage/hosting (setup after project is complete).
- Hardcoded password for login (no backend auth).

## Key Directories & Files
- `src/app/components/`: All major UI components (AnimationWelcome, PasswordModal, RootPage, Navbar, Menu, Home, Thoughts, Timeline, Gallery, MemoryRecap, Games, LoveCounter, etc.)
- `src/app/services/`: Angular services (e.g., AuthService, AnimationService, DataService)
- `src/app/models/`: TypeScript interfaces/models for app data
- `src/app/theme/`: SCSS variables, mixins, and theme styles
- `src/app/app-routing.module.ts`: Main routing config
- `src/app/app.module.ts`: Main Angular module
- `src/app/styles.scss`: Global styles

## Patterns & Conventions
- Use Angular routing for all navigation; each menu item is a separate route/component.
- Use SCSS variables/mixins for theme colors and spacing.
- All UI/UX is mobile-first; test on mobile viewports.
- Lottie animations for entry, heart splash, and animated hamburger/close button.
- Password modal is a pop-up card, triggered after welcome animation.
- Navbar is always visible on RootPage and its child routes.
- Hamburger menu toggles a full-screen overlay menu; close button animates in place of hamburger.
- Games section is a grid; each game is a separate component, easy to add more.
- Use services for shared logic (auth, data, animation).
- Use models for all structured data.
- Firebase integration only for storage/hosting; no backend auth.

## Example Workflow
1. User visits site: sees animation + welcome message.
2. Animation blurs, password modal appears.
3. On correct password: heart splash animation, then RootPage loads.
4. User navigates via navbar/hamburger menu; all content loads in main section.
5. Games menu shows grid; clicking a game loads its component.

## Mobile-First Guidance
- Prioritize mobile layout and touch interactions.
- Use rem/em for sizing, avoid px.
- Test all animations and menus on mobile viewports.

## Customization
- Logo/name are placeholders; update as needed.
- Theme colors/styles in `src/app/theme/`.

---
Update this file as new patterns/components are added.

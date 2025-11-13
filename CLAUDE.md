# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VigilApp-Front is a React Native mobile application built with Expo, serving as a community alert system. The app uses file-based routing via expo-router and supports iOS, Android, and web platforms.

## Development Commands

**Start development server:**
```bash
npm start
```

**Platform-specific commands:**
```bash
npm run android    # Launch Android emulator
npm run ios        # Launch iOS simulator
npm run web        # Launch web version
```

**Code quality:**
```bash
npm run lint       # Run ESLint
```

**Install dependencies:**
```bash
npm install
```

## Architecture & Structure

### Routing System
- Uses **expo-router** with file-based routing
- All routes defined in the `app/` directory
- Root layout at [app/_layout.tsx](app/_layout.tsx) configures Stack navigation and theme provider
- Current routes:
  - `/login` - Login screen
  - `/register` - User registration screen

### Path Aliases
- `@/*` maps to the project root directory (configured in [tsconfig.json](tsconfig.json))
- Example: `@/components/themed-text` resolves to `components/themed-text.tsx`

### Theming System
- **Theme Hook Pattern**: Uses `useThemeColor` hook ([hooks/use-theme-color.ts](hooks/use-theme-color.ts)) combined with `useColorScheme` for automatic light/dark mode
- **Theme Constants**: [constants/theme.ts](constants/theme.ts) exports `Colors` object with light/dark variants and platform-specific `Fonts`
- **Themed Components**: Wrapper components like `ThemedText` and `ThemedView` automatically adapt to color scheme
- Components can override theme colors via `lightColor` and `darkColor` props

### Authentication Flow
- **Service Layer**: [services/auth.service.ts](services/auth.service.ts) handles all auth API calls with clean separation of concerns
- **Type Definitions**: [services/types/auth.types.ts](services/types/auth.types.ts) contains TypeScript interfaces for auth data
- **API Configuration**: [services/config/api.config.ts](services/config/api.config.ts) centralizes API base URL, headers, and error handling
- **Image Picker Service**: [services/image-picker.service.ts](services/image-picker.service.ts) handles camera and gallery access with permission management
- Auth service is a singleton pattern exported as `authService`
- Token storage currently in-memory; TODO: implement SecureStore for production
- Backend base URL: `http://localhost:8080/api` - configure for production deployment

### Component Organization
- **Themed Components**: `ThemedText`, `ThemedView` - Auto-adapt to system theme
- **UI Components**: `components/ui/` - Reusable UI elements (IconSymbol, Collapsible)
- **Auth Components**: `components/auth/` - LoginForm, RegisterForm with inline validation
- **Custom Icons**: ShieldIcon component for app branding

### Form Validation
- Login/Register forms implement inline validation with real-time feedback
- Validation errors clear on user input (immediate feedback)
- Email validation: checks for `@` presence and non-empty value
- Password validation: minimum 8 characters
- Register form validates required images (fotoCedula and selfie) before submission

### Platform-Specific Code
- Use `.ios.tsx` or `.web.ts` extensions for platform-specific implementations
- Example: [components/ui/icon-symbol.ios.tsx](components/ui/icon-symbol.ios.tsx) provides iOS-specific icon implementation
- [hooks/use-color-scheme.web.ts](hooks/use-color-scheme.web.ts) handles web-specific theme detection

## Configuration Files

- **App Config**: [app.json](app.json) - Expo configuration including icons, splash screen, and platform settings
- **TypeScript**: [tsconfig.json](tsconfig.json) - Strict mode enabled, extends expo/tsconfig.base
- **ESLint**: [eslint.config.js](eslint.config.js) - Uses flat config format with eslint-config-expo

## Key Technologies

- **React 19.1.0** / **React Native 0.81.4**
- **Expo SDK ~54.0.13** with Router (~6.0.11)
- **Navigation**: @react-navigation with Stack navigator
- **Animations**: react-native-reanimated for smooth transitions
- **Icons**: react-native-vector-icons (FontAwesome) + Expo Symbols
- **Image Picker**: expo-image-picker for camera and gallery access
- **TypeScript**: Strict mode enabled

## Important Notes

- **New Expo Architecture Enabled**: `newArchEnabled: true` in [app.json](app.json)
- **Typed Routes**: Experimental typed routes enabled for type-safe navigation
- **React Compiler**: Experimental React compiler enabled
- **Color Palette**: Primary brand color is navy blue (`#005677`) - use this for consistency
- The app supports automatic dark/light mode switching based on system settings

## Backend Integration (Spring Boot)

The app connects to a Spring Boot backend at `http://localhost:8080/api`. Update the BASE_URL in [services/config/api.config.ts](services/config/api.config.ts) for production.

### API Endpoints

**Login**
- `POST /api/login`
- Content-Type: `application/json`
- Body: `{ email: string, password: string }`
- Response: JWT token as plain text string

**Register**
- `POST /api/register`
- Content-Type: `multipart/form-data`
- Fields:
  - `firstName`: string
  - `lastName`: string
  - `email`: string
  - `password`: string
  - `fotoCedula`: File (image)
  - `selfie`: File (image)
- Response: `{ id, firstName, lastName, email, role?, createdAt? }`

### Service Architecture

**Clean Code Practices:**
- Singleton pattern for service instances
- Clear separation of concerns (API config, auth logic, image handling)
- Centralized error handling in `api.config.ts`
- Type-safe with comprehensive TypeScript interfaces
- Async/await pattern for all network calls
- Detailed JSDoc comments on service methods

**Image Upload:**
- FormData is used for multipart/form-data requests
- Images selected via expo-image-picker
- Platform-specific ActionSheet/Alert for source selection (camera vs gallery)
- Permission handling built into image picker service
- you are an react native expert
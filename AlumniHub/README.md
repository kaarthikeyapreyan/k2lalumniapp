# AlumniHub

A comprehensive mobile application for alumni networking built with Expo, React Native, and Redux.

## Features

### Authentication
- ✅ Email/Password login with validation
- ✅ Mock Google OAuth integration
- ✅ Mock LinkedIn OAuth integration
- ✅ Session persistence with AsyncStorage
- ✅ Auto-login on app restart

### Theme & Design
- ✅ Light and Dark mode support
- ✅ System preference detection
- ✅ Professional color palette (blues/grays)
- ✅ Consistent design across all screens

### Core Features
- ✅ **Home Screen**: Welcome dashboard with quick stats and actions
- ✅ **Alumni Directory**: Search and filter alumni by name, company, skills, location, etc.
- ✅ **Profile Management**: View and edit user profiles with avatar support
- ✅ **Messaging**: Real-time-like messaging with typing indicators
- ✅ **Connections**: Send and accept connection requests
- ✅ **Settings**: Privacy settings, notifications, theme toggle

### Mock Backend
- ✅ 60+ generated alumni profiles with realistic data
- ✅ Mock authentication service with OAuth simulation
- ✅ Mock API delays (300-800ms) for realistic experience
- ✅ 5% random failure rate for error handling testing
- ✅ All data persists in Redux store during session

## Tech Stack

- **Framework**: Expo SDK ~54
- **UI Library**: React Native with React Native Elements (RNE)
- **State Management**: Redux Toolkit
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage for persistence
- **Icons**: Expo Vector Icons (@expo/vector-icons)
- **TypeScript**: Strict mode enabled

## Project Structure

```
AlumniHub/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── directory.tsx
│   │   ├── messages.tsx
│   │   └── profile.tsx
│   ├── profile/
│   │   ├── [id].tsx
│   │   └── edit.tsx
│   ├── chat/
│   │   └── [id].tsx
│   ├── _layout.tsx
│   └── index.tsx
├── store/
│   ├── authSlice.ts
│   ├── profileSlice.ts
│   ├── directorySlice.ts
│   ├── messagingSlice.ts
│   ├── connectionSlice.ts
│   └── index.ts
├── mock/
│   ├── data/
│   │   ├── profiles.ts
│   │   ├── messages.ts
│   │   └── conversations.ts
│   └── services/
│       ├── authService.ts
│       ├── profileService.ts
│       ├── directoryService.ts
│       ├── messagingService.ts
│       └── connectionService.ts
├── types/
│   └── index.ts
├── theme/
│   └── index.ts
└── utils/
    ├── mockDelay.ts
    └── theme.ts
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

```bash
npm install --legacy-peer-deps
```

### Running the App

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Mock Login Credentials

For testing, use these credentials:

**Email**: john.doe@example.com  
**Password**: password123

Or use the OAuth buttons for instant login (mock authentication).

## App Navigation Flow

1. **Unauthenticated**: Login/Signup screens
2. **Authenticated**: 
   - Home tab (dashboard)
   - Directory tab (search alumni)
   - Messages tab (conversations)
   - Profile tab (user settings)

## Key Features Demo

### Search & Filter
- Search alumni by name, company, skills, or location
- Real-time search with 300ms debounce
- 60+ mock alumni profiles

### Messaging
- View all conversations
- Send and receive messages
- Typing indicators
- Unread message badges
- Optimistic UI updates

### Connections
- Send connection requests
- Accept/reject requests
- View connection status on profiles

### Profile Management
- Edit name, job title, company, bio
- View graduation year and department
- Skills display
- Privacy settings (future enhancement)

## Dark Mode

The app fully supports dark mode:
- Toggle in Profile > Settings > Dark Mode
- System default detection
- Persists across app restarts
- All screens adapt automatically

## Future Enhancements

- [ ] Real map view with react-native-maps
- [ ] Push notifications
- [ ] Event management
- [ ] Photo uploads
- [ ] Group messaging
- [ ] Advanced filtering
- [ ] Alumni spotlight carousel

## Development Notes

- All mock services include random delays (300-800ms)
- 5% failure rate simulates network errors
- Redux state persists auth across restarts
- Expo Router provides type-safe navigation
- Strict TypeScript mode enforced

## License

Private

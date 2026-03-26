# SpendApp - Front-End 📱

SpendApp is a premium React Native application built with **Expo** and **TypeScript**, following the **Atomic Design** architecture.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your physical device (optional, for native testing)

### Installation
1. Navigate to the project directory:
   ```bash
   cd spend-front
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the App
- **Web**: `yarn web` (Best for rapid UI development)
- **Development Menu**: `yarn start` (Scan the QR code with Expo Go)
- **Android**: `yarn android`
- **iOS**: `yarn ios`

## ⚙️ Configuration & API

The application is configured to automatically communicate with the **Spend API Gateway**.

### Automatic IP Detection
The app automatically detects the local IP of your machine to connect to the backend (Port 3000 by default). This allows testing on physical devices without manual configuration.

### Environment Variables
You can override the default API URL by creating/modifying the `.env` file:
```env
EXPO_PUBLIC_API_URL=http://your-ip:3000/api
EXPO_PUBLIC_WS_URL=http://your-ip:3001
```

## 🏗️ Architecture (Atomic Design)

The project structure follows the Atomic Design methodology for maximum reusability:

- **src/components/atoms**: Smallest units (Button, Input, Typography, Card).
- **src/components/molecules**: Combinations of atoms (Toast, AddressAutocomplete, TransactionItem).
- **src/components/organisms**: Complex UI sections (AppMap, TransactionForm).
- **src/services**: API clients and business logic (Auth, Geolocation, Address).
- **src/providers**: React Context providers (Auth, Notifications).
- **app/**: File-based routing using `expo-router`.

## ✨ Key Features
- 🔐 **Authentication**: Full login/register flow with persistent JWT storage.
- 🗺️ **Maps**: Interactive map tracking your transactions globally.
- 🏠 **Address Autocomplete**: Direct integration with **OpenStreetMap (Nominatim)** with 1s rate-limiting.
- 🔔 **Global Notifications**: Event-driven Toast system for errors and successes.
- 📱 **Cross-Platform**: Tailored layouts for both Mobile and Web.

---
Developed with ❤️ by the SpendApp Team.

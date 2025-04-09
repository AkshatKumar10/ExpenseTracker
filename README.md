# 💸 Expense Tracker App

A **Splitwise-style** expense tracker built with **React Native (Expo)**. Create and manage groups, track expenses, split amounts equally or custom, and get real-time summaries — all stored locally using AsyncStorage. Includes Firebase authentication with email/password.


## 🚀 Features

- 🔐 **Firebase Email/Password Authentication**  
  Secure login/signup using Firebase Authentication.

- 🧠 **State Management with Zustand**  
  Lightweight and efficient state management using Zustand.

- 🧑‍🤝‍🧑 **Group Management**  
  Create, view, and delete multiple groups.

- 📱 **Contact Integration**  
  Select group members directly from your phone's contact list.

- 💰 **Expense Splitting Options**  
  - Equal split  
  - Custom split (define individual shares manually)

- 📊 **Real-Time Balance Updates**  
  Instantly reflect changes in balances when expenses are added or updated.

- 📋 **Group-Wise and Overall Summaries**  
  Get a clear view of debts per group or overall across all groups.


## 🧰 Tech Stack

- **Framework:** React Native with Expo
- **State Management:** Zustand
- **Persistent Storage:** AsyncStorage
- **Authentication:** Firebase Email/Password
- **UI & UX:** TailwindCSS (via NativeWind)

## 📦 Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/group-expense-tracker.git
cd group-expense-tracker
```

2. Install dependencies
```bash
npm install
```

3. Start the Expo project
```bash
npx expo start
```

⚠️ Make sure you have the Expo Go app on your phone.


## 🔐 Firebase & Environment Setup

- Create a Firebase project.

+ Enable Email/Password Authentication.

- Create a .env file in the root of your project and add your Firebase credentials:

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

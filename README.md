Project Console: https://console.firebase.google.com/project/thinkkk-4f7ea/overview
Hosting URL: https://thinkkk-4f7ea.web.app

USER LOGIN: 
EMAIL: abhinayaprakash31@gmail.com
pswrd: abhinaya



# SlotWise

SlotWise is a simple, production-ready appointment booking dashboard built with Angular (v19) and Firebase. It enables an authenticated owner to schedule, edit, and delete appointment slots, and lets customers reserve slots in real time. The app utilizes Firestore realtime listeners to keep both the customer booking view and the owner's dashboard perfectly synchronized in real time.

---

## Features

1. **Authentication**: Secure Login and Logout using Firebase Email/Password Auth. Dashboard routes are fully protected by a router guard (`auth.guard.ts`).
2. **Real-time Slot CRUD**: The owner can create, read, update, and delete appointment slots. Capacity changes and deletions synchronize immediately.
3. **Atomic Bookings**: Customers can view future available slots, remaining seating, and place bookings. Booking is executed via a Firestore Transaction (`runTransaction`) to guarantee that the booked count is checked and incremented atomically, preventing overbooking.
4. **Live Dashboard**: Real-time monitoring of bookings with client-side Firestore joins to show appointment dates and times. Booking statuses (Pending, Confirmed, Cancelled) can be changed dynamically, updating Firestore immediately.
5. **Robust Validation**: Built-in reactive form validations (e.g., preventing slot capacity < 1, preventing capacity from being modified below the count of existing bookings, verifying contact details).

---

## Tech Stack

- **Frontend**: Angular 19 (Standalone architecture, strict type-checking, Reactive Forms, RxJS)
- **Styling**: Vanilla CSS (Premium Slate design system with Glassmorphism, animations, responsive tables, and badges)
- **Backend & DB**: Firebase Authentication & Firestore Database
- **Hosting**: Firebase Hosting

---

## Folder Structure

```
slotwise/
├── .vscode/                 # IDE Configuration
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── components/      # Standalone Components
│   │   │   ├── booking/     # Customer booking page
│   │   │   ├── dashboard/   # Owner dashboard page
│   │   │   ├── login/       # Owner authentication page
│   │   │   ├── slot-form/   # Create/Edit slot form modal
│   │   │   └── slot-list/   # Slot lists container
│   │   ├── guards/          # Route Guards
│   │   │   └── auth.guard.ts
│   │   ├── models/          # TypeScript Interfaces
│   │   │   ├── booking.model.ts
│   │   │   └── slot.model.ts
│   │   ├── services/        # Firebase Services
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   └── slot.service.ts
│   │   ├── app.component.html
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/        # Firebase configurations
│   │   └── environment.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css           # Central design system stylesheet
├── .firebaserc              # Firebase environment pointer
├── firebase.json            # Firebase Hosting configuration
├── package.json
└── tsconfig.json
```

---

## Database Schema (Firestore)

### Collection: `slots`
Each document has an auto-generated ID:
```json
{
  "date": "2026-07-15",
  "time": "14:00",
  "capacity": 5,
  "booked": 2
}
```

### Collection: `bookings`
Each document has an auto-generated ID:
```json
{
  "slotId": "SLOT_DOCUMENT_ID",
  "name": "Jane Doe",
  "contact": "+1 (555) 019-2834",
  "status": "Pending" // Options: "Pending" | "Confirmed" | "Cancelled"
}
```

---

## Installation & Local Setup

### 1. Prerequisites
Ensure you have Node.js installed (tested on v24.14.0) and npm.

### 2. Clone and Install Dependencies
Navigate to the project root and install:
```bash
npm install
```

### 3. Setup Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Under project settings, click **Add Web App** to generate your Firebase configuration.
3. Enable **Email/Password** Authentication under Build > Authentication > Sign-in method.
4. Enable **Cloud Firestore** under Build > Firestore Database. Set rules to allow read/write access (for development):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   *(Note: In production, configure Firestore rules to restrict write access to the `slots` collection and status updates in the `bookings` collection to authenticated owners).*
5. Update your local credentials in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     }
   };
   ```

### 4. Create Owner Account
To log in as the owner:
1. Go to the **Authentication** tab in the Firebase Console.
2. Click **Add User**.
3. Create the credentials:
   - **Email**: `owner@slotwise.com` *(or any email)*
   - **Password**: `password123` *(at least 6 characters)*

---

## Running Locally

Run the development server:
```bash
npm run dev
```
Open [http://localhost:4200](http://localhost:4200) in your browser.
- Navigating to `/booking` opens the customer booking page.
- Navigating to `/dashboard` redirects to `/login` if unauthenticated. After logging in with your owner credentials, you can manage slots and view/approve bookings.

---

## Deployment to Firebase Hosting

### 1. Build the Project
Compile the Angular project in production mode:
```bash
npm run build
```
This builds static assets into `dist/slotwise/browser`.

### 2. Configure Firebase CLI
Install Firebase tools globally if you haven't already:
```bash
npm install -g firebase-tools
```
Log in to your Firebase account:
```bash
firebase login
```

### 3. Deploy
Associate your project in `.firebaserc` (replace `YOUR_PROJECT_ID` with your actual project ID) and deploy:
```bash
firebase use --add YOUR_PROJECT_ID
firebase deploy
```
This uploads the built assets to Firebase Hosting and provides a live URL.

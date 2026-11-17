# MediCare — Medicine Reminder & Family Health Tracker

A full-stack medicine reminder application that helps users manage medication schedules, record daily doses, monitor adherence, track refill levels, and view medication activity across a family care circle.

## Features

- **Account registration and login** with password hashing and JWT-based authentication.
- **Medicine management** — add, view, update, and delete medicines.
- **Daily dose tracking** — view scheduled doses and mark them as upcoming, taken, or missed.
- **Dose history** — review previous dose records and delete individual dose entries without deleting the recurring medicine schedule.
- **Adherence tracking** — view daily adherence information and weekly summaries on the dashboard.
- **Missed-dose visibility** — identify doses that were marked missed or whose scheduled time has passed.
- **Family care circle** — add an existing account to your family and view members' adherence and missed-dose information.
- **Refill tracking** — maintain remaining dose counts and configure a refill threshold.
- **Responsive dashboard UI** built with React and Lucide icons.

> **Important:** This application is a medication-organization tool, not a medical device. It does not provide medical advice or replace instructions from a qualified healthcare professional. Always follow your prescriber's directions.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| UI icons | Lucide React |
| Development | concurrently, nodemon |

## Project Structure

```text
medicine-reminder-application/
├── public/
│   ├── components/       # Reusable React UI components
│   ├── pages/            # Dashboard, Medicines, Reminders, Family, Analytics
│   ├── assets/           # Static assets
│   ├── api.js            # Frontend API client
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── src/
│   ├── controllers/      # Authentication, medicine, dose and family logic
│   ├── db/               # MongoDB connection
│   ├── middleware/       # Authentication and error handling
│   ├── models/           # User, Family, Medicine and DoseLog schemas
│   ├── routes/           # Express API routes
│   ├── utils/            # JWT utilities
│   ├── app.js
│   └── server.js
├── .gitignore
├── package.json
└── vite.config.js
```

## Getting Started

### 1. Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (included with Node.js)
- A [MongoDB](https://www.mongodb.com/) database — local MongoDB or MongoDB Atlas
- Git

### 2. Clone the repository

```bash
git clone https://github.com/SOUMYADEEP732/medicine-reminder-application.git
cd medicine-reminder-application
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the application

```bash
npm run dev
```

This command starts the Express backend and Vite frontend together.

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

The backend defaults to port `5173` in the current source, which conflicts with Vite's configured port. Set `PORT=5000` in `.env` as shown above so the frontend and backend use separate ports.

### Run frontend and backend separately

If you prefer two terminals:

**Terminal 1 — backend**

```bash
npm run dev:backend
```

**Terminal 2 — frontend**

```bash
npm run dev:frontend
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts backend and frontend concurrently |
| `npm run dev:backend` | Starts the Express API |
| `npm run dev:frontend` | Starts the Vite development server |

## API Overview

All endpoints are served under `/api`. Protected endpoints require a JWT in the request header:

```http
Authorization: Bearer <your_jwt_token>
```

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `GET` | `/api/health` | Check API status | No |
| `POST` | `/api/auth/signup` | Create an account | No |
| `POST` | `/api/auth/login` | Log in | No |
| `GET` | `/api/medicines` | List the signed-in user's medicines | Yes |
| `GET` | `/api/medicines/user/:userId` | List a family member's medicines | Yes |
| `POST` | `/api/medicines` | Add a medicine | Yes |
| `PATCH` | `/api/medicines/:id` | Update a medicine | Yes |
| `DELETE` | `/api/medicines/:id` | Delete a medicine and its dose records | Yes |
| `GET` | `/api/doselogs` | Get dose records | Yes |
| `GET` | `/api/doselogs/user/:userId` | Get a family member's dose records | Yes |
| `PATCH` | `/api/doselogs/:id` | Update a dose status | Yes |
| `DELETE` | `/api/doselogs/:id` | Delete an individual dose record | Yes |
| `GET` | `/api/family/members` | List family members and their adherence details | Yes |
| `POST` | `/api/family/add-member` | Add an existing account to the family | Yes |

### Example: Add a medicine

```json
{
  "name": "Vitamin D",
  "dosage": "1 tablet",
  "instruction": "After food",
  "time": "09:00 AM",
  "color": "blue",
  "remainingDoses": 30,
  "refillThreshold": 5
}
```

### Dose status values

A dose can have one of these statuses:

- `upcoming`
- `taken`
- `missed`

## How Family Linking Works

1. A user creates an account and receives a new family group.
2. To join another user's family, the existing account is added using that account's email address and password.
3. Family members can view adherence and missed-dose information for accounts in the same family.

Only add people to a family group with their knowledge and permission. Do not share account passwords.

## Security & Configuration Notes

- Passwords are hashed with `bcryptjs` before being stored.
- Protected API routes use JWT authentication.
- Keep `.env` out of version control.
- Use a strong, unique `JWT_SECRET`.
- Restrict database access and credentials appropriately, especially when using MongoDB Atlas.
- Configure `CLIENT_ORIGIN` for the frontend origin you actually deploy.

## Current Scope

The repository implements medication schedules, dose-status recording, dose history, refill counts, adherence views, and family-member tracking. It should not be assumed to send operating-system push notifications, SMS, or email reminders unless those integrations are added and configured separately.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request.

## License

This project currently declares the **ISC** license in `package.json`.

---

<p align="center">
  Made to make everyday medication tracking simpler.
</p>

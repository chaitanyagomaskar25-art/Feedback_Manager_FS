# Feedback Manager API

## Requirements

- Node.js 18 or newer
- MongoDB connection string

Configure these environment variables in a local `.env` file or deployment
settings:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=use-a-long-random-secret
ADMIN_SETUP_KEY=use-a-separate-one-time-setup-secret
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
```

`FRONTEND_ORIGIN` may contain a comma-separated list of allowed origins. Keep
`JWT_SECRET` and `ADMIN_SETUP_KEY` private; never place them in frontend code.

Install and run:

```sh
npm ci
npm run dev
```

## Create the first admin

1. Start the API with `ADMIN_SETUP_KEY` set.
2. Make one setup request using your chosen administrator details. This endpoint
   only works until an admin account exists.

```sh
curl -X POST http://localhost:5000/auth/setup-admin \
  -H 'Content-Type: application/json' \
  -d '{"setupKey":"YOUR_ADMIN_SETUP_KEY","name":"Admin","email":"admin@example.com","password":"a-long-password"}'
```

The response contains the new admin's bearer token. Afterward, create additional
accounts through `/auth/register` and assign **Feedback Manager** or **Admin**
roles from the authenticated admin's **People** screen.

## API overview

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `POST /auth/setup-admin` (one time; requires `ADMIN_SETUP_KEY`)
- `GET /auth/users`, `PATCH /auth/users/:id/role` (admin only)
- `POST /feedback`, `GET /feedback`, `GET /feedback/dashboard`
- `PATCH /feedback/:id`, `DELETE /feedback/:id`

All feedback endpoints require `Authorization: Bearer <token>`. Users can access
their own submissions; managers and admins can review all feedback. Status
changes are restricted to managers and admins.

Feedback categories are Product, Service, Teaching, Event, and Other. Workflow
statuses are New, Under Review, In Progress, Resolved, and Rejected.

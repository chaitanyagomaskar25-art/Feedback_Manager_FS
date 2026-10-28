# Kindred Feedback

Responsive feedback portal with account registration, role-aware dashboards, and feedback moderation.

## Run locally

Use Node.js 18 or newer.

```sh
npm ci
npm run dev
```

By default the frontend connects to the API at `http://localhost:5000`. Set
`VITE_API_URL` in a local `.env` file to point to a deployed API instead:

```env
VITE_API_URL=https://your-api.example.com
```

## Accounts and access

- Registering creates a regular **User** account.
- Users can create feedback, see their own dashboard, and edit or delete their own submissions.
- **Feedback Managers** and **Admins** can review all submissions and update their status.
- **Admins** can also manage account roles from **People**.

The first admin account is created through the backend's one-time setup endpoint.
See [the backend setup guide](../Backend/README.md) for required environment
variables and the setup request.

# carrecallr

carrecallr is a vehicle safety and recall tracking app built with Next.js. It helps users search for vehicles by make, model, and model year, review recall history and NHTSA safety ratings, save vehicles, and receive browser notifications when new recalls are detected.

## Overview

This project is designed around a small but practical workflow:

1. Search for a vehicle
2. Review recall history and NHTSA safety data
3. Save a vehicle for monitoring
4. Receive notifications when a new recall is published

The app relies on official NHTSA data, uses Clerk for authentication, stores user and vehicle state in MongoDB, and checks saved vehicles on a scheduled background job.

## Features

- Vehicle lookup by make, model, and model year
- Recall detail pages with NHTSA-provided summary fields
- Safety rating lookup from NHTSA
- Saved vehicle tracking per authenticated user
- Alert toggles for individual saved vehicles
- Browser push notifications for new recall alerts
- Protected API routes for authenticated actions
- Scheduled recall refresh job via a cron-style endpoint

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Clerk for authentication
- MongoDB via the official Node driver
- Web Push API for browser notifications
- NHTSA public APIs for recall and safety data

## Project Structure

```text
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── account/
│   │   │   ├── alerts/
│   │   │   ├── cron/check-recalls/
│   │   │   ├── push/
│   │   │   ├── saved-vehicles/
│   │   │   └── vehicles/
│   │   ├── (auth)/
│   │   └── (main)/
│   ├── components/
│   ├── lib/
│   ├── models/
│   └── types/
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── vercel.json
└── README.md
```

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 20+
- npm
- MongoDB instance or MongoDB Atlas cluster
- Clerk project configured
- VAPID keys for browser push notifications

## Environment Variables

Create a `.env.local` file in the project root with the following values:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/carrecallr

# Web Push
WEB_PUSH_PUBLIC_KEY=your_vapid_public_key
WEB_PUSH_PRIVATE_KEY=your_vapid_private_key
WEB_PUSH_SUBJECT=mailto:your-email@example.com

# Cron protection
CRON_SECRET=your_secure_random_secret
```

Notes:

- `MONGODB_URI` is required for app and background data storage.
- `WEB_PUSH_*` values are required for browser notifications.
- `CRON_SECRET` protects the recall polling endpoint from unauthorized access.
- Clerk keys are needed for sign-in and user-session flows.

## Installation

```bash
npm install
```

## Running the App

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Build and Validation

```bash
npm run build
npm run lint
```

## Scheduled Recall Checks

The app includes a cron-style route at:

```text
/api/cron/check-recalls
```

This endpoint checks saved vehicles, fetches updated recall data from NHTSA, stores recall records, and sends push notifications when a new recall is identified.

A valid request must include the secret in either header:

```http
Authorization: Bearer <CRON_SECRET>
```

or

```http
x-cron-secret: <CRON_SECRET>
```

## Deployment

This project is structured for modern deployment on Vercel or any Node-compatible host. For production, ensure the same environment variables are configured in your deployment platform.

Recommended production setup:

- Vercel for the Next.js app
- MongoDB Atlas for database storage
- Clerk production project credentials
- VAPID keys for push notifications
- Cron job or scheduler for periodic recall checks

## Data Sources

The app uses official NHTSA APIs for:

- recall lookups
- vehicle safety ratings
- vehicle make/model metadata

This keeps the product grounded in authoritative public safety data rather than third-party scraping or unsupported claims.

## Notes

This project is intentionally scoped and practical rather than broad. It focuses on a clean recall-tracking experience with verified data handling, user account protection, and automated monitoring rather than adding extra product complexity.

# Quickstart Guide

Get the Cyber Portfolio CMS running locally in under five minutes.

## Prerequisites

- Node.js 20 or newer
- npm
- A Postgres database URL

## 1. Install the project

```bash
git clone <repository-url>
cd cyber-portfolio-cms
npm install
```

## 2. Create the environment file

Copy the example file:

```bash
copy .env.example .env.local
```

On macOS/Linux, use:

```bash
cp .env.example .env.local
```

Open `.env.local` and set these values:

```env
DATABASE_URL=your-postgres-connection-string
AUTH_SECRET=your-long-random-secret
AUTH_URL=http://localhost:3000
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD_HASH=your-bcrypt-password-hash
```

The AI and Cloudinary variables can be left blank for the initial local startup unless you are testing those features:

```env
OPENROUTER_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 3. Create an admin password hash

Run this command, replacing the example password with your own password:

```bash
npm run hash-password -- "your-password"
```

Copy the printed `ADMIN_PASSWORD_HASH` value into `.env.local`.

For `.env.local`, escape each dollar sign in the hash:

```env
ADMIN_PASSWORD_HASH=\$2b\$12\$...
```

Use the raw hash without backslashes when entering it into Vercel's Environment Variables dashboard.

## 4. Prepare the database

Apply the Prisma migrations and seed the initial portfolio content:

```bash
npm run db:migrate
npm run db:seed
```

## 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The admin login is available at [http://localhost:3000/login](http://localhost:3000/login). Use the `ADMIN_EMAIL` value and the original plain-text password used to create the bcrypt hash.

## Useful commands

```bash
npm run lint          # Check code style and errors
npm test              # Run unit and component tests
npm run test:e2e      # Run Playwright end-to-end tests
npm run build         # Verify a production build
```

## Vercel deployment

Add the required environment variables in **Vercel > Project > Settings > Environment Variables**, then redeploy:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `OPENROUTER_API_KEY` if using the AI assistant
- Cloudinary variables if using image uploads

Do not set production `AUTH_URL` to `http://localhost:3000`. Delete it so Vercel/Auth.js detects the deployment URL, or set it to:

```text
https://cyber-portfolio-cms.vercel.app
```

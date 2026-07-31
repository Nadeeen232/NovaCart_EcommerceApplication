# NovaCart MEAN E-Commerce

A polished full-stack project matching the supplied final-project requirements.

## Folders
- `backend/`: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Nodemailer
- `frontend/`: Angular standalone application, routing, signals, HttpClient, reactive forms

## Quick start
### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Open `http://localhost:4200`. API defaults to `http://localhost:5000/api`.

## Demo admin
After seeding: `admin@novacart.dev` / `Admin123!`

## Email confirmation
In development, if SMTP is not configured, the API prints the confirmation URL in the backend console and returns it as `devConfirmationUrl`.

## Frontend dependency reset
Angular packages are pinned to one exact patch version to prevent npm peer-dependency conflicts.

Windows Command Prompt:
```bat
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm cache verify
npm install
npm start
```

# Backend Setup Guide

## Step 1: Create .env file

Create a file named `.env` in the `backend` folder with the following content:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recipes_db3
PORT=5000
JWT_SECRET=your_secret_key_here
```

## Step 2: Update the values

Replace the following values with your actual MySQL credentials:
- `DB_PASSWORD`: Your MySQL root password (or leave empty if no password)
- `DB_USER`: Your MySQL username (usually 'root')
- `DB_HOST`: Your MySQL host (usually 'localhost')
- `JWT_SECRET`: Any random string for JWT token signing (optional for now)

## Step 3: Install dependencies

```bash
npm install
```

## Step 4: Start the server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:5000`


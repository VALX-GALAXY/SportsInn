# Day 1 – Auth APIs (Node.js + Express)

Simple authentication service using **Express**, **JWT**, and **bcrypt** with an **in-memory user store**.

## Features
- **Signup** – `POST /api/auth/signup`  
  Create a new user (password hashed).
- **Login** – `POST /api/auth/login`  
  Verify credentials and return a JWT.
- **Update Profile** – `PUT /api/auth/profile`  
  Update bio or profile picture (requires JWT).

## Tech Stack
- Node.js, Express
- JSON Web Token (jsonwebtoken)
- bcrypt
- CORS

## Run Locally
```bash
npm install
node server.js
```

Default server: http://localhost:3000

Users are stored in memory and reset when the server restarts.

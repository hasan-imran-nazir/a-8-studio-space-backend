# Studio Space Backend API

Studio Space is a studio booking platform where hosts can list creative spaces and guests can browse and book them.

This repository contains the REST API for managing studio listings, bookings, and authentication.

**Frontend Repository:** Add your client repository link here.

## Features

- CRUD operations for studio listings.
- Create, view, and cancel bookings.
- Prevent duplicate confirmed bookings for the same studio and date.
- Retrieve listings by host and bookings by guest.
- JWT authentication for protected routes.
- Vercel deployment configuration.

## Tech Stack

- Node.js and Express 5
- MongoDB
- JWT, JWKS, and `jose`
- dotenv, cors, and zod
- Vercel

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/hasan-imran-nazir/a-8-studio-space-backend.git
cd a-8-studio-space-backend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

**4. Start the server**

```bash
npm run dev
```

The API runs at `http://localhost:8000`.

## API Endpoints

### Studios

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/studios` | Get all studios |
| GET | `/studios/:id` | Get a studio by ID |
| POST | `/add-studio` | Create a studio |
| PATCH | `/studios/:id` | Update a studio |
| DELETE | `/studios/:id` | Delete a studio |
| GET | `/my-listings/:hostEmail` | Get a host's listings |

### Bookings

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/add-booking` | Create a booking |
| GET | `/bookings` | Get all bookings; supports `?email=` filtering |
| GET | `/my-bookings/:email` | Get a guest's bookings |
| DELETE | `/mybookings/:id` | Cancel a booking |

### Health Check

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Check server status |

Protected endpoints require a valid JWT bearer token.

## Authentication

The API verifies JWTs using public keys stored in MongoDB. The `jose` library handles token verification, and invalid or missing tokens receive a `401 Unauthorized` response.

## Deployment

The project is configured for Vercel.

```bash
vercel
```

Add `MONGODB_URI` and `CLIENT_URL` to your Vercel environment variables.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the server |
| `npm run dev` | Start with automatic restarts |

## License

ISC
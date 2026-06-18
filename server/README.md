# Quantara API Server

Express server that handles Paystack payment initialization and verification. The Paystack **secret key stays on the server only**.

## Setup

1. Copy environment variables:

   ```bash
   cp server/.env.example server/.env
   ```

2. Add your Paystack secret key to `server/.env` (or the project root `.env`).

## Run locally

From the **project root** (recommended — runs frontend + server together):

```bash
npm install
npm run dev
```

Server only:

```bash
npm run server:dev
```

Or from this folder:

```bash
cd server
npm install
npm run dev
```

The API listens on `http://localhost:3001` by default.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/paystack/initialize` | Start a Paystack checkout |
| GET | `/api/paystack/verify/:reference` | Verify a completed payment |
| POST | `/api/paystack/webhook` | Paystack webhook (signature verified) |

### `POST /api/paystack/initialize`

**Body**

```json
{
  "email": "student@example.com",
  "amount": 500000,
  "reference": "qr_abc123",
  "currency": "NGN",
  "callback_url": "http://localhost:5173/payment/callback",
  "metadata": {
    "user_id": "...",
    "course_id": "...",
    "package_type": "basic"
  }
}
```

**Response**

```json
{
  "success": true,
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "qr_abc123"
}
```

### `GET /api/paystack/verify/:reference`

**Response**

```json
{
  "success": true,
  "status": "success",
  "reference": "qr_abc123",
  "amount": 500000,
  "currency": "NGN",
  "metadata": {},
  "message": "Payment verified"
}
```

## Production TODOs

- Point Paystack webhook URL to `POST /api/paystack/webhook`
- Persist webhook events and reconcile registration status in Supabase
- Deploy behind HTTPS and set `CLIENT_URL` to your production frontend origin

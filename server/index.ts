import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Resolve directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Supabase Admin client if credentials exist (optional backend DB write)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  'http://localhost:5173',
  'https://quantara-labs.vercel.app',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

// Enable CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Health check endpoints for Render
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.get('/', (_req, res) => {
  res.send('Quantara Backend Server is running.');
});

// Paystack Transaction Initialization Endpoint (Redirect Flow)
app.post('/api/paystack/initialize', async (req, res) => {
  try {
    const { email, packageType, courseId, userId, deliveryLocation, callbackUrl } = req.body;

    if (!email || !packageType || !courseId || !userId || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        message: 'email, packageType, courseId, userId, deliveryLocation are required',
      });
    }

    if (packageType !== 'basic' && packageType !== 'pro') {
      return res.status(400).json({
        success: false,
        message: 'Invalid packageType (must be basic or pro)',
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey.startsWith('sk_test_xxxx')) {
      return res.status(500).json({
        success: false,
        message: 'Server has misconfigured Paystack Secret Key',
      });
    }

    // Resolve pricing securely on the backend
    const amountKobo =
      packageType === 'basic'
        ? Number(process.env.BASIC_PACKAGE_AMOUNT_KOBO || process.env.VITE_BASIC_PACKAGE_AMOUNT_KOBO || 300000)
        : Number(process.env.PRO_PACKAGE_AMOUNT_KOBO || process.env.VITE_PRO_PACKAGE_AMOUNT_KOBO || 400000);

    const reference = `qr_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        reference,
        currency: process.env.PAYSTACK_CURRENCY || process.env.VITE_PAYSTACK_CURRENCY || 'NGN',
        callback_url: callbackUrl,
        metadata: {
          courseId,
          userId,
          packageType,
          deliveryLocation,
        },
      }),
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      return res.status(paystackResponse.status).json({
        success: false,
        message: data.message || 'Failed to initialize Paystack transaction',
      });
    }

    return res.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      amountKobo,
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment initialization',
    });
  }
});

async function verifyPaystackReference(reference, res) {
  try {
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Reference is required',
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey.startsWith('sk_test_xxxx')) {
      return res.status(500).json({
        success: false,
        message: 'Server has misconfigured Paystack Secret Key',
      });
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      return res.status(paystackResponse.status).json({
        success: false,
        message: data.message || 'Failed to verify transaction with Paystack',
      });
    }

    if (data.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: `Transaction is not successful (status: ${data.data.status})`,
      });
    }

    const metadata = data.data.metadata || {};
    let dbRegistered = false;

    // Secure database registration from the backend if admin client is initialized
    if (supabaseAdmin && metadata.userId && metadata.courseId) {
      try {
        const { error: insertError } = await supabaseAdmin.from('registrations').insert({
          user_id: metadata.userId,
          course_id: metadata.courseId,
          package_type: metadata.packageType || 'basic',
          delivery_location: metadata.deliveryLocation || 'The Engineering Civil Shed',
          payment_reference: data.data.reference,
          payment_status: 'paid',
          amount_kobo: data.data.amount,
        });

        if (insertError) {
          if (insertError.code === '23505') {
            // User was already registered (e.g. page refreshed)
            dbRegistered = true;
          } else {
            console.error('Supabase admin insert error:', insertError.message);
          }
        } else {
          dbRegistered = true;
        }
      } catch (dbErr) {
        console.error('Supabase admin DB error:', dbErr);
      }
    }

    return res.json({
      success: true,
      reference: data.data.reference,
      amount: data.data.amount,
      amountKobo: data.data.amount,
      email: data.data.customer.email,
      status: data.data.status,
      metadata,
      dbRegistered,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment verification',
    });
  }
}

// Paystack Transaction Verification Endpoint
app.post('/api/paystack/verify', async (req, res) => {
  return verifyPaystackReference(req.body.reference, res);
});

app.get('/api/paystack/verify/:reference', async (req, res) => {
  return verifyPaystackReference(req.params.reference, res);
});

// Start express server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

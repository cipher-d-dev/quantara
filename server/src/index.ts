import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Resolve directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server directory
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// Initialize Supabase Admin client if credentials exist (optional backend DB write)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

async function sendTelegramAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || token === "your_bot_token_here") {
    console.warn("Telegram alert skipped: missing or placeholder credentials");
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    const result = await res.json() as { ok: boolean; description?: string };
    if (!result.ok) {
      console.error("Telegram alert failed:", result.description);
    }
  } catch (err) {
    console.error("Telegram alert failed (network):", err);
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendReceiptEmail(opts: {
  to: string;
  studentName: string;
  reference: string;
  amountNaira: string;
  packageType: string;
  courseId: string;
  date: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Quantara <onboarding@resend.dev>";
  if (!apiKey || apiKey === "your_resend_api_key_here") return;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090b;color:#e4e4e7;border-radius:12px;padding:32px;">
      <div style="margin-bottom:24px;display:flex;align-items:center;gap:12px;">
        <img src="https://quantara-labs.vercel.app/logo.svg" alt="Quantara" width="40" height="40" style="border-radius:10px;display:block;" onerror="this.style.display='none'" />
        <div>
          <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 2px">Payment Receipt</h1>
          <p style="color:#71717a;font-size:13px;margin:0">Quantara Lab Reports</p>
        </div>
      </div>
      <p style="font-size:15px;color:#a1a1aa;margin:0 0 24px">Hi <strong style="color:#e4e4e7">${opts.studentName}</strong>, your payment was successful. Here's your receipt.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${[
          ["Receipt Number", opts.reference],
          ["Date", opts.date],
          ["Package", opts.packageType.charAt(0).toUpperCase() + opts.packageType.slice(1)],
          ["Course ID", opts.courseId],
          ["Amount Paid", `<strong style="color:#818cf8">${opts.amountNaira}</strong>`],
          ["Status", '<span style="color:#4ade80">✓ Paid</span>'],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:10px 0;color:#71717a;border-bottom:1px solid #27272a">${label}</td>
            <td style="padding:10px 0;text-align:right;color:#e4e4e7;border-bottom:1px solid #27272a">${value}</td>
          </tr>
        `).join("")}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#52525b;text-align:center;">
        If you have questions, reply to this email or contact your lab coordinator.
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: `Payment Receipt – ${opts.amountNaira} (${opts.reference})`,
      html,
    });
    if (error) console.error("Receipt email failed:", error.message);
  } catch (err) {
    console.error("Receipt email failed (network):", err);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://quantara-labs.vercel.app",
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
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
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Health check endpoints for Render
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

app.get("/", (_req, res) => {
  res.send("Quantara Backend Server is running.");
});

// Paystack Transaction Initialization Endpoint (Redirect Flow)
app.post("/api/paystack/initialize", async (req, res) => {
  try {
    const {
      email,
      packageType,
      courseId,
      userId,
      deliveryLocation,
      deliveryTime,
      outlineUrl,
      callbackUrl,
    } = req.body;

    if (!email || !packageType || !courseId || !userId || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        message:
          "email, packageType, courseId, userId, deliveryLocation are required",
      });
    }

    if (packageType !== "basic" && packageType !== "pro") {
      return res.status(400).json({
        success: false,
        message: "Invalid packageType (must be basic or pro)",
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey.startsWith("sk_test_xxxx")) {
      return res.status(500).json({
        success: false,
        message: "Server has misconfigured Paystack Secret Key",
      });
    }

    // Resolve pricing securely on the backend
    const amountKobo =
      packageType === "basic"
        ? Number(
            process.env.BASIC_PACKAGE_AMOUNT_KOBO ||
              process.env.VITE_BASIC_PACKAGE_AMOUNT_KOBO ||
              300000,
          )
        : Number(
            process.env.PRO_PACKAGE_AMOUNT_KOBO ||
              process.env.VITE_PRO_PACKAGE_AMOUNT_KOBO ||
              400000,
          );

    const reference = `qr_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountKobo,
          reference,
          currency:
            process.env.PAYSTACK_CURRENCY ||
            process.env.VITE_PAYSTACK_CURRENCY ||
            "NGN",
          callback_url: callbackUrl,
          metadata: {
            courseId,
            userId,
            packageType,
            deliveryLocation,
            deliveryTime: deliveryTime ?? null,
            outlineUrl: outlineUrl ?? null,
          },
        }),
      },
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      return res.status(paystackResponse.status).json({
        success: false,
        message: data.message || "Failed to initialize Paystack transaction",
      });
    }

    return res.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      amountKobo,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment initialization",
    });
  }
});

async function verifyPaystackReference(reference: string, res: any) {
  try {
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Reference is required",
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey.startsWith("sk_test_xxxx")) {
      return res.status(500).json({
        success: false,
        message: "Server has misconfigured Paystack Secret Key",
      });
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      return res.status(paystackResponse.status).json({
        success: false,
        message: data.message || "Failed to verify transaction with Paystack",
      });
    }

    if (data.data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: `Transaction is not successful (status: ${data.data.status})`,
      });
    }

    const metadata = data.data.metadata || {};
    const customerEmail = data.data.customer.email;
    const paymentRef = data.data.reference;
    const amountNaira = (data.data.amount / 100).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    });

    // Fetch student name for the alert (best-effort)
    let studentName = customerEmail;
    if (supabaseAdmin && metadata.userId) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("id", metadata.userId)
          .single();
        if (profile?.full_name) studentName = profile.full_name;
      } catch (_) {}
    }

    // ── Send alert immediately after payment confirmed ──
    void sendTelegramAlert(
      `🔔 <b>New Payment</b>\n\nStudent: ${studentName}\nEmail: ${customerEmail}\nCourse ID: ${metadata.courseId ?? "N/A"}\nPackage: ${metadata.packageType ?? "N/A"}\nAmount: ${amountNaira}\nRef: ${paymentRef}`,
    );
    void sendReceiptEmail({
      to: customerEmail,
      studentName,
      reference: paymentRef,
      amountNaira,
      packageType: metadata.packageType ?? "basic",
      courseId: metadata.courseId ?? "N/A",
      date: new Date().toLocaleDateString("en-NG", { dateStyle: "long" }),
    });

    let dbRegistered = false;

    // Secure database registration from the backend if admin client is initialized
    if (supabaseAdmin && metadata.userId && metadata.courseId) {
      try {
        const { error: insertError } = await supabaseAdmin
          .from("registrations")
          .insert({
            user_id: metadata.userId,
            course_id: metadata.courseId,
            package_type: metadata.packageType || "basic",
            delivery_location:
              metadata.deliveryLocation || "The Engineering Civil Shed",
            delivery_time: (metadata.deliveryTime as string | null) ?? null,
            payment_reference: paymentRef,
            payment_status: "paid",
            amount_kobo: data.data.amount,
            outline_url: (metadata.outlineUrl as string | null) ?? null,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            // Duplicate — already registered (e.g. callback hit twice)
            dbRegistered = true;
          } else {
            console.error("Supabase admin insert error:", insertError.message);
            void sendTelegramAlert(
              `⚠️ <b>Registration Insert Failed</b>\n\nPayment was successful but DB registration failed.\n\nEmail: ${customerEmail}\nRef: ${paymentRef}\nError: ${insertError.message}`,
            );
          }
        } else {
          dbRegistered = true;
        }
      } catch (dbErr) {
        console.error("Supabase admin DB error:", dbErr);
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
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment verification",
    });
  }
}

// Paystack Transaction Verification Endpoint
app.post("/api/paystack/verify", async (req, res) => {
  return verifyPaystackReference(req.body.reference, res);
});

app.get("/api/paystack/verify/:reference", async (req, res) => {
  return verifyPaystackReference(req.params.reference, res);
});

// Start express server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

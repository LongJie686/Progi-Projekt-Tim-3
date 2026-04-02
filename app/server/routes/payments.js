const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const pool = require("../config/db");
const verifyToken = require("../middleware/verifyToken");

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Helper: check if user is student
const requireStudent = async (userId) => {
    const result = await pool.query(
        "SELECT is_professor FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0]?.is_professor === false;
};

// Helper: check if user is professor
const requireProfessor = async (userId) => {
    const result = await pool.query(
        "SELECT is_professor FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0]?.is_professor === true;
};

// Create payment intent for booking
router.post("/create-intent", verifyToken, async (req, res) => {
    try {
        const { booking_id } = req.body;
        const userId = req.user.id;

        if (!booking_id) {
            return res.status(400).json({ message: "Booking ID is required." });
        }

        // Get booking details
        const bookingResult = await pool.query(`
            SELECT
                b.id,
                b.student_id,
                b.slot_id,
                s.price,
                s.professor_id,
                s.start_time,
                u.email as student_email,
                u.name as student_name
            FROM professor_slot_bookings b
            JOIN professor_slots s ON s.id = b.slot_id
            JOIN users u ON u.id = b.student_id
            WHERE b.id = $1 AND b.student_id = $2
        `, [booking_id, userId]);

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }

        const booking = bookingResult.rows[0];

        // Check if payment already exists
        const existingPayment = await pool.query(
            "SELECT * FROM payments WHERE booking_id = $1",
            [booking_id]
        );

        if (existingPayment.rows.length > 0) {
            // Return existing payment intent if pending
            if (existingPayment.rows[0].status === "pending" || existingPayment.rows[0].status === "processing") {
                return res.json({
                    client_secret: existingPayment.rows[0].client_secret,
                    payment_id: existingPayment.rows[0].id,
                    amount: parseFloat(existingPayment.rows[0].amount)
                });
            }
            return res.status(400).json({ message: "Payment already processed." });
        }

        const amount = Math.round(parseFloat(booking.price) * 100); // Convert to cents

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            metadata: {
                booking_id: booking_id,
                student_id: userId,
                professor_id: booking.professor_id
            },
            receipt_email: booking.student_email
        });

        // Store payment record
        const paymentResult = await pool.query(`
            INSERT INTO payments (booking_id, stripe_payment_id, amount, status, client_secret)
            VALUES ($1, $2, $3, 'pending', $4)
            RETURNING id
        `, [booking_id, paymentIntent.id, booking.price, paymentIntent.client_secret]);

        res.json({
            client_secret: paymentIntent.client_secret,
            payment_id: paymentResult.rows[0].id,
            amount: parseFloat(booking.price)
        });
    } catch (err) {
        console.error("Error creating payment intent:", err);
        res.status(500).json({ message: "Error creating payment." });
    }
});

// Confirm payment (called after successful payment on frontend)
router.post("/confirm", verifyToken, async (req, res) => {
    try {
        const { payment_intent_id } = req.body;
        const userId = req.user.id;

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({ message: "Payment not successful." });
        }

        // Update payment status
        const paymentResult = await pool.query(`
            UPDATE payments
            SET status = 'completed', completed_at = NOW()
            WHERE stripe_payment_id = $1
            RETURNING id, booking_id
        `, [payment_intent_id]);

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: "Payment not found." });
        }

        // Create notification for professor
        const bookingId = paymentResult.rows[0].booking_id;
        const bookingInfo = await pool.query(`
            SELECT s.professor_id, u.name as student_name
            FROM professor_slot_bookings b
            JOIN professor_slots s ON s.id = b.slot_id
            JOIN users u ON u.id = b.student_id
            WHERE b.id = $1
        `, [bookingId]);

        if (bookingInfo.rows.length > 0) {
            await pool.query(`
                INSERT INTO notifications (user_id, type, title, message, data)
                VALUES ($1, 'payment', 'Payment Received', $2, $3)
            `, [
                bookingInfo.rows[0].professor_id,
                `Payment received from ${bookingInfo.rows[0].student_name}`,
                JSON.stringify({ booking_id: bookingId, payment_id: paymentResult.rows[0].id })
            ]);
        }

        res.json({
            message: "Payment confirmed successfully.",
            payment_id: paymentResult.rows[0].id
        });
    } catch (err) {
        console.error("Error confirming payment:", err);
        res.status(500).json({ message: "Error confirming payment." });
    }
});

// Get payment details
router.get("/:paymentId", verifyToken, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT
                p.*,
                b.student_id,
                s.professor_id
            FROM payments p
            JOIN professor_slot_bookings b ON b.id = p.booking_id
            JOIN professor_slots s ON s.id = b.slot_id
            WHERE p.id = $1 AND (b.student_id = $2 OR s.professor_id = $2)
        `, [paymentId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Payment not found." });
        }

        res.json({ payment: result.rows[0] });
    } catch (err) {
        console.error("Error fetching payment:", err);
        res.status(500).json({ message: "Error fetching payment." });
    }
});

// Get my payments (student)
router.get("/my-payments", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT
                p.id,
                p.amount,
                p.status,
                p.created_at,
                b.id as booking_id,
                s.start_time,
                s.end_time,
                u.name as professor_name,
                u.surname as professor_surname,
                i.name as interest_name
            FROM payments p
            JOIN professor_slot_bookings b ON b.id = p.booking_id
            JOIN professor_slots s ON s.id = b.slot_id
            JOIN users u ON u.id = s.professor_id
            JOIN interests i ON i.id = b.interest_id
            WHERE b.student_id = $1
            ORDER BY p.created_at DESC
        `, [userId]);

        res.json({ payments: result.rows });
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ message: "Error fetching payments." });
    }
});

// Get tutor earnings
router.get("/tutor-earnings", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const isProfessor = await requireProfessor(userId);
        if (!isProfessor) {
            return res.status(403).json({ message: "Only professors can view earnings." });
        }

        // Total earnings
        const totalResult = await pool.query(`
            SELECT COALESCE(SUM(p.amount), 0) as total_earnings
            FROM payments p
            JOIN professor_slot_bookings b ON b.id = p.booking_id
            JOIN professor_slots s ON s.id = b.slot_id
            WHERE s.professor_id = $1 AND p.status = 'completed'
        `, [userId]);

        // Monthly earnings
        const monthlyResult = await pool.query(`
            SELECT
                TO_CHAR(DATE_TRUNC('month', p.created_at), 'YYYY-MM') as month,
                SUM(p.amount) as amount
            FROM payments p
            JOIN professor_slot_bookings b ON b.id = p.booking_id
            JOIN professor_slots s ON s.id = b.slot_id
            WHERE s.professor_id = $1 AND p.status = 'completed'
            GROUP BY DATE_TRUNC('month', p.created_at)
            ORDER BY month DESC
            LIMIT 12
        `, [userId]);

        // Recent payments
        const recentResult = await pool.query(`
            SELECT
                p.id,
                p.amount,
                p.created_at,
                u.name as student_name,
                u.surname as student_surname,
                i.name as interest_name
            FROM payments p
            JOIN professor_slot_bookings b ON b.id = p.booking_id
            JOIN professor_slots s ON s.id = b.slot_id
            JOIN users u ON u.id = b.student_id
            JOIN interests i ON i.id = b.interest_id
            WHERE s.professor_id = $1 AND p.status = 'completed'
            ORDER BY p.created_at DESC
            LIMIT 20
        `, [userId]);

        res.json({
            total_earnings: parseFloat(totalResult.rows[0].total_earnings),
            monthly_earnings: monthlyResult.rows.map(r => ({
                month: r.month,
                amount: parseFloat(r.amount)
            })),
            recent_payments: recentResult.rows.map(r => ({
                ...r,
                amount: parseFloat(r.amount)
            }))
        });
    } catch (err) {
        console.error("Error fetching earnings:", err);
        res.status(500).json({ message: "Error fetching earnings." });
    }
});

// Request refund (professor or admin)
router.post("/refund/:paymentId", verifyToken, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        // Get payment details
        const paymentResult = await pool.query(`
            SELECT p.*, b.student_id, s.professor_id
            FROM payments p
            JOIN professor_slot_bookings b ON b.id = p.booking_id
            JOIN professor_slots s ON s.id = b.slot_id
            WHERE p.id = $1
        `, [paymentId]);

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: "Payment not found." });
        }

        const payment = paymentResult.rows[0];

        // Check if user is admin or the professor involved
        const userCheck = await pool.query(
            "SELECT is_admin FROM users WHERE id = $1",
            [userId]
        );

        const isAdmin = userCheck.rows[0]?.is_admin;
        if (!isAdmin && payment.professor_id !== userId) {
            return res.status(403).json({ message: "Not authorized to refund this payment." });
        }

        if (payment.status === "refunded") {
            return res.status(400).json({ message: "Payment already refunded." });
        }

        // Process refund via Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.stripe_payment_id,
            reason: "requested_by_customer",
            metadata: {
                reason: reason || "No reason provided"
            }
        });

        // Update payment status
        await pool.query(
            "UPDATE payments SET status = 'refunded' WHERE id = $1",
            [paymentId]
        );

        // Notify student
        await pool.query(`
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES ($1, 'refund', 'Refund Processed', $2, $3)
        `, [
            payment.student_id,
            `Your payment of $${payment.amount} has been refunded.`,
            JSON.stringify({ payment_id: paymentId, refund_id: refund.id })
        ]);

        res.json({
            message: "Refund processed successfully.",
            refund_id: refund.id
        });
    } catch (err) {
        console.error("Error processing refund:", err);
        res.status(500).json({ message: "Error processing refund." });
    }
});

// Stripe webhook handler
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object;
            // Update payment status
            await pool.query(`
                UPDATE payments
                SET status = 'completed', completed_at = NOW()
                WHERE stripe_payment_id = $1 AND status = 'pending'
            `, [paymentIntent.id]);
            break;

        case "payment_intent.payment_failed":
            const failedPayment = event.data.object;
            await pool.query(
                "UPDATE payments SET status = 'failed' WHERE stripe_payment_id = $1",
                [failedPayment.id]
            );
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;
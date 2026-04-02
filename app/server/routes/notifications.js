const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/verifyToken");

// Get all notifications for current user
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, unread_only = false } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = "WHERE user_id = $1";
        const params = [userId];

        if (unread_only === "true") {
            whereClause += " AND is_read = false";
        }

        // Get total count
        const countResult = await pool.query(`
            SELECT COUNT(*) as total
            FROM notifications
            ${whereClause}
        `, params);

        // Get notifications
        const result = await pool.query(`
            SELECT
                id,
                type,
                title,
                message,
                is_read,
                data,
                created_at
            FROM notifications
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, parseInt(limit), offset]);

        res.json({
            notifications: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total),
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit))
            }
        });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Error fetching notifications." });
    }
});

// Get unread count
router.get("/unread-count", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = $1 AND is_read = false
        `, [userId]);

        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error("Error fetching unread count:", err);
        res.status(500).json({ message: "Error fetching unread count." });
    }
});

// Mark a notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(`
            UPDATE notifications
            SET is_read = true, read_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING id, type, title, message, is_read
        `, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found." });
        }

        res.json({ notification: result.rows[0] });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        res.status(500).json({ message: "Error updating notification." });
    }
});

// Mark all notifications as read
router.put("/read-all", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(`
            UPDATE notifications
            SET is_read = true, read_at = NOW()
            WHERE user_id = $1 AND is_read = false
        `, [userId]);

        res.json({ message: "All notifications marked as read." });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res.status(500).json({ message: "Error updating notifications." });
    }
});

// Delete a notification
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id",
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found." });
        }

        res.json({ message: "Notification deleted." });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: "Error deleting notification." });
    }
});

// Delete all read notifications
router.delete("/read/all", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(
            "DELETE FROM notifications WHERE user_id = $1 AND is_read = true",
            [userId]
        );

        res.json({ message: "All read notifications deleted." });
    } catch (err) {
        console.error("Error deleting read notifications:", err);
        res.status(500).json({ message: "Error deleting notifications." });
    }
});

// Create notification (internal use, typically called by other routes)
const createNotification = async (userId, type, title, message, data = null) => {
    try {
        const result = await pool.query(`
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, type, title, message, is_read, created_at
        `, [userId, type, title, message, data ? JSON.stringify(data) : null]);

        return result.rows[0];
    } catch (err) {
        console.error("Error creating notification:", err);
        return null;
    }
};

// Notification types and templates
const NotificationTypes = {
    BOOKING_CONFIRMED: "booking_confirmed",
    BOOKING_CANCELLED: "booking_cancelled",
    BOOKING_REMINDER: "booking_reminder",
    PAYMENT_RECEIVED: "payment_received",
    NEW_REVIEW: "new_review",
    QUIZ_ASSIGNED: "quiz_assigned",
    SYSTEM: "system"
};

const NotificationTemplates = {
    [NotificationTypes.BOOKING_CONFIRMED]: (data) => ({
        title: "Booking Confirmed",
        message: `Your booking with ${data.tutor_name} has been confirmed for ${data.date}.`
    }),
    [NotificationTypes.BOOKING_CANCELLED]: (data) => ({
        title: "Booking Cancelled",
        message: `Your booking for ${data.date} has been cancelled. ${data.reason || ""}`
    }),
    [NotificationTypes.BOOKING_REMINDER]: (data) => ({
        title: "Upcoming Session Reminder",
        message: `Reminder: You have a session with ${data.tutor_name} in ${data.time_until}.`
    }),
    [NotificationTypes.PAYMENT_RECEIVED]: (data) => ({
        title: "Payment Received",
        message: `Payment of $${data.amount} has been received from ${data.student_name}.`
    }),
    [NotificationTypes.NEW_REVIEW]: (data) => ({
        title: "New Review",
        message: `${data.student_name} left you a ${data.rating}-star review.`
    }),
    [NotificationTypes.QUIZ_ASSIGNED]: (data) => ({
        title: "New Quiz Available",
        message: `A new quiz "${data.quiz_title}" is available for ${data.subject_name}.`
    }),
    [NotificationTypes.SYSTEM]: (data) => ({
        title: data.title || "System Notification",
        message: data.message
    })
};

// Export the router and helper functions
router.createNotification = createNotification;
router.NotificationTypes = NotificationTypes;
router.NotificationTemplates = NotificationTemplates;

module.exports = router;
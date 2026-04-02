-- Payments table for Stripe integration
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL UNIQUE REFERENCES professor_slot_bookings(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255),
    client_secret TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- Add payment_id column to professor_slot_bookings if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'professor_slot_bookings' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE professor_slot_bookings ADD COLUMN payment_id INTEGER REFERENCES payments(id);
    END IF;
END $$;

-- Add notification-related columns to users if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'notification_preferences'
    ) THEN
        ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb;
    END IF;
END $$;
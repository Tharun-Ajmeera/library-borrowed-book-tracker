-- ====================================================================
-- Library Borrowed Book Tracker - Production Database Schema
-- Target: Supabase PostgreSQL
-- ====================================================================

-- 1. Ensure UUID generator extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create borrowing_records table
CREATE TABLE IF NOT EXISTS public.borrowing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    staff_id UUID NOT NULL,

    student_name VARCHAR(100) NOT NULL,

    student_phone VARCHAR(20) NOT NULL,

    book_title VARCHAR(200) NOT NULL,

    book_id VARCHAR(50),

    category VARCHAR(50),

    borrowed_date DATE NOT NULL,

    expected_return_date DATE NOT NULL,

    returned_at TIMESTAMP WITH TIME ZONE,

    notes VARCHAR(500),

    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_return_date
        CHECK (expected_return_date >= borrowed_date)
);

-- 3. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_borrowing_staff
    ON public.borrowing_records(staff_id);

CREATE INDEX IF NOT EXISTS idx_borrowing_return_date
    ON public.borrowing_records(expected_return_date);

CREATE INDEX IF NOT EXISTS idx_borrowing_student
    ON public.borrowing_records(student_name);

CREATE INDEX IF NOT EXISTS idx_borrowing_book
    ON public.borrowing_records(book_title);

CREATE INDEX IF NOT EXISTS idx_borrowing_returned
    ON public.borrowing_records(returned_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.borrowing_records ENABLE ROW LEVEL SECURITY;

-- 5. Clean up any existing policies to allow idempotent execution
DROP POLICY IF EXISTS "Staff can view own records" ON public.borrowing_records;
DROP POLICY IF EXISTS "Staff can insert own records" ON public.borrowing_records;
DROP POLICY IF EXISTS "Staff can update own records" ON public.borrowing_records;
DROP POLICY IF EXISTS "Staff can delete own records" ON public.borrowing_records;

-- 6. Define Row Level Security Policies (Strict Data Isolation)
CREATE POLICY "Staff can view own records"
ON public.borrowing_records
FOR SELECT
USING (auth.uid() = staff_id);

CREATE POLICY "Staff can insert own records"
ON public.borrowing_records
FOR INSERT
WITH CHECK (auth.uid() = staff_id);

CREATE POLICY "Staff can update own records"
ON public.borrowing_records
FOR UPDATE
USING (auth.uid() = staff_id)
WITH CHECK (auth.uid() = staff_id);

CREATE POLICY "Staff can delete own records"
ON public.borrowing_records
FOR DELETE
USING (auth.uid() = staff_id);

-- 7. Trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_borrowing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_borrowing_updated_at ON public.borrowing_records;
CREATE TRIGGER trg_borrowing_updated_at
    BEFORE UPDATE ON public.borrowing_records
    FOR EACH ROW
    EXECUTE FUNCTION update_borrowing_updated_at();

-- 8. Refresh PostgREST API schema cache immediately
NOTIFY pgrst, 'reload schema';


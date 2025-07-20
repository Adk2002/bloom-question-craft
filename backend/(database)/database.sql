-- PostgreSQL Schema for Question Paper Generator
-- Custom Authentication System (No Clerk)

-- Create ENUM types first
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'PUBLIC');

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table with custom authentication fields
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hashed password
    name TEXT NOT NULL,
    role "Role" DEFAULT 'PUBLIC' NOT NULL,
    "isEmailVerified" BOOLEAN DEFAULT false NOT NULL,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    department TEXT,
    institution TEXT,
    "profileImage" TEXT,
    "phoneNumber" TEXT
);

-- Create Session table for managing user sessions
CREATE TABLE "Session" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "refreshToken" TEXT UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Subscription table
CREATE TABLE "Subscription" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    plan TEXT NOT NULL,
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Note table
CREATE TABLE "Note" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    "fileUrl" TEXT,
    "qdrantId" TEXT,
    "qdrantCollection" TEXT,
    "userId" TEXT NOT NULL,
    subject TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    chapter TEXT NOT NULL,
    board TEXT NOT NULL,
    language TEXT DEFAULT 'en' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    institution TEXT,
    department TEXT,
    "courseCode" TEXT,
    "isVectorized" BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create PreviousYearQuestion table
CREATE TABLE "PreviousYearQuestion" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    "fileUrl" TEXT,
    "qdrantId" TEXT,
    "qdrantCollection" TEXT,
    "userId" TEXT NOT NULL,
    subject TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    board TEXT NOT NULL,
    language TEXT DEFAULT 'en' NOT NULL,
    semester TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    institution TEXT,
    department TEXT,
    "courseCode" TEXT,
    "isVectorized" BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create UploadedFile table
CREATE TABLE "UploadedFile" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    processed BOOLEAN DEFAULT false NOT NULL,
    "isVectorized" BOOLEAN DEFAULT false NOT NULL,
    "qdrantIds" JSONB,
    "qdrantCollection" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    institution TEXT,
    department TEXT,
    "courseCode" TEXT,
    subject TEXT,
    "classLevel" TEXT,
    chapter TEXT,
    category TEXT,
    year INTEGER,
    "examType" TEXT,
    notes TEXT,
    FOREIGN KEY ("uploadedById") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create ChatHistory table
CREATE TABLE "ChatHistory" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    messages JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usedDocuments" JSONB,
    "generatedQuestions" JSONB,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create QuestionPaper table
CREATE TABLE "QuestionPaper" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    questions JSONB NOT NULL,
    "bloomStructure" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    institution TEXT,
    department TEXT,
    "courseCode" TEXT,
    FOREIGN KEY ("createdBy") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create TeacherPreference table
CREATE TABLE "TeacherPreference" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT UNIQUE NOT NULL,
    "promptText" TEXT,
    "quickPreferences" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create EmailVerification table for tracking email verification attempts
CREATE TABLE "EmailVerification" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isUsed" BOOLEAN DEFAULT false NOT NULL
);

-- Create PasswordReset table for tracking password reset attempts
CREATE TABLE "PasswordReset" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    token TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isUsed" BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create LoginAttempt table for security tracking
CREATE TABLE "LoginAttempt" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isSuccessful" BOOLEAN NOT NULL,
    "attemptedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "failureReason" TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_email_verification_token ON "User"("emailVerificationToken");
CREATE INDEX idx_user_password_reset_token ON "User"("passwordResetToken");
CREATE INDEX idx_user_last_login ON "User"("lastLoginAt");
CREATE INDEX idx_session_user_id ON "Session"("userId");
CREATE INDEX idx_session_token ON "Session"("sessionToken");
CREATE INDEX idx_session_refresh_token ON "Session"("refreshToken");
CREATE INDEX idx_session_expires_at ON "Session"("expiresAt");
CREATE INDEX idx_subscription_user_id ON "Subscription"("userId");
CREATE INDEX idx_note_user_id ON "Note"("userId");
CREATE INDEX idx_note_subject ON "Note"(subject);
CREATE INDEX idx_pyq_user_id ON "PreviousYearQuestion"("userId");
CREATE INDEX idx_pyq_subject ON "PreviousYearQuestion"(subject);
CREATE INDEX idx_pyq_year ON "PreviousYearQuestion"(year);
CREATE INDEX idx_uploaded_file_user_id ON "UploadedFile"("uploadedById");
CREATE INDEX idx_chat_history_user_id ON "ChatHistory"("userId");
CREATE INDEX idx_teacher_preference_user_id ON "TeacherPreference"("userId");
CREATE INDEX idx_email_verification_token ON "EmailVerification"(token);
CREATE INDEX idx_email_verification_expires ON "EmailVerification"("expiresAt");
CREATE INDEX idx_password_reset_token ON "PasswordReset"(token);
CREATE INDEX idx_password_reset_expires ON "PasswordReset"("expiresAt");
CREATE INDEX idx_login_attempt_email ON "LoginAttempt"(email);
CREATE INDEX idx_login_attempt_ip ON "LoginAttempt"("ipAddress");
CREATE INDEX idx_login_attempt_time ON "LoginAttempt"("attemptedAt");

-- Create triggers for automatic updatedAt timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON "Session"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_note_updated_at BEFORE UPDATE ON "Note"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pyq_updated_at BEFORE UPDATE ON "PreviousYearQuestion"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploaded_file_updated_at BEFORE UPDATE ON "UploadedFile"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_history_updated_at BEFORE UPDATE ON "ChatHistory"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_paper_updated_at BEFORE UPDATE ON "QuestionPaper"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_preference_updated_at BEFORE UPDATE ON "TeacherPreference"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM "Session" WHERE "expiresAt" < CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM "EmailVerification" WHERE "expiresAt" < CURRENT_TIMESTAMP;
    DELETE FROM "PasswordReset" WHERE "expiresAt" < CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';

-- Optional: Create a scheduled job to run cleanup functions
-- You can set this up with pg_cron extension or run it manually/via cron job
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('cleanup-expired-tokens', '0 3 * * *', 'SELECT cleanup_expired_tokens();');
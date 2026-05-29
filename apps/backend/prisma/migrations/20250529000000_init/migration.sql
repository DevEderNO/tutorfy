-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('TAREFA', 'MATERIAL', 'TRABALHO', 'OUTRO');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('MONTHLY', 'HOURLY');

-- CreateEnum
CREATE TYPE "EvolutionAiMode" AS ENUM ('AUTO', 'REVIEW');

-- CreateEnum
CREATE TYPE "LessonPlanAiMode" AS ENUM ('OFF', 'AUTO', 'DEMAND');

-- CreateEnum
CREATE TYPE "ClassSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELED', 'MISSED');

-- CreateEnum
CREATE TYPE "SubscriptionPeriod" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'SUPPORT');

-- CreateEnum
CREATE TYPE "PortalAccountType" AS ENUM ('STUDENT', 'GUARDIAN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "google_id" TEXT,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "evolution_ai_mode" "EvolutionAiMode" NOT NULL DEFAULT 'AUTO',
    "lesson_plan_ai_mode" "LessonPlanAiMode" NOT NULL DEFAULT 'OFF',
    "lesson_plan_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lesson_plan_session_count" INTEGER NOT NULL DEFAULT 3,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "cpf" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_students" (
    "id" TEXT NOT NULL,
    "guardian_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "relationship" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guardian_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "grade" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "responsible_name" TEXT,
    "responsible_phone" TEXT,
    "billing_type" "BillingType" NOT NULL DEFAULT 'MONTHLY',
    "monthly_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hourly_rate" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "cpf" TEXT,
    "email" TEXT,
    "birth_date" TIMESTAMP(3),
    "shift" TEXT,
    "due_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_level" TEXT,
    "strengths" TEXT,
    "areas_to_improve" TEXT,
    "goals" TEXT,
    "initial_observations" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_share_tokens" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_share_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" "ClassSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "content" TEXT,
    "homework" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_files" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_session_id" TEXT,
    "type" "FileType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "billing_type" "BillingType" NOT NULL DEFAULT 'MONTHLY',
    "class_hours" DOUBLE PRECISION,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_schedule_preferences" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_schedule_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_entries" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_session_id" TEXT,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evolution_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_entry_categories" (
    "entry_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "evolution_entry_categories_pkey" PRIMARY KEY ("entry_id","category_id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "max_students" INTEGER,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT false,
    "price_monthly" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price_annual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "period" "SubscriptionPeriod" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admin_role" "AdminRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "account_type" "PortalAccountType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "portal_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_student_links" (
    "id" TEXT NOT NULL,
    "guardian_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guardian_student_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_portal_links" (
    "id" TEXT NOT NULL,
    "portal_account_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_portal_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "config" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "guardians_user_id_idx" ON "guardians"("user_id");

-- CreateIndex
CREATE INDEX "guardian_students_guardian_id_idx" ON "guardian_students"("guardian_id");

-- CreateIndex
CREATE INDEX "guardian_students_student_id_idx" ON "guardian_students"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_students_guardian_id_student_id_key" ON "guardian_students"("guardian_id", "student_id");

-- CreateIndex
CREATE INDEX "students_user_id_idx" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_share_tokens_student_id_key" ON "student_share_tokens"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_share_tokens_token_key" ON "student_share_tokens"("token");

-- CreateIndex
CREATE INDEX "class_sessions_user_id_idx" ON "class_sessions"("user_id");

-- CreateIndex
CREATE INDEX "class_sessions_student_id_idx" ON "class_sessions"("student_id");

-- CreateIndex
CREATE INDEX "class_sessions_date_idx" ON "class_sessions"("date");

-- CreateIndex
CREATE INDEX "student_files_user_id_idx" ON "student_files"("user_id");

-- CreateIndex
CREATE INDEX "student_files_student_id_idx" ON "student_files"("student_id");

-- CreateIndex
CREATE INDEX "student_files_class_session_id_idx" ON "student_files"("class_session_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_student_id_idx" ON "payments"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_student_id_month_year_key" ON "payments"("student_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "student_schedule_preferences_student_id_idx" ON "student_schedule_preferences"("student_id");

-- CreateIndex
CREATE INDEX "skill_categories_user_id_idx" ON "skill_categories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_user_id_name_key" ON "skill_categories"("user_id", "name");

-- CreateIndex
CREATE INDEX "evolution_entries_student_id_idx" ON "evolution_entries"("student_id");

-- CreateIndex
CREATE INDEX "evolution_entries_class_session_id_idx" ON "evolution_entries"("class_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "portal_accounts_email_key" ON "portal_accounts"("email");

-- CreateIndex
CREATE INDEX "guardian_student_links_guardian_id_idx" ON "guardian_student_links"("guardian_id");

-- CreateIndex
CREATE INDEX "guardian_student_links_student_id_idx" ON "guardian_student_links"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_student_links_guardian_id_student_id_key" ON "guardian_student_links"("guardian_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_portal_links_portal_account_id_key" ON "student_portal_links"("portal_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_portal_links_student_id_key" ON "student_portal_links"("student_id");

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_students" ADD CONSTRAINT "guardian_students_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_students" ADD CONSTRAINT "guardian_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_share_tokens" ADD CONSTRAINT "student_share_tokens_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_files" ADD CONSTRAINT "student_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_files" ADD CONSTRAINT "student_files_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_files" ADD CONSTRAINT "student_files_class_session_id_fkey" FOREIGN KEY ("class_session_id") REFERENCES "class_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_schedule_preferences" ADD CONSTRAINT "student_schedule_preferences_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_entries" ADD CONSTRAINT "evolution_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_entries" ADD CONSTRAINT "evolution_entries_class_session_id_fkey" FOREIGN KEY ("class_session_id") REFERENCES "class_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_entry_categories" ADD CONSTRAINT "evolution_entry_categories_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "evolution_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_entry_categories" ADD CONSTRAINT "evolution_entry_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "skill_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "portal_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_portal_links" ADD CONSTRAINT "student_portal_links_portal_account_id_fkey" FOREIGN KEY ("portal_account_id") REFERENCES "portal_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_portal_links" ADD CONSTRAINT "student_portal_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


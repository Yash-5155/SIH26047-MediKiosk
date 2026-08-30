-- ============================================================
-- MediKiosk - SIH26047
-- Database Schema
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS medikiosk;

USE medikiosk;


-- ============================================================
-- 1. PATIENTS
-- ============================================================

CREATE TABLE patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(30),
    phone VARCHAR(20),

    preferred_language VARCHAR(50) NOT NULL DEFAULT 'English',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. DOCTORS
-- ============================================================

CREATE TABLE doctors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(50) NOT NULL DEFAULT 'doctor',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. INTAKE SESSIONS
-- ============================================================

CREATE TABLE intake_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    patient_id BIGINT UNSIGNED NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',

    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    CONSTRAINT fk_session_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    INDEX idx_session_patient (patient_id),
    INDEX idx_session_status (status)
);


-- ============================================================
-- 4. PATIENT RESPONSES
-- ============================================================

CREATE TABLE responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    session_id BIGINT UNSIGNED NOT NULL,

    question TEXT NOT NULL,
    answer TEXT,

    input_mode VARCHAR(20) NOT NULL DEFAULT 'TEXT',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_response_session
        FOREIGN KEY (session_id)
        REFERENCES intake_sessions(id)
        ON DELETE CASCADE,

    INDEX idx_response_session (session_id)
);


-- ============================================================
-- 5. MEDICAL DOCUMENTS
-- ============================================================

CREATE TABLE medical_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    patient_id BIGINT UNSIGNED NOT NULL,
    session_id BIGINT UNSIGNED NULL,

    document_type VARCHAR(50) NOT NULL DEFAULT 'OTHER',

    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,

    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_document_session
        FOREIGN KEY (session_id)
        REFERENCES intake_sessions(id)
        ON DELETE SET NULL,

    INDEX idx_document_patient (patient_id),
    INDEX idx_document_session (session_id)
);


-- ============================================================
-- 6. EXTRACTED FACTS
-- ============================================================

CREATE TABLE extracted_facts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    patient_id BIGINT UNSIGNED NOT NULL,
    document_id BIGINT UNSIGNED NULL,

    fact_type VARCHAR(100) NOT NULL,
    fact_value TEXT NOT NULL,

    confidence DECIMAL(5,4),

    source_text TEXT,

    verification_status VARCHAR(30)
        NOT NULL DEFAULT 'NEEDS_REVIEW',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fact_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_fact_document
        FOREIGN KEY (document_id)
        REFERENCES medical_documents(id)
        ON DELETE SET NULL,

    INDEX idx_fact_patient (patient_id),
    INDEX idx_fact_document (document_id),
    INDEX idx_fact_status (verification_status)
);


-- ============================================================
-- 7. CASE HISTORIES
-- ============================================================

CREATE TABLE case_histories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    session_id BIGINT UNSIGNED NOT NULL,

    chief_complaint TEXT,
    history_present_illness TEXT,

    past_medical_history TEXT,
    medication_history TEXT,
    allergies TEXT,

    family_history TEXT,
    lifestyle_history TEXT,

    ayush_history TEXT,

    investigations TEXT,
    previous_treatment TEXT,

    ai_summary TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_case_session
        FOREIGN KEY (session_id)
        REFERENCES intake_sessions(id)
        ON DELETE CASCADE,

    INDEX idx_case_session (session_id)
);


-- ============================================================
-- 8. TIMELINE EVENTS
-- ============================================================

CREATE TABLE timeline_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    patient_id BIGINT UNSIGNED NOT NULL,

    event_date DATE,

    event_type VARCHAR(50) NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    source_document_id BIGINT UNSIGNED NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_timeline_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_timeline_document
        FOREIGN KEY (source_document_id)
        REFERENCES medical_documents(id)
        ON DELETE SET NULL,

    INDEX idx_timeline_patient (patient_id),
    INDEX idx_timeline_date (event_date)
);


-- ============================================================
-- 9. DOCTOR REVIEWS
-- ============================================================

CREATE TABLE doctor_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    case_id BIGINT UNSIGNED NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    comments TEXT,

    reviewed_at TIMESTAMP NULL,

    CONSTRAINT fk_review_case
        FOREIGN KEY (case_id)
        REFERENCES case_histories(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    INDEX idx_review_case (case_id),
    INDEX idx_review_doctor (doctor_id),
    INDEX idx_review_status (status)
);

-- ============================================================
-- 10. Patient Identifications
-- ============================================================

CREATE TABLE patient_identifiers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    patient_id BIGINT UNSIGNED NOT NULL,

    identifier_type VARCHAR(20) NOT NULL,
    identifier_hash VARCHAR(255) NOT NULL,

    verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,

    CONSTRAINT fk_identifier_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_identifier_hash (identifier_hash),
    INDEX idx_identifier_patient (patient_id),
    INDEX idx_identifier_type (identifier_type)
);

-- ============================================================
-- 11. Questions
-- ============================================================

CREATE TABLE questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    question_text TEXT NOT NULL,

    question_key VARCHAR(100) NOT NULL UNIQUE,

    question_type VARCHAR(30) NOT NULL,

    is_required BOOLEAN NOT NULL DEFAULT FALSE,

    display_order INT NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_question_order (display_order),
    INDEX idx_question_active (is_active)
);

CREATE TABLE question_options (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    question_id BIGINT UNSIGNED NOT NULL,

    option_value VARCHAR(100) NOT NULL,

    option_label VARCHAR(255) NOT NULL,

    display_order INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_option_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE,

    INDEX idx_option_question (question_id)
);

CREATE TABLE intake_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    session_id BIGINT UNSIGNED NOT NULL,

    question_id BIGINT UNSIGNED NOT NULL,

    answer_text TEXT NULL,

    input_mode VARCHAR(30) NOT NULL DEFAULT 'TEXT',

    answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_intake_response_session
        FOREIGN KEY (session_id)
        REFERENCES intake_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_intake_response_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_session_question (
        session_id,
        question_id
    ),

    INDEX idx_response_session (session_id),
    INDEX idx_response_question (question_id)
);
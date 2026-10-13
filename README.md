# MediKiosk — Intelligent Patient Case-Taking Software

**An AI-assisted patient intake and clinical information structuring system**

MediKiosk is a healthcare technology project developed by **Team TriageX** for **Smart India Hackathon 2026 (Problem Statement 26047 — Patient Case-Taking Software)** and further developed for **SRIJAN 2K26**, the inter-college hackathon at Shri Ramswaroop Memorial College of Engineering and Management, Lucknow.

The project aims to streamline the pre-consultation process by collecting patient information through a guided digital interface, processing medical documents, and organizing relevant clinical information into a structured case for doctor review.

> **MediKiosk does not replace doctors or provide autonomous diagnoses.** Its purpose is to support clinical information collection and organization while keeping verification and clinical decision-making with healthcare professionals.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Configuration](#configuration)
- [Current Status](#current-status)
- [Security and Privacy](#security-and-privacy)
- [Future Scope](#future-scope)
- [Team](#team)
- [Acknowledgements](#acknowledgements)

---

## Problem Statement

Traditional patient intake often involves repetitive questioning, manual form filling, and reviewing medical documents separately. Patient information may be incomplete, scattered across multiple documents, or difficult to review quickly before consultation.

These challenges can increase administrative workload and make pre-consultation information gathering less efficient.

MediKiosk aims to address these challenges by providing a unified digital workflow for patient intake, document processing, clinical information organization, and doctor-side verification.

## Proposed Solution

MediKiosk provides a self-service, kiosk-oriented patient intake experience that combines:

- Guided digital patient questionnaires.
- Voice and touch-based interaction.
- Medical document upload and OCR-based text extraction.
- AI-assisted or rule-based clinical information extraction, depending on the configured provider.
- Structured clinical case generation.
- A doctor-facing interface for reviewing and verifying patient information.

The objective is to provide healthcare professionals with better-organized information before consultation and reduce repetitive intake work.

## Key Features

### 1. Guided Patient Intake
Collects patient details and symptom-related information through a structured questionnaire.

### 2. Voice and Touch Interaction
Supports a patient-facing interface designed for accessible interaction. Voice functionality depends on browser support and the configured interaction flow.

### 3. Medical Document Processing
Processes supported medical documents using OCR tools to extract text for further review and structuring.

### 4. Clinical Information Extraction
Organizes relevant information such as symptoms, duration, medical history, medications, and allergies into structured fields, depending on the available input and extraction implementation.

### 5. Doctor Dashboard
Provides a doctor-side workflow for viewing patient sessions and reviewing structured case information.

### 6. Doctor Verification
Keeps healthcare professionals in control of reviewing, correcting, and validating extracted information before relying on it clinically.

### 7. Modular Architecture
Separates the frontend, backend, database models, API endpoints, and extraction services to support continued development.

---

## How It Works

```text
Patient
   |
   v
Patient Intake Interface
(Questionnaire / Voice / Touch)
   |
   v
FastAPI Backend
(Session Management and Validation)
   |
   +--------------------------+
   |                          |
   v                          v
Questionnaire Responses    Medical Documents
                              |
                              v
                     OCR Text Extraction
                     (Tesseract + Poppler)
   |                          |
   +------------+-------------+
                |
                v
     Clinical Information Extraction
       (Configured AI Provider)
                |
                v
       Structured Clinical Case
                |
                v
          MySQL Database
                |
                v
         Doctor Dashboard
                |
                v
       Review and Verification
```

*The exact execution path depends on the configured backend provider and the features currently integrated into the running application.*

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI |
| Database | MySQL |
| ORM | SQLAlchemy |
| Document OCR | Tesseract OCR, Poppler |
| API Communication | REST APIs |
| Voice Interaction | Browser Web Speech API, where supported |
| Version Control | Git, GitHub |

### AI and Information Extraction

The backend supports a configurable extraction-provider architecture. The current default configuration uses a mock provider and a model identifier of `local-rule-based-v1`.

This configuration should not be interpreted as evidence that a specific large language model is installed or running. The extraction behavior depends on the implementation and provider configured in the backend.

---

## System Architecture

MediKiosk follows a modular client-server architecture.

**Frontend**
- Presents the patient intake interface.
- Collects questionnaire responses and patient inputs.
- Provides document-upload and doctor-facing screens.
- Communicates with backend APIs.

**Backend**
- Manages patient intake sessions and questionnaire responses.
- Handles API requests and data validation.
- Coordinates document processing and clinical information extraction.
- Exposes endpoints for doctor-side workflows.

**Database**
- Stores application data according to the configured database schema.
- Uses SQLAlchemy models to represent backend entities.

**Document Processing**
- Uses Tesseract OCR and Poppler for supported document-processing workflows.
- Produces extracted text for subsequent review and information structuring.

**Doctor Interface**
- Presents available patient sessions and case information.
- Supports review of generated clinical information.

---

## Project Structure

The repository follows a frontend-backend organization. The exact files may change as development continues.

```text
MediKiosk/
├── backend/
│   └── app/
│       ├── api/
│       ├── models/
│       ├── schemas/
│       ├── services/
│       └── main.py
├── database/
├── docs/
├── frontend/
├── tests/
├── .gitignore
└── README.md
```

- `backend/` — FastAPI application, API endpoints, models, schemas, and services.
- `database/` — Database-related files and schema definitions.
- `docs/` — Project documentation and supporting material.
- `frontend/` — React/Vite application.
- `tests/` — Automated tests and testing resources.
- `README.md` — Project overview and setup instructions.

Refer to the actual repository for the latest file organization.

---

## Prerequisites

Install the following before running the project:

- Python 3.10 or a compatible version supported by the backend dependencies.
- Node.js and npm.
- MySQL Server.
- Git.
- Tesseract OCR.
- Poppler utilities for the document-processing workflow.

Python and Node.js versions should match the versions supported by the project's dependency files.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yash-5155/SIH26047-MediKiosk.git
cd SIH26047-MediKiosk
```

### 2. Set Up the Backend

Open a terminal in the project root.

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows:**

```powershell
.venv\Scripts\Activate.ps1
```

If you use Command Prompt:

```bat
.venv\Scripts\activate.bat
```

**Linux/macOS:**

```bash
source .venv/bin/activate
```

Install the backend dependencies using the dependency file provided by the repository. If the repository contains `requirements.txt`, run:

```bash
pip install -r requirements.txt
```

Configure the backend environment variables as described in the configuration section.

Start the application using the project's FastAPI entry point. For example, if the application instance is exposed as `app` in `app/main.py`:

```bash
uvicorn app.main:app --reload
```

The local backend will typically be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is typically available at:

```text
http://127.0.0.1:8000/docs
```

### 3. Set Up the Database

1. Start MySQL Server.
2. Create the project database.
3. Create a database user with only the permissions required by the application.
4. Configure the database connection in the backend environment.
5. Apply the project's SQL schema or supported migration procedure.

Use the schema and configuration expected by the actual backend. Do not commit database passwords or other credentials to GitHub.

### 4. Set Up the Frontend

Open a separate terminal.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal. It is commonly:

```text
http://localhost:5173
```

If the frontend uses a different port or API proxy configuration, follow the repository's Vite configuration.

### 5. Configure OCR

Install Tesseract OCR and Poppler on your system.

Ensure their executable locations are accessible to the backend process through the system `PATH` or the application's supported configuration.

Verify that both tools are available before testing document processing.

**Note:** These instructions describe the general setup. Exact dependency files, environment-variable names, database initialization commands, and entry points must match the current repository.

---

## Configuration

The backend uses environment-based configuration for settings such as the AI provider, model identifier, and database connection.

Example settings may include:

```env
AI_PROVIDER=mock
AI_MODEL=local-rule-based-v1
```

These values illustrate the current default extraction configuration. Use the actual configuration names defined by the backend.

Additional database and application settings may be required. Keep secrets in an untracked `.env` file or another secure configuration mechanism.

**Never commit:**
- API keys or access tokens.
- Database passwords.
- Production credentials.
- Real patient records or identifiable medical documents.

---

## Current Status

MediKiosk is an evolving prototype developed for student hackathons.

The project is intended to demonstrate a digital patient intake workflow, document text extraction, clinical information structuring, and doctor-side review.

The level of integration and reliability may vary across individual modules. Some extraction paths may use mock or rule-based implementations rather than a deployed clinical LLM.

The project is not a certified medical device and has not been established as suitable for independent clinical decision-making.

---

## Security and Privacy

Healthcare information is sensitive and requires appropriate safeguards.

The project should be developed and evaluated with the following principles:

- Collect only the information necessary for the intended workflow.
- Obtain appropriate consent before collecting or processing patient information.
- Restrict access to patient sessions and clinical information.
- Protect credentials and database connections.
- Avoid using identifiable patient data in public demonstrations.
- Verify extracted information against its original source.
- Require healthcare professionals to review clinical information.
- Establish suitable retention and deletion policies before any real-world deployment.

A production deployment would require additional security testing, privacy controls, access management, auditability, and compliance review.

---

## Future Scope

Potential future improvements include:

- Integration with validated local language models.
- Expanded multilingual patient interaction.
- More robust OCR and document-layout processing.
- Improved source-linked clinical information extraction.
- Patient history timelines.
- Explainable red-flag highlighting for clinician review.
- Stronger role-based access control and audit trails.
- Integration with hospital information systems.
- Exploration of ABDM and FHIR-compatible interoperability.
- Improved accessibility and kiosk deployment support.

These are proposed enhancements, not claims that all features are currently implemented.

---

## Team

**Team TriageX**

Developed as a student innovation project for healthcare-focused digital transformation.

**Project:** MediKiosk — Intelligent Patient Case-Taking Software  
---

## Acknowledgements

We acknowledge the open-source communities behind React, Vite, FastAPI, Python, MySQL, SQLAlchemy, Tesseract OCR, and Poppler.

Their tools support the development of this prototype.

---

## Disclaimer

MediKiosk is an educational and prototype project. It is intended to assist with patient information collection and organization, not to diagnose diseases, prescribe treatment, or replace professional medical judgment.

All extracted information must be reviewed by an appropriately qualified healthcare professional before clinical use.

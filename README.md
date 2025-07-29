# 📘 BloomQGen – AI-Powered Question Paper Generator

> 🚀 A smart RAG-based system that leverages **Bloom's Taxonomy** to automatically generate question papers using teacher-uploaded notes and previous year papers. Designed to learn each teacher’s unique paper-setting style and produce balanced, intelligent assessments.

---

## 🧠 What is BloomQGen?

**BloomQGen** is an AI-enhanced question paper generation system that uses a **Retrieval-Augmented Generation (RAG)** architecture. It analyzes and stores the question pattern of individual teachers, allowing it to intelligently generate new question papers aligned with **Bloom’s Taxonomy levels** (Remember, Understand, Apply, Analyze, Evaluate, Create).

Teachers simply upload their:
- 📄 Class Notes
- 📚 Previous Year Question Papers

The system then:
1. Learns the teacher's style
2. Retrieves and processes relevant context
3. Generates high-quality, structured question papers using **Google Gemini AI**

---

## 🛠️ Tech Stack

| Category              | Technologies Used |
|----------------------|-------------------|
| 🧠 AI                | Google Generative AI (Gemini), LangChain |
| 🔁 Background Jobs    | BullMQ, Redis |
| 💾 Storage            | Qdrant DB (Vector DB), PostgreSQL (PgAdmin) |
| 🛠 Backend Framework  | Express.js, Node.js |
| 🌐 Frontend Framework | React.js |
| 📦 Containerization   | Docker |
| 🔐 Auth & Security    | JWT Token, UUID |
| 📤 File Upload        | Multer |

---

## 🧩 Features

- ✅ **Pattern Learning** – Learns the structure and difficulty level from previous question sets.
- ✅ **RAG Architecture** – Combines semantic search + generative AI for factual and context-aware questions.
- ✅ **Bloom’s Taxonomy Alignment** – Questions generated across all cognitive levels.
- ✅ **Multi-Source Ingestion** – Accepts both typed notes and previous papers for better training.
- ✅ **Scalable Job Queues** – Powered by **BullMQ** and **Redis** for smooth async processing.
- ✅ **Secure & Role-based Access** – Teachers authenticated using **JWT** with UUID identifiers.
- ✅ **Containerized & Scalable** – Easily deployable using **Docker**.

---

## 🔄 System Workflow

1. **Upload Notes/PYQs** ➜ via frontend (React + Multer)
2. **Store Vector Embeddings** ➜ in Qdrant DB using LangChain
3. **Job Queuing & Processing** ➜ BullMQ with Redis backend
4. **Generate Questions** ➜ RAG + Gemini AI via LangChain
5. **Save Patterns & Output** ➜ PostgreSQL for metadata and teacher preferences

---

## 📦 Getting Started

### Prerequisites
- Node.js
- Docker & Docker Compose
- Redis Server
- PgAdmin/PostgreSQL setup
- Qdrant (or use Qdrant Cloud)
- Google Generative AI API Key

### Start The WebAPP

- Front-end:- npm run dev
- Docker:- 
    1. Start the Qdrant image
    2. Start the Redis server image
- Backend:-
    1. cd backend 
    2. nodemon server.js
- Database:- Start the database server.

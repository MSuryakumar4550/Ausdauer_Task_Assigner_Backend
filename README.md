# Ausdauer Task Manager - Backend 🚀

An enterprise-grade, real-time task management backend built with high-concurrency and security-first principles. This system demonstrates advanced MERN (MySQL variant) architecture, event-driven synchronization, and stateless security protocols.

---

## 🚀 Tech Stack
* **Backend Runtime:** Node.js (Express.js)
* **Database:** MySQL (ACID-compliant RDBMS)
* **Authentication:** JWT (Stateless)
* **Password Security:** bcryptjs (Salting & Hashing)
* **Real-Time Communication:** Socket.io (WebSockets)
* **Email Automation:** Nodemailer (SMTP)
* **Architecture Style:** REST + Event-Driven Hybrid

---

## 🔐 1. Security Gateway (Multi-Layer Authentication)
This backend implements a stateless, multi-layer security gateway designed for horizontal scalability.

### 🔑 JWT-Based Stateless Authentication
* **Process:** On successful login, the server signs a cryptographically secure JWT token.
* **Authorization:** The client attaches this token to the `Authorization` header for every request.
* **Benefit:** No server-side sessions are required, making the system ready for cloud-native deployment.

### 🔒 Password Hashing with bcrypt
* **Logic:** Passwords undergo salting and one-way cryptographic hashing via `bcryptjs`.
* **Integrity:** Even in the event of a database compromise, user credentials remain unreadable and mathematically secure.

### 🚨 Live-Kill Authorization Middleware
While standard projects validate tokens once, this backend validates **on every protected request**:
1. **Token Validity:** Ensures the signature is authentic.
2. **User Existence:** Verifies the user still exists in the DB.
3. **`is_active` Flag:** Performs a real-time check. If an employee is revoked by the Chairperson, the backend returns a `403 Forbidden` immediately, terminating access in real-time.

---

## ⚡ 2. Real-Time Engine (WebSocket Architecture)
To eliminate redundant HTTP overhead and the lag of polling-based systems, this backend uses event-driven communication.

### 🔁 Socket.io Integration
* Establishes a persistent, bidirectional WebSocket connection.
* Allows the server to "push" updates to clients instantly.

### 📡 refresh_data Broadcast Pattern
Instead of transmitting bulky data packets, the backend emits a lightweight `refresh_data` signal when:
* A task status is updated.
* A user's access is revoked.
**Impact:** Frontend clients receive the signal and trigger a targeted API fetch, ensuring zero data redundancy and perfect state synchronization across all connected users.

---

## 📧 3. Identity & Verification Workflow (SMTP Automation)
A production-aligned verification system for secure profile management.

### 🔢 Cryptographic OTP Generation
* Generates random 6-digit OTPs stored in a `reset_token` column.
* Used for secure password resets and high-privilege profile changes.

### ✉️ HTML Email Templates (Nodemailer)
* Sends professional, dark-themed HTML emails to match the application brand.
* Mimics corporate identity standards used by Microsoft and Slack.

### 🧯 Fault-Tolerant Developer Fallback
* **Resilience:** If SMTP credentials fail during local development, the backend catches the error and logs the OTP to the terminal.
* **Benefit:** Ensures developer productivity is never stalled by external network or credential issues.

---

## 🗄️ 4. Data Persistence & Integrity (MySQL)
Built for strict data consistency using Relational Database Management principles.

### 🧱 ACID Compliance
* Guarantees that every write operation is Atomic.
* If a server failure occurs mid-update, the transaction rolls back, preventing data corruption.

### 🧾 Soft Deletion with `is_active`
* **Auditability:** No destructive `DELETE` queries are used.
* **Logic:** Users are disabled via the `is_active` flag, preserving task history for corporate audits and performance reviews.

### 🧩 Explicit Column Mapping
* Follows Amazon-style database safety practices by explicitly naming columns in all SQL queries.
* Prevents system failure during future schema migrations or additions.

---

## 🧠 Why This Backend Is Dream-Company Ready
* **Scalability:** Stateless JWT and WebSocket broadcasting allow for high concurrency.
* **Security-First:** Live authorization checks and immediate access revocation are standard in enterprise software.
* **Engineering Maturity:** Features audit-safe data modeling and failure-aware workflows.

---

## 📂 Repository Purpose
This repository is designed to demonstrate **System Design** and **Architectural Thinking**, moving beyond basic CRUD logic to solve real-world synchronization and security challenges.

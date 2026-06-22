<div align="center">

# Qalbify 💜
  
**An AI-Powered Emotional Support & Quranic Wisdom Platform**

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

</div>

---

## 📖 About The Project

Qalbify is a unified platform designed to provide empathetic, AI-driven emotional support integrated with infallible Quranic wisdom. It listens without judgment, understands emotional nuances in real-time using deep sentiment analysis, and shares healing wisdom in a private, secure environment.

### ✨ Key Features
- **🧠 Deep Sentiment Analysis**: Real-time RoBERTa tracking to understand nuanced emotional states.
- **📖 Infallible Wisdom**: Strict Uthmani script validation ensures zero hallucinations in sacred text.
- **🔒 Soulful Privacy**: End-to-end anonymity protected by role-based architecture.
- **📊 Admin Telemetry**: A comprehensive dashboard for administrators to monitor platform health, user progress, and safety escalations.

---

## 🏗️ Architecture & Project Structure

This repository contains three core systems:

| Directory | Component | Tech Stack | Description |
| :--- | :--- | :--- | :--- |
| **`/`** *(Root)* | **Mobile Companion** | React Native, Expo | The cross-platform mobile application used by end-users. |
| **`/backend`** | **Core API Server** | Node.js, Express | Handles AI integrations, database logic, and API routes. |
| **`/admin-panel`** | **Operations Hub** | React, Vite | The web dashboard for platform administrators. |

---

## 🚀 Getting Started

### Prerequisites
Before running the Qalbify ecosystem, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* A running MongoDB database (local or Atlas)
* A properly configured `.env` file (containing your OpenAI, Hugging Face, AssemblyAI, and MongoDB URIs).

---

### 1️⃣ Start the Backend Server
The central brain of Qalbify. Must be running for the mobile app and admin panel to function.

```bash
cd backend
npm install
npm run dev
```
> **Note:** The server will start on `http://localhost:5001` by default.

---

### 2️⃣ Start the Admin Portal (Web)
The web interface for monitoring platform telemetry.

```bash
cd admin-panel
npm install
npm run dev
```
> **Access:** Open the provided local URL (usually `http://localhost:5173`) in your browser.

#### 🔐 Default Administrator Access
To access the dashboard, use the pre-configured credentials:
* **Email:** `admin@qalbify.com`
* **Password:** `admin123`

---

### 3️⃣ Start the Mobile Application (Expo)
The front-facing mobile app for users.

```bash
# Make sure you are in the project root directory
npm install
npx expo start
```
> **Access:** Scan the QR code in the terminal with the **Expo Go** app on your physical device, or press `a` to open in an Android Emulator, or `i` for an iOS Simulator.

---

<div align="center">
  <i>"Your heart deserves a caring companion."</i><br>
  © 2026 Qalbify Operations.
</div>

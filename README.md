# Behavioural Interview Simulator Agent

A React-based web application that simulates behavioural interviews using an AI agent. It provides real-time feedback on your answers based on the STAR method, clarity, and completeness.

## Features

- **Interactive Chat Interface**: Realistic conversation flow with an AI interviewer.
- **Rubric-Based Scoring**: Instant feedback on Clarity, Structure (STAR), and Completeness.
- **Conversation Memory**: Tracks your history within the session.
- **Improvement Suggestions**: Actionable advice to improve your answers.

## Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to `http://localhost:5173`.

## Project Structure

- `src/pages/HomePage.jsx`: Landing page.
- `src/pages/SimulatorPage.jsx`: main simulator logic and UI.
- `src/components`: (Integrated into pages for speed, but can be extracted).

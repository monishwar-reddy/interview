# LoanPulse AI 🏦

**LoanPulse AI** is an intelligent, secure, and privacy-focused loan monitoring dashboard designed to help lenders and analysts assess risk locally.

Built with a **zero-server architecture**, all data processing happens directly in your browser. Sensitive loan agreements and financial data never leave your device.

Try it out:

## 🚀 Live Demo
🔗 https://whimsical-croquembouche-0cbbdd.netlify.app


## 🚀 Key Features

*   **🤖 AI Analysis Engine**: Powered by Google Gemini 1.5, instantly extract covenant terms and analyze risks from PDF credit agreements.
*   **📊 Dynamic Dashboard**: Visual Covenant Matrix, real-time risk distribution charts, and historical tracking of loan performance.
*   **📉 Stress Testing**: Simulate economic shocks (e.g., Revenue Drops, Interest Rate Hikes) to predict DSCR impact and covenant breaches.
*   **🔒 Bank-Grade Privacy**: 100% Client-side processing. Your documents and data are never stored on external servers.
*   **📄 Smart Reporting**: Generate instant PDF reports for portfolio reviews and compliance trails.

## � How It Works

1.  **Dashboard**: Overview of your current portfolio health. Upload an existing analysis PDF or generate random sample data to visualize risk distribution.
2.  **Analysis Engine**:
    *   Upload a Credit Agreement (PDF).
    *   The AI scans the document for financial covenants (e.g., Max Leverage, Min Interest Coverage).
    *   Chat with the AI to ask specific questions like *"What is the cure period for a breach?"*
3.  **Stress Test**:
    *   Use sliders to simulate market conditions (e.g., 15% Revenue Drop).
    *   The AI predicts the impact on your specific loan metrics and offers mitigation strategies.

## 📂 Project Structure

```bash
LoanPulse-AI/
├── index.html          # Login & Authentication Portal
├── dashboard.html      # Main Portfolio Matrix & Charts
├── analysis.html       # AI Document Analysis & Chat
├── stress.html         # Economic Shock Simulation
├── app.js              # Core Application Logic
├── style_3d.css        # Glassmorphism UI Styles
├── env.js              # API Configuration (Local only)
└── README.md           # Project Documentation
```

## �🛠️ Tech Stack

*   **Frontend**: HTML5, Vanilla JavaScript, CSS3 (3D Glassmorphism Design)
*   **AI**: Google Gemini API (Flash 1.5 Model)
*   **Visualization**: Chart.js for dynamic risk charts
*   **PDF Processing**: PDF.js for client-side document reading

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/monishwar-reddy/LoanPulse-AI.git
    ```
2.  **Navigate to the project folder:**
    ```bash
    cd LoanPulse-AI
    ```
3.  **Configure API Key:**
    *   Rename `env.example.js` to `env.js`.
    *   Open `env.js` and paste your Google Gemini API Key.
    ```javascript
    window.ENV = {
        API_KEY: 'YOUR_GEMINI_API_KEY'
    };
    ```
4.  **Run the App:**
    *   Simply open `index.html` in your web browser. No server installation required!

## 🔮 Future Roadmap

*   [ ] Integration with Excel for bulk data import.
*   [ ] Multi-user session management via Supabase.
*   [ ] Export reports to PowerPoint (.pptx).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Created by Monishwar Reddy*

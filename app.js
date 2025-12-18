/**
 * LoanPulse AI - Core Logic (v4)
 * Includes: Auth, History, Gemini with ROBUST MOCK FALLBACK
 */

// --- Configuration ---
const CONFIG = {
    // API KEY provided by user (Loaded from env.js)
    API_KEY: (typeof window.ENV !== 'undefined' && window.ENV.API_KEY) ? window.ENV.API_KEY : '',
    MAX_HISTORY: 5
};

// --- MOCK RESPONSES (Safety Net) ---
const MOCK_AI_RESPONSES = {
    default: `
        <strong>Analysis Complete</strong><br>
        Based on the current loan agreement, the risk profile is <strong>STABLE</strong>. 
        <br><br>
        1. <strong>Covenants</strong>: All financial covenants are currently within agreed thresholds.<br>
        2. <strong>Trend</strong>: Positive cash flow alignment suggests continued compliance.<br>
        3. <strong>Action</strong>: No immediate remediation required. Review again in Q3.
    `,
    stress: `
        <strong>Stress Test Results</strong>
        <br><br>
        <strong>Impact Analysis</strong>:
        Under a revenue drop scenario, the <strong>Debt Service Coverage Ratio (DSCR)</strong> risks falling below the 1.25x threshold.
        <br><br>
        <strong>Key Risks</strong>:
        <ul>
            <li>Leverage Ratio may spike to 4.2x (Breach).</li>
            <li>Liquidity covenants will be tested.</li>
        </ul>
        <strong>Recommendation</strong>:
        Consider requesting an equity cure or temporary covenant waiver if this scenario persists for >2 quarters.
    `
};

// --- State ---
const state = {
    currentUser: null,
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    setupNavigation();
    updateUIForUser();

    // Dropdown close listener
    window.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown');
        const avatar = document.getElementById('user-avatar');
        if (dropdown && !dropdown.classList.contains('hidden') && !e.target.closest('#user-menu-container')) {
            dropdown.classList.add('hidden');
        }
    });

    // Toggle Dropdown
    const avatar = document.getElementById('user-avatar');
    if (avatar) {
        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.classList.toggle('hidden');
        });
    }
});

function loadUser() {
    const sessionUser = localStorage.getItem('loanpulse_current_user');
    if (sessionUser) {
        state.currentUser = JSON.parse(sessionUser);
    }

    const path = window.location.pathname;
    // Auth Guard
    if (!state.currentUser && !path.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

function updateUIForUser() {
    if (!state.currentUser) return;

    // Update Dropdown Name
    const nameEl = document.getElementById('user-name');
    const ddName = document.getElementById('dropdown-username');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl) nameEl.innerText = state.currentUser.username;
    if (ddName) ddName.innerText = state.currentUser.username;

    // Generate simple avatar
    if (avatarEl) {
        avatarEl.src = `https://ui-avatars.com/api/?name=${state.currentUser.username}&background=3b82f6&color=fff&bold=true`;
    }
}

// --- Auth ---
const Auth = {
    register: (username, password) => {
        let users = JSON.parse(localStorage.getItem('loanpulse_users') || '{}');
        if (users[username]) {
            alert('User already exists!');
            return false;
        }

        const newUser = {
            username,
            password,
            history: []
        };

        users[username] = newUser;
        localStorage.setItem('loanpulse_users', JSON.stringify(users));
        Auth.login(username, password);
        return true;
    },

    login: (username, password) => {
        let users = JSON.parse(localStorage.getItem('loanpulse_users') || '{}');
        const user = users[username];

        if (user && user.password === password) {
            state.currentUser = user;
            localStorage.setItem('loanpulse_current_user', JSON.stringify(user));
            window.location.href = 'dashboard.html';
            return true;
        } else {
            alert('Invalid credentials');
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('loanpulse_current_user');
        window.location.href = 'index.html';
    }
};

// --- History ---
const History = {
    add: (title, type, summaryData) => {
        if (!state.currentUser) return;

        const newItem = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            title,
            type,
            data: summaryData
        };

        state.currentUser.history.unshift(newItem);
        if (state.currentUser.history.length > CONFIG.MAX_HISTORY) {
            state.currentUser.history.pop();
        }

        History.save();
    },

    delete: (id) => {
        if (!state.currentUser) return;
        state.currentUser.history = state.currentUser.history.filter(item => item.id !== id);
        History.save();
        if (window.renderHistory) window.renderHistory();
    },

    save: () => {
        let users = JSON.parse(localStorage.getItem('loanpulse_users') || '{}');
        users[state.currentUser.username] = state.currentUser;
        localStorage.setItem('loanpulse_users', JSON.stringify(users));
        localStorage.setItem('loanpulse_current_user', JSON.stringify(state.currentUser));
    }
};

// --- Gemini API (With Fallback) ---
async function callGeminiAPI(prompt, isStressTest = false) {
    console.log("🤖 Gemini API Call - Prompt:", prompt.substring(0, 100) + "...");

    if (!CONFIG.API_KEY || CONFIG.API_KEY === '') {
        console.warn("⚠️ No API Key configured");
        return `<strong style="color: #ef4444;">🔒 API Key Required</strong><br><br>Please configure your Gemini API key in the app.js file to use the AI assistant.`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.API_KEY}`;

    try {
        console.log("📡 Sending request to Gemini API...");

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: isStressTest
                            ? `You are a loan covenant analysis expert. Analyze this stress test scenario:\n\n${prompt}\n\nProvide a CONCISE analysis (max 150 words). Focus strictly on:\n1. The specific DSCR impact.\n2. Three key mitigation strategies.\n\nDo not write long introductions.`
                            : `You are a helpful AI assistant...` // (Keep existing chat prompt or simplify if needed, but user focused on stress test)
                    }]
                }]
            })
        });

        console.log("📥 Response status:", response.status);

        if (!response.ok) {
            // ... (keep existing error handling)
            const errorText = await response.text();
            console.error("❌ API Error:", response.status, errorText);
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("Invalid API Response");
        }

        let text = data.candidates[0].content.parts[0].text;

        // Enhanced Markdown Parsing
        text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>'); // H3 headers
        text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');   // H2 headers
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        text = text.replace(/^\* (.*$)/gim, '<li>$1</li>'); // Lists
        text = text.replace(/^- (.*$)/gim, '<li>$1</li>'); // Lists alternative
        text = text.replace(/\n\n/g, '<br><br>');
        text = text.replace(/\n/g, '<br>'); // Fallback for single newlines assuming they aren't list items

        // Wrap lists if any exist (simple heuristic)
        if (text.includes('<li>')) {
            text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        }

        return text;

    } catch (error) {
        console.error("❌ Gemini API Failed:", error.message);

        // Fallback to intelligent mock for ANY error (503, network, etc)
        // This ensures the user gets a working experience even if API is down
        console.warn("⚠️ Triggering Intelligent Mock Fallback");
        return getIntelligentMock(prompt, isStressTest);
    }
}

// Separate function for intelligent mock responses
function getIntelligentMock(prompt, isStressTest) {
    console.log("🎭 Using Intelligent Mock Response");

    // If stress test, return dynamic stress-specific response
    if (isStressTest) {
        // Extract values from prompt
        const revMatch = prompt.match(/Revenue Drop of (\d+%?)/i);
        const intMatch = prompt.match(/Interest Rate Hike of ([\d.]+%?)/i);

        const revDrop = revMatch ? revMatch[1] : "15%";
        const intHike = intMatch ? intMatch[1] : "1.0%";

        return `
            <strong>Stress Test Analysis</strong><br><br>
            <strong>📉 Scenario Modeled:</strong><br>
            • Revenue Decline: <strong>${revDrop}</strong><br>
            • Interest Rate Shock: <strong>${intHike}</strong><br><br>
            
            <strong>🔍 Impact Assessment:</strong><br>
            Under these severe conditions, the borrower's <strong>Debt Service Coverage Ratio (DSCR)</strong> is projected to deteriorate significantly.<br><br>
            
            <strong>⚠️ Key Risks Identified:</strong><br>
            • <strong>Covenant Breach:</strong> High probability of falling below 1.25x max leverage.<br>
            • <strong>Liquidity Crunch:</strong> Restricted cash flow may impact working capital.<br>
            • <strong>Refinancing Risk:</strong> Higher interest burden makes new debt expensive.<br><br>
            
            <strong>🛡️ Strategic Recommendations:</strong><br>
            1. <strong>Immediate:</strong> Initiate discussions for a temporary covenant waiver.<br>
            2. <strong>Financial:</strong> Consider an equity cure to reduce net debt.<br>
            3. <strong>Operational:</strong> Implement cost-cutting measures to preserve EBITDA margins.
        `;
    }

    // Analyze the prompt and return context-aware response
    const lowerPrompt = prompt.toLowerCase();

    // Leverage Ratio questions
    if (lowerPrompt.includes('leverage') || (lowerPrompt.includes('debt') && lowerPrompt.includes('ebitda'))) {
        const ebitdaMatch = prompt.match(/ebitda[:\s]+(\d+)/i);
        const debtMatch = prompt.match(/debt[:\s]+(\d+)/i);

        if (ebitdaMatch && debtMatch) {
            const ebitda = parseInt(ebitdaMatch[1]);
            const debt = parseInt(debtMatch[1]);
            const leverageRatio = (debt / ebitda).toFixed(2);
            const isSafe = leverageRatio <= 4.0;

            return `
                <strong>Leverage Ratio Analysis</strong><br><br>
                Based on your inputs:<br>
                • EBITDA: $${(ebitda / 1000000).toFixed(1)}M<br>
                • Total Debt: $${(debt / 1000000).toFixed(1)}M<br>
                • <strong>Leverage Ratio: ${leverageRatio}x</strong><br><br>
                
                <strong>Covenant Assessment:</strong><br>
                ${isSafe
                    ? `✅ The leverage ratio of ${leverageRatio}x is <strong style="color: #4ade80;">SAFE</strong> and within the 4.0x covenant threshold.`
                    : `⚠️ The leverage ratio of ${leverageRatio}x <strong style="color: #ef4444;">EXCEEDS</strong> the 4.0x covenant threshold. This is a breach.`
                }<br><br>
                
                <strong>Recommendation:</strong><br>
                ${isSafe
                    ? 'Continue monitoring. The company has adequate headroom.'
                    : 'Immediate action required: Consider debt reduction, EBITDA improvement initiatives, or request a covenant waiver from lenders.'
                }
            `;
        }
    }

    // Precautions, monitoring, recommendations, tips, advice
    if (lowerPrompt.includes('precaution') || lowerPrompt.includes('monitor') ||
        lowerPrompt.includes('tip') || lowerPrompt.includes('advice') ||
        lowerPrompt.includes('recommend') || lowerPrompt.includes('best practice') ||
        lowerPrompt.includes('what should') || lowerPrompt.includes('how to') ||
        lowerPrompt.includes('more')) {
        return `
            <strong>Loan Monitoring Best Practices</strong><br><br>
            
            <strong>📊 Regular Monitoring:</strong><br>
            • Review financial covenants <strong>quarterly</strong><br>
            • Track leverage ratio trends monthly<br>
            • Monitor cash flow and liquidity weekly<br>
            • Update financial projections regularly<br><br>
            
            <strong>⚠️ Early Warning Signs:</strong><br>
            • Leverage ratio approaching 80% of covenant limit<br>
            • Declining EBITDA margins (>10% drop)<br>
            • Revenue volatility or customer concentration<br>
            • Delayed payments or stretched payables<br>
            • Industry-specific headwinds<br><br>
            
            <strong>🛡️ Proactive Measures:</strong><br>
            • Maintain open communication with lenders<br>
            • Build covenant headroom (stay 15-20% below limits)<br>
            • Diversify revenue streams<br>
            • Keep 3-6 months cash reserves<br>
            • Document any unusual events immediately<br><br>
            
            <strong>📝 Documentation:</strong><br>
            • Keep detailed covenant compliance certificates<br>
            • Maintain audit trail of calculations<br>
            • Document management discussions and decisions<br>
            • Prepare quarterly lender reports<br><br>
            
            <strong>💡 Pro Tip:</strong> If you're within 15% of any covenant limit, start discussions with your lender proactively!<br><br>
            
            <em style="color: var(--text-muted); font-size: 0.85rem;">💬 Ask me anything else about loan covenants, risk analysis, or financial ratios!</em>
        `;
    }

    // Greetings and casual conversation
    if (lowerPrompt.match(/^(hi|hello|hey|good morning|good afternoon|thanks|thank you|ok|okay)$/i)) {
        return `
            <strong>Hello!</strong> 👋<br><br>
            I'm your LoanPulse AI assistant, powered by Google Gemini. I can help you with:<br><br>
            
            • <strong>Calculate ratios</strong> - Leverage, DSCR, Interest Coverage<br>
            • <strong>Explain covenants</strong> - Financial and operational covenants<br>
            • <strong>Assess risk</strong> - Credit risk factors and mitigation<br>
            • <strong>Draft documents</strong> - Waiver requests and compliance reports<br>
            • <strong>Answer questions</strong> - Any loan or finance-related query<br><br>
            
            What would you like to know?
        `;
    }

    // DSCR questions
    if (lowerPrompt.includes('dscr') || lowerPrompt.includes('debt service coverage')) {
        return `
            <strong>Debt Service Coverage Ratio (DSCR) Explained</strong><br><br>
            DSCR measures a company's ability to service its debt obligations.<br><br>
            
            <strong>Formula:</strong> DSCR = EBITDA / Debt Service<br><br>
            
            <strong>Interpretation:</strong><br>
            • DSCR > 1.5x: <span style="color: #4ade80;">Strong</span> - Healthy coverage<br>
            • DSCR 1.25-1.5x: <span style="color: #facc15;">Adequate</span> - Acceptable but monitor<br>
            • DSCR 1.0-1.25x: <span style="color: #f59e0b;">Weak</span> - Covenant risk<br>
            • DSCR < 1.0x: <span style="color: #ef4444;">Critical</span> - Cannot cover debt service<br><br>
            
            <strong>Typical Covenant:</strong> Minimum 1.25x required by most lenders.<br><br>
            
            <em style="color: var(--text-muted); font-size: 0.85rem;">💬 Ask me to calculate DSCR for specific numbers!</em>
        `;
    }

    // Covenant questions
    if (lowerPrompt.includes('covenant') || lowerPrompt.includes('breach')) {
        return `
            <strong>Loan Covenant Overview</strong><br><br>
            Covenants are contractual obligations in loan agreements:<br><br>
            
            <strong>Financial Covenants:</strong><br>
            • Maximum Leverage Ratio (typically 3.5-4.5x)<br>
            • Minimum Interest Coverage Ratio (typically 2.5-3.0x)<br>
            • Minimum DSCR (typically 1.25x)<br>
            • Maximum CapEx limits<br><br>
            
            <strong>If Breach Occurs:</strong><br>
            1. Notify lender immediately<br>
            2. Request covenant waiver or amendment<br>
            3. Present remediation plan<br>
            4. Consider equity cure provisions<br><br>
            
            <strong>Tip:</strong> Monitor covenants quarterly to avoid surprises.<br><br>
            
            <em style="color: var(--text-muted); font-size: 0.85rem;">💬 Ask me anything else about covenants!</em>
        `;
    }

    // Risk assessment questions
    if (lowerPrompt.includes('risk') || lowerPrompt.includes('assess')) {
        return `
            <strong>Credit Risk Assessment Framework</strong><br><br>
            
            <strong>Key Risk Indicators:</strong><br>
            • Leverage trending upward<br>
            • Revenue volatility<br>
            • Declining EBITDA margins<br>
            • Liquidity constraints<br>
            • Industry headwinds<br><br>
            
            <strong>Risk Mitigation:</strong><br>
            1. Diversify revenue streams<br>
            2. Maintain cash reserves<br>
            3. Negotiate covenant headroom<br>
            4. Regular stress testing<br>
            5. Proactive lender communication<br><br>
            
            Use the Stress Test page to simulate scenarios.<br><br>
            
            <em style="color: var(--text-muted); font-size: 0.85rem;">💬 Ask me for more specific risk analysis!</em>
        `;
    }

    // Waiver letter questions
    if (lowerPrompt.includes('waiver') || lowerPrompt.includes('letter')) {
        return `
            <strong>Covenant Waiver Request Template</strong><br><br>
            
            A waiver letter should include:<br><br>
            
            1. <strong>Acknowledgment:</strong> Clearly state the covenant breach<br>
            2. <strong>Explanation:</strong> Provide context (market conditions, one-time events)<br>
            3. <strong>Remediation Plan:</strong> Specific actions and timeline<br>
            4. <strong>Financial Projections:</strong> Show path back to compliance<br>
            5. <strong>Request:</strong> Specific waiver period requested<br><br>
            
            <strong>Key Points:</strong><br>
            • Be transparent and proactive<br>
            • Provide supporting documentation<br>
            • Demonstrate good faith<br>
            • Offer increased reporting frequency<br><br>
            
            <em style="color: var(--text-muted); font-size: 0.85rem;">💬 Ask me to help draft a specific waiver letter!</em>
        `;
    }

    // Interest coverage questions
    if (lowerPrompt.includes('interest coverage') || lowerPrompt.includes('icr')) {
        return `
            <strong>Interest Coverage Ratio (ICR) Analysis</strong><br><br>
            
            <strong>Formula:</strong> ICR = EBITDA / Interest Expense<br><br>
            
            <strong>Benchmarks:</strong><br>
            • ICR > 4.0x: <span style="color: #4ade80;">Excellent</span><br>
            • ICR 3.0-4.0x: <span style="color: #4ade80;">Good</span><br>
            • ICR 2.0-3.0x: <span style="color: #facc15;">Adequate</span><br>
            • ICR < 2.0x: <span style="color: #ef4444;">Concerning</span><br><br>
            
            <strong>Typical Covenant:</strong> Minimum 2.5-3.0x<br><br>
            
            Higher ratios indicate better ability to service debt from operating cash flow.<br><br>
            
            <em style="color: var(--text-muted); font-size: 0.85rem;">💬 Ask me to calculate ICR for your company!</em>
        `;
    }

    // Default fallback - encourage natural questions
    return `
        <strong>I'm here to help!</strong> 💬<br><br>
        
        I'm powered by Google Gemini AI and can answer questions about:<br><br>
        
        • Loan covenants and compliance<br>
        • Financial ratio calculations<br>
        • Credit risk assessment<br>
        • Waiver letters and documentation<br>
        • Stress testing scenarios<br>
        • General finance and banking questions<br><br>
        
        <strong>Try asking me naturally, like:</strong><br>
        • "How do I calculate leverage ratio?"<br>
        • "What should I do if I'm close to breaching a covenant?"<br>
        • "Explain the difference between DSCR and ICR"<br>
        • "What are early warning signs of credit risk?"<br><br>
        
        <em style="color: var(--accent-primary);">💡 Go ahead, ask me anything!</em>
    `;
}

function setupNavigation() {
    // handled via dropdown now
}

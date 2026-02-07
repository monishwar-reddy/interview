# Behavioural Interview Simulator - Voice Edition

A fully voice-driven AI interview simulator that conducts realistic behavioural interviews with automatic question flow and real-time STAR evaluation.

## ✨ Key Features

- **🎤 Fully Voice-Driven**: Completely hands-free conversational interview
- **🤖 Auto-Flow**: System automatically speaks questions and listens for answers
- **🔇 Silence Detection**: Automatically detects when you finish speaking (2.5s silence)
- **💬 Natural Conversation**: Greets you, asks for consent, and thanks you at the end
- **📊 STAR Scoring**: Real-time evaluation on Situation, Task, Action, Result, Reflection
- **🎨 Professional UI**: Interview-style interface with gradient background
- **📈 Smart Insights**: Personalized nudges based on weakness patterns

## 🎯 How It Works

### 1. **Greeting** 
- System says: *"Hi! Welcome to your behavioural interview practice session. Should we start the interview?"*
- Say: **"Yes"** / **"Sure"** / **"Ready"** to begin

### 2. **Interview Flow** (Automatic)
- System speaks each question + personalized tip
- Auto-starts listening for your answer
- You speak naturally (will detect 2.5s of silence to know you're done)
- System auto-scores and moves to next question
- No buttons needed - completely hands-free!

### 3. **Closing**
- System says: *"Thank you! We had a wonderful time speaking with you today."*
- View your scores, download reports

## 🚀 Quick Start

```powershell
# Install dependencies
pip install -r requirements.txt

# Run the app
D:/codathon/.venv/Scripts/python.exe -m streamlit run app.py
```

Access at: **http://localhost:8501**

## 🎙️ Voice Requirements

- **Browser**: Chrome or Edge (requires Web Speech API)
- **Microphone**: Grant browser mic permissions
- **Language**: English (en-US)
- **Environment**: Quiet room for best recognition

## 📋 Interview Process

1. **Auto-Greeting**: System greets and asks to start
2. **Voice Confirmation**: Say "yes" to begin
3. **5 Questions**: System asks → You answer → Auto-scores
4. **Auto-Progression**: Silence detection triggers next question
5. **Closing**: Thank you message + results

## 🎨 Professional UI

- Gradient background (dark blue professional theme)
- White container with shadow for focus
- Question displayed in purple gradient box
- Real-time listening indicators
- Clean, distraction-free interview environment

## Scoring Details

### STAR Breakdown (0-5 each)
- **Situation**: Context detected via keywords or section labels
- **Task**: Your goal or responsibility
- **Action**: Concrete steps you took
- **Result**: Measurable impact (bonus for numbers/%)
- **Reflection**: What you learned

### Dimension Scores (0-10 each)
- **Clarity**: Sentence length, filler words, readability
- **Structure**: STAR order, paragraphing, transitions
- **Completeness**: Coverage + specificity (tools, stakeholders, metrics)

### Total Score (0-100)
Weighted combination of STAR + dimensions

## Weakness Patterns

The app tracks recurring issues:
- Missing metrics in Result
- Weak Action detail
- Too brief (<80 words)

## Reports

### JSON Report
- Role, summary stats
- Common weaknesses
- 3-step improvement plan
- Next practice questions
- Full answer history with scores

### Text Report
- Summary stats
- Dimension averages
- Top improvement areas
- Practice focus prompts

## Tips for Better Scores

1. **Use STAR labels**: Start sections with "Situation:", "Task:", etc.
2. **Add metrics**: Include %, time saved, or quantified impact
3. **Be specific**: Mention tools, stakeholders, concrete actions
4. **Aim for 80-140 words**: Enough detail, not too verbose
5. **Include reflection**: What you learned or would do differently

## Troubleshooting

### Voice not working
- Check browser compatibility (Chrome/Edge recommended)
- Grant microphone permissions
- Check microphone is not muted
- Try refreshing the page

### Scoring seems wrong
- Use explicit STAR section labels
- Include more action verbs (implemented, led, analyzed)
- Add measurable results (20% improvement, 45 minutes)
- Add reflection (learned, next time, reinforced)

### Session lost on refresh
- Streamlit preserves state during runtime
- If you close the browser, session is lost
- Download reports before closing

## Development

To modify scoring rules:
- Edit `scoring.py` KEYWORDS or scoring functions
- Adjust thresholds in `_score_dimension` and dimension scoring

To add questions:
- Edit `questions.py` QUESTION_BANK
- Add role, question, id, tags

To change report format:
- Edit `report.py` generation functions

## License

MIT

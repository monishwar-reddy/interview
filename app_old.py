import streamlit as st
import time

import questions
import scoring
import memory
import report
import voice


st.set_page_config(page_title="Behavioural Interview Simulator", page_icon="🎯", layout="wide")

# Professional interview UI theme
st.markdown("""
    <style>
    .main {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    }
    .stApp {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    }
    div[data-testid="stToolbar"] {
        display: none;
    }
    .interview-container {
        background: white;
        border-radius: 20px;
        padding: 40px;
        margin: 20px auto;
        max-width: 900px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    h1 {
        color: #2c3e50;
        text-align: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .scenario-box {
        background: #ecf0f1;
        padding: 25px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 5px solid #3498db;
    }
    </style>
""", unsafe_allow_html=True)
roles = questions.get_roles()

if "stage" not in st.session_state:
    st.session_state["stage"] = "start"
if "session" not in st.session_state:
    st.session_state["session"] = None
if "show_feedback" not in st.session_state:
    st.session_state["show_feedback"] = False
if "last_question" not in st.session_state:
    st.session_state["last_question"] = None
if "pending_clear_answer" not in st.session_state:
    st.session_state["pending_clear_answer"] = False
if "answer_input" not in st.session_state:
    st.session_state["answer_input"] = ""
if "voice_mode" not in st.session_state:
    st.session_state["voice_mode"] = False
if "mic_consent" not in st.session_state:
    st.session_state["mic_consent"] = False
if "voice_transcript" not in st.session_state:
    st.session_state["voice_transcript"] = ""
if "pending_voice_load" not in st.session_state:
    st.session_state["pending_voice_load"] = None


def _reset_interview(selected_role):
    session_questions = questions.get_questions(selected_role, n=5, seed=selected_role)
    st.session_state["session"] = memory.SessionMemory(selected_role, session_questions)
    st.session_state["role"] = selected_role
    st.session_state["stage"] = "in_progress"
    st.session_state["show_feedback"] = False
    st.session_state["last_question"] = None
    st.session_state["pending_clear_answer"] = True


if st.session_state["stage"] == "start":
    st.subheader("Start Interview")
    role = st.selectbox("Select role", roles, key="role_select")
    
    st.write("---")
    voice_mode_enabled = st.checkbox(
        "🎤 Enable Voice Mode (system speaks questions, you answer by voice)",
        value=st.session_state.get("voice_mode", False)
    )
    st.session_state["voice_mode"] = voice_mode_enabled
    
    if voice_mode_enabled and not st.session_state.get("mic_consent", False):
        st.info("Voice mode requires microphone access. Click below to grant consent.")
        if st.button("Grant Microphone Consent"):
            st.session_state["mic_consent"] = True
            st.rerun()
        st.stop()
    
    if st.button("Start Interview"):
        _reset_interview(role)
        st.rerun()
    st.stop()

session = st.session_state.get("session")
if not session:
    st.session_state["stage"] = "start"
    st.rerun()

total_questions = len(session.questions)
current_index = session.question_index
progress = min(current_index / max(1, total_questions), 1.0)
st.progress(progress, text=f"Question {min(current_index + 1, total_questions)}/{total_questions}")

if st.session_state["stage"] == "end":
    st.success("Session complete. Review your summary and export below.")
else:
    if st.session_state["pending_clear_answer"]:
        st.session_state["answer_input"] = ""
        st.session_state["pending_clear_answer"] = False

    if st.session_state["show_feedback"]:
        question_item = st.session_state["last_question"]
    else:
        question_item = session.questions[current_index]

    st.subheader("Scenario")
    st.write(question_item["question"])
    
    nudge = session.get_personalized_nudge()
    st.info(nudge)
    
    if st.session_state.get("voice_mode", False) and not st.session_state["show_feedback"]:
        if st.button("🔊 Speak Question"):
            voice.speak_text(question_item["question"] + ". " + nudge)
    
    answer_disabled = st.session_state["show_feedback"]
    
    if st.session_state.get("voice_mode", False) and not answer_disabled:
        st.write("**Voice Input**")
        voice.voice_input_component()
        
        col1, col2 = st.columns([1, 1])
        with col1:
            if st.button("📝 Use Voice Transcript"):
                voice_text = st.session_state.get("voice_transcript", "")
                if voice_text.strip():
                    st.session_state["pending_voice_load"] = voice_text
                    st.rerun()
                else:
                    st.warning("No voice transcript available. Please record your answer first.")
        with col2:
            if st.button("🗑️ Clear Voice"):
                st.session_state["voice_transcript"] = ""
                st.rerun()
        
        st.write("---")
        st.write("**Or type your answer below:**")
    
    if st.session_state.get("pending_voice_load"):
        st.session_state["answer_input"] = st.session_state["pending_voice_load"]
        st.session_state["pending_voice_load"] = None
    
    st.text_area("Your answer", height=220, key="answer_input", disabled=answer_disabled)

    if st.button("Submit answer", disabled=answer_disabled):
        answer = st.session_state.get("answer_input", "")
        if not answer.strip():
            st.warning("Please enter an answer before submitting.")
        else:
            scoring_result = scoring.score_answer(answer)
            session.add_response(
                question_id=question_item["id"],
                question=question_item["question"],
                answer=answer,
                scores=scoring_result,
                suggestions=scoring_result["improvement_suggestions"]
            )
            st.session_state["session"] = session
            st.session_state["last_question"] = question_item
            st.session_state["show_feedback"] = True
            st.rerun()

    if st.session_state["show_feedback"] and session.last_entry:
        last_feedback = session.last_entry
        st.subheader("Feedback for last answer")
        st.write("STAR breakdown")
        st.json(last_feedback["scores"]["star_breakdown"])

        st.write("Additional scores")
        st.write(
            {
                "Clarity": last_feedback["scores"]["dimension_scores"]["clarity"],
                "Structure": last_feedback["scores"]["dimension_scores"]["structure"],
                "Completeness": last_feedback["scores"]["dimension_scores"]["completeness"],
                "Total (0-100)": last_feedback["scores"]["total_score"]
            }
        )

        suggestions = last_feedback["suggestions"]
        st.write("Suggestions")
        if suggestions:
            for item in suggestions:
                st.write(f"- {item}")
        else:
            st.write("Strong STAR coverage. Keep the structure consistent.")

        next_label = "Finish Interview" if session.question_index >= total_questions else "Next Question"
        if st.button(next_label):
            st.session_state["show_feedback"] = False
            st.session_state["pending_clear_answer"] = True
            st.session_state["voice_transcript"] = ""
            if session.question_index >= total_questions:
                st.session_state["stage"] = "end"
            st.rerun()

st.subheader("Pattern insights")
top_weaknesses = session.get_top_weaknesses(n=3)
if top_weaknesses:
    for weakness, count in top_weaknesses:
        st.write(f"- {weakness} ({count}x)")
else:
    st.write("No repeated weakness detected yet. Keep going.")

if st.session_state["stage"] == "end":
    st.subheader("Session summary")
    summary = report.generate_json_report(session)["summary"]

    st.write(f"Overall average score: {summary['overall_average']}")

    averages = summary.get("dimension_averages", {})
    strength_candidates = {k: v for k, v in averages.items() if k not in ["Total"]}
    strengths = sorted(strength_candidates.items(), key=lambda item: item[1], reverse=True)[:2]
    weaknesses = sorted(strength_candidates.items(), key=lambda item: item[1])[:2]

    st.write("Top strengths")
    for name, value in strengths:
        st.write(f"- {name} ({value})")

    st.write("Top weaknesses")
    for name, value in weaknesses:
        st.write(f"- {name} ({value})")

    rows = []
    for idx, entry in enumerate(session.qa_history, start=1):
        scores = entry["scores"]
        star_items = scores["star_breakdown"]
        lowest = min(star_items.items(), key=lambda item: item[1]["score"])
        key_issue = lowest[0]
        if entry["suggestions"]:
            key_issue = entry["suggestions"][0]
        rows.append(
            {
                "Q#": idx,
                "Score": scores["total_score"],
                "Key Issue": key_issue
            }
        )

    st.write("Per-question summary")
    st.table(rows)

    json_report = report.json_report_bytes(session)
    st.download_button(
        label="Download JSON report",
        data=json_report,
        file_name="behavioural_interview_report.json",
        mime="application/json"
    )

    text_report = report.text_report_bytes(session)
    st.download_button(
        label="Download text report",
        data=text_report,
        file_name="behavioural_interview_report.txt",
        mime="text/plain"
    )

    if st.button("Start another session"):
        st.session_state["stage"] = "start"
        st.session_state["session"] = None
        st.session_state["voice_mode"] = False
        st.session_state["mic_consent"] = False
        st.session_state["voice_transcript"] = ""
        st.rerun()

with st.expander("Answer history"):
    for idx, entry in enumerate(session.qa_history, start=1):
        st.write(f"Q{idx}: {entry['question']}")
        st.write(entry["answer"])
import json
import streamlit as st
import streamlit.components.v1 as components
import uuid

try:
    from streamlit_javascript import st_javascript
    _HAS_ST_JS = True
except Exception:
    st_javascript = None
    _HAS_ST_JS = False


def speak_text(text, auto_start_listening=False):
    """Use browser TTS to speak the given text."""
    unique_id = str(uuid.uuid4())
    html = f"""
    <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 10px 0; border: 2px solid #4caf50;">
        <div style="text-align: center; font-size: 18px; color: #2e7d32; font-weight: bold;">
            🔊 Speaking...
        </div>
    </div>
    <script>
        console.log('Attempting to speak:', {repr(text)});
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance({repr(text)});
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        
        utterance.onstart = function() {{
            console.log('Speech started');
        }};
        
        utterance.onend = function() {{
            console.log('Speech ended');
            if ({str(auto_start_listening).lower()}) {{
                window.parent.postMessage({{
                    type: 'streamlit:auto_start_listening',
                    id: '{unique_id}'
                }}, '*');
            }}
        }};
        
        utterance.onerror = function(event) {{
            console.error('Speech error:', event);
        }};
        
        // Small delay to ensure it works
        setTimeout(function() {{
            window.speechSynthesis.speak(utterance);
        }}, 100);
    </script>
    """
    components.html(html, height=100)


def voice_input_component(auto_start=False, key=None):
    """Capture voice input via Web Speech API and return transcript payload."""
    if not _HAS_ST_JS:
        st.warning("Voice input requires streamlit-javascript. Please install it and reload.")
        return None

    components.html(
        """
        <div style="text-align:center; padding:16px; background:#ffffff; border-radius:12px; border:1px dashed #c9c2b6;">
            <div style="font-weight:600; color:#3b3b3b;">🎤 Listening for your response...</div>
            <div style="font-size:0.9em; color:#6b6b6b; margin-top:6px;">Speak clearly. Auto-submit after a short pause.</div>
        </div>
        """,
        height=90,
    )

    js = f"""
    async function runSpeech() {{
        const hasRec = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        if (!hasRec) {{
            return JSON.stringify({{ error: 'not_supported', transcript: '', complete: true }});
        }}
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';
        let lastSpeechTime = Date.now();
        const SILENCE_THRESHOLD = 2500;

        return await new Promise((resolve) => {{
            let silenceTimer = null;

            function checkSilence() {{
                if (Date.now() - lastSpeechTime >= SILENCE_THRESHOLD) {{
                    recognition.stop();
                }}
            }}

            recognition.onstart = function() {{
                lastSpeechTime = Date.now();
                silenceTimer = setInterval(checkSilence, 200);
            }};

            recognition.onresult = function(event) {{
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {{
                    const piece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {{
                        finalTranscript += piece + ' ';
                        lastSpeechTime = Date.now();
                    }} else {{
                        interim += piece;
                    }}
                }}
            }};

            recognition.onerror = function(event) {{
                if (silenceTimer) clearInterval(silenceTimer);
                resolve(JSON.stringify({{ error: event.error, transcript: '', complete: true }}));
            }};

            recognition.onend = function() {{
                if (silenceTimer) clearInterval(silenceTimer);
                resolve(JSON.stringify({{ transcript: finalTranscript.trim(), complete: true }}));
            }};

            if ({str(auto_start).lower()}) {{
                recognition.start();
            }} else {{
                resolve(JSON.stringify({{ transcript: '', complete: false }}));
            }}
        }});
    }}

    await runSpeech();
    """

    result = st_javascript(js, key=key)
    if not result:
        return None
    try:
        payload = json.loads(result) if isinstance(result, str) else result
    except json.JSONDecodeError:
        payload = None
    return payload


def get_voice_transcript():
    """Get the current voice transcript from session state."""
    return st.session_state.get("voice_transcript", "")


def clear_voice_transcript():
    """Clear the voice transcript."""
    if "voice_transcript" in st.session_state:
        st.session_state["voice_transcript"] = ""


def request_mic_permission(key=None):
    """Request microphone permission and return status payload."""
    if not _HAS_ST_JS:
        st.warning("Microphone permission requires streamlit-javascript. Please install it and reload.")
        return None

    js = """
    async function requestMic() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return JSON.stringify({ status: 'not_supported' });
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return JSON.stringify({ status: 'granted' });
        } catch (err) {
            return JSON.stringify({ status: 'denied', error: err && err.name ? err.name : 'unknown' });
        }
    }
    await requestMic();
    """

    result = st_javascript(js, key=key)
    if not result:
        return None
    try:
        payload = json.loads(result) if isinstance(result, str) else result
    except json.JSONDecodeError:
        payload = None
    return payload

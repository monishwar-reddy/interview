"""
Browser compatibility check for Web Speech API
"""
import streamlit as st
import streamlit.components.v1 as components

def check_browser_support():
    """
    Check if browser supports Web Speech API and return HTML status component
    """
    html_code = """
    <div id="browser-check-result"></div>
    <script>
        const resultDiv = document.getElementById('browser-check-result');
        
        const hasSpeechSynthesis = 'speechSynthesis' in window;
        const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        let message = '';
        let bgColor = '';
        
        if (hasSpeechSynthesis && hasSpeechRecognition) {
            message = '✅ Your browser supports voice features!';
            bgColor = '#e8f5e9';
            
            // Send success signal to parent
            window.parent.postMessage({type: 'browser_support', supported: true}, '*');
        } else {
            message = '❌ Browser Compatibility Issue:<br>';
            if (!hasSpeechSynthesis) {
                message += '• Text-to-Speech (TTS) not supported<br>';
            }
            if (!hasSpeechRecognition) {
                message += '• Speech Recognition (STT) not supported<br>';
            }
            message += '<br><strong>Recommendation:</strong> Use Google Chrome, Microsoft Edge, or Safari for best experience.';
            bgColor = '#ffebee';
            
            // Send failure signal to parent
            window.parent.postMessage({type: 'browser_support', supported: false}, '*');
        }
        
        resultDiv.innerHTML = `
            <div style="background: ${bgColor}; padding: 15px; border-radius: 8px; margin: 10px 0; font-size: 1.1em;">
                ${message}
            </div>
        `;
    </script>
    """
    
    components.html(html_code, height=120)

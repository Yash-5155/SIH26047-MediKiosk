/**
 * MediKiosk Voice Service
 * Wraps browser-native Web Speech API for Recognition (STT) and SpeechSynthesis (TTS).
 * Provides graceful fallbacks if speech APIs or microphone permissions are unavailable.
 */

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.isListening = false;
    this.isSpeaking = false;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  isSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition || window.speechSynthesis);
  }

  /**
   * Start listening for voice input
   */
  startListening({ onResult, onError, onStateChange, language = 'en-US' }) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStateChange) onStateChange('listening');
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (onResult) {
          const isFinal = event.results[event.results.length - 1].isFinal;
          onResult(transcript, isFinal);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (onStateChange) onStateChange('error');
        if (onError) onError(event.error || 'Voice error occurred.');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onStateChange) onStateChange('idle');
      };

      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err.message || 'Could not start microphone.');
    }
  }

  /**
   * Stop speech recognition
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop error
      }
      this.isListening = false;
    }
  }

  /**
   * Speak text aloud using SpeechSynthesis
   */
  speak(text, { language = 'en', onStart, onEnd } = {}) {
    if (!this.synthesis) return;

    this.stopSpeaking(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // Slightly slower for clear healthcare presentation

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Stop active speech synthesis
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const voiceService = new VoiceService();

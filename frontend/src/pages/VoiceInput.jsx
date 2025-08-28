import React, { useState } from "react";

export default function VoiceInput({
  language,
  setStatus,
  setShoppingList,
  setResults,
  transcript,
  setTranscript,
}) {
  const [listening, setListening] = useState(false);

  const handleVoiceCommand = () => {
    const langMap = { en: "en-US", hi: "hi-IN" };
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("❌ Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langMap[language] || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    setStatus("Listening...");
    setListening(true);
    setTranscript("");

    recognition.start();

    recognition.onresult = (event) => {
      let liveTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        liveTranscript += event.results[i][0].transcript + " ";
      }
      setTranscript(liveTranscript.trim());

      if (event.results[0].isFinal) {
        setStatus("Processing...");
        fetch("http://localhost:5000/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: liveTranscript, language }),
        })
          .then((res) => res.json())
          .then((data) => {
            setShoppingList(data.shoppingList || []);
            setResults(data.results || []);
            setStatus(data.status || "Done");
          })
          .catch((err) => setStatus("Error: " + err.message));
        setListening(false);
      }
    };

    recognition.onerror = (err) => {
      setStatus("Error: " + err.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <div className="voice-input">
      <button
        className={`mic-btn ${listening ? "active" : ""}`}
        onClick={handleVoiceCommand}
      >
        🎤
      </button>
    </div>
  );
}

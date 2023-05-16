import "./InputController.css";

import React, { useEffect, useRef, useState } from "react";

import MicOff from "../../assets/mic-off.svg";
import MicOn from "../../assets/mic-on.svg";
import SpeechToTextButton from "../SpeechToTextButton/SpeechToTextButton";

function InputController(props) {
  const [recording, setRecording] = useState(false);
  const [transcriptionReadOnly, setTranscriptionReadOnly] = useState(false);
  const [language, setLanguage] = useState("pt-BR");
  const [micImage, setMicImage] = useState(MicOff);
  const [textAreaFocused, setTextAreaFocused] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = () => {
    const isBrowserSupportSpeechRecognition =
      typeof window !== "undefined" &&
      window.webkitSpeechRecognition !== undefined;

    if (!isBrowserSupportSpeechRecognition) {
      return alert("This browser does not support audio recording.");
    }

    if (isAndroidSamsung()) {
      alert(
        "We're sorry to say that this functionality is currently not available on Android devices."
      );
    } else {
      setMicImage(MicOn);
      
      const recognition =
        new window.webkitSpeechRecognition() || new window.SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onpermission = (result) => {
        if (result === "denied") {
          alert("You need to grant permission to use the microphone.");
          setMicImage(MicOff);
        } else {
        }
      };

      recognition.onstart = () => {
        setRecording(true);
        setTranscriptionReadOnly(true);
        startTimer();
      };

      recognition.onresult = (event) => {
        let interimTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        interimTranscript = interimTranscript.replace(/interrogação/gi, "?"); // replaces the word "interrogação" with the accent "?"
        interimTranscript = interimTranscript.replace(/vírgula/gi, ",");
        interimTranscript = interimTranscript.replace(
          /ponto final da frase/gi,
          "."
        );
        interimTranscript = interimTranscript.replace(/dois pontos/gi, ":");

        const textarea = document.getElementById("input-message");
        textarea.scrollTop = textarea.scrollHeight;

        props.setMessageContent(props.messageContent + " " + interimTranscript);

        restartTimer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      stopTimer();
    }
    setRecording(false);
    setTranscriptionReadOnly(false);
  };

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      stopRecording();
    }, 10000); // sets the time limit to 10 seconds
  };

  const restartTimer = () => {
    clearTimeout(timerRef.current);
    startTimer();
  };

  const stopTimer = () => {
    setMicImage(MicOff);
    clearTimeout(timerRef.current);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  const handleTranscriptionChange = (event) => {
    props.setMessageContent(event.target.value);
  };

  function isAndroidSamsung() {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      userAgent.indexOf("android") > -1 || userAgent.indexOf("samsung") > -1
    );
  }

  const handleChangeTextArea = (event) => {
    handleTranscriptionChange(event);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (textAreaFocused && props.windowSize !== "Desktop" ) {
      setTextAreaFocused(false);
    }
    props.handleSubmit();
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <form
        id="thought-form"
        className="AddThoughtForm"
        onSubmit={handleFormSubmit}
      >
        <div
          id="mensage-bar"
          className="mensage-container"
          style={{ zIndex: 0 }}
        >
          <div
            className="textarea-container"
            style={{
              width:
                props.windowSize !== "Desktop"
                  ? textAreaFocused
                    ? "80%"
                    : "65%"
                  : "auto",
            }}
          >
            <textarea
              id="input-message"
              name="message"
              className="input-message"
              rows={"2"}
              cols="60"
              value={props.messageContent}
              readOnly={transcriptionReadOnly}
              onChange={handleChangeTextArea}
              onFocus={() => {
                props.windowSize !== "Desktop"
                  ? setTextAreaFocused(true)
                  : null;
              }}
              onKeyDown={props.handleKeyDown}
              placeholder="What's on your mind?"
              style={{}}
              spellCheck="true"
              lang="PT-BR"
              onBlur={()=>{setTextAreaFocused(false)}}
            />
          </div>

          <div
            className="functional-button-container"
            style={{
              marginRight:
                props.windowSize !== "Desktop"
                  ? textAreaFocused
                    ? "2vw"
                    : "0"
                  : "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h5 className="beta">BETA</h5>
              <SpeechToTextButton
                image={micImage}
                onClick={() => {
                  if (micImage === MicOff) {
                    startRecording();
                  } else {
                    stopRecording();
                  }
                }}
              ></SpeechToTextButton>
            </div>

            <div
              className="container-photo-send"
              style={{
                display:
                  props.windowSize !== "Desktop"
                    ? textAreaFocused
                      ? "none"
                      : "flex"
                    : "flex",
                opacity:
                  props.windowSize !== "Desktop"
                    ? textAreaFocused
                      ? 0
                      : 1
                    : 1,
                transition: "all 1800ms",
              }}
            >
              <label htmlFor="avatar" className="send-photo-button">
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/png, image/jpeg"
                  onChange={props.handleChangeImage}
                />
              </label>
            </div>

            <div
              className="container-message-send"
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <button className="send-message-button" >
                <input
                  type="submit"
                  value=" "
                />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default InputController;

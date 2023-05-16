import "./SpeechToTextButton.css";

import React from "react";

let counter = 0;

const toggleMic = () => {
  const messageBallon = document.querySelector(".message-ballon");

  if (counter === 0) {
    messageBallon.classList.add("show");
    counter = counter + 1;
    setTimeout(() => {
      messageBallon.classList.remove("show");
    }, 15000);
  } else {
    messageBallon.classList.remove("show");
  }
};

function SpeechToTextButton(props) {
  return (
    <>
      <div className="message-ballon message-ballon-bottom-left">
        Transcribe your audio into text . Please note that this function is
        currently in BETA version, so it may not work perfectly on all devices.
        However, we are continually working to improve its functionality.
      </div>
      <button
        className="wave-button"
        type="button"
        onClick={() => {
          props.onClick();
          toggleMic();
        }}
      >
        <div className="wave"></div>
        <div className="wave-2"></div>
        <img src={props.image} className="mic" />
      </button>
    </>
  );
}

export default SpeechToTextButton;

import "./PrivacyPolicy.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChevronLeft from "../../assets/chevron-left.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";

export const PrivacyPolicy = () => {
  const [goTo, setGoTo] = useState("");
  const URL = window.location.href;
  const navigate = useNavigate();

  const Mount = async () => {
    window.scrollTo(0, 0);
    if (URL.includes("register/terms-and-conditions-of-use")) {
      setGoTo("/register/terms-and-conditions-of-use");
    } else if (URL.includes("register")) {
      setGoTo("/register");
    } else {
      setGoTo("/edit-profile");
    }
  };

  useEffect(() => {
    Mount();
  }, []);

  return (
    <AbstractBackground>
      <button onClick={() => navigate(goTo)} className="go-back-button">
        <img src={ChevronLeft} className={"image-go-back-button"}></img>
      </button>

      <div className="privacy-policy-container">
        <br />
        <h2 style={{ fontWeight: "500", marginBottom: "1vh" }}>
          Privacy Policy
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "-webkit-fill-available",
          }}
        >
          <p>
            Hello friend, we are
            <strong style={{ color: "#D88DB6" }}> Chatlla</strong>!
          </p>
        </div>

        <p style={{ width: "-webkit-fill-available", fontSize: ".8em" }}>
          Because we take your privacy very seriously, we want to inform you,
          our user, about what cookies are, why and when we use them, and which
          ones are used.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "-webkit-fill-available",
          }}
        >
          <p>So what about cookies? 🍪</p>
        </div>

        <p style={{ width: "-webkit-fill-available", fontSize: ".81em" }}>
          Cookies are small files created when visiting websites, which are
          saved on your device through your browser.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "-webkit-fill-available",
          }}
        >
          <p>Why do we use cookies? 🤔</p>
        </div>
        <p style={{ width: "-webkit-fill-available", fontSize: ".82em" }}>
          In this application, we use cookies only to remember user information,
          facilitating your navigation, collected when you login, register or
          change your registration data.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "-webkit-fill-available",
          }}
        >
          <p>Cookies used 💭</p>
        </div>

        <p style={{ width: "-webkit-fill-available", fontSize: "13px" }}>
          Session cookies - automatically deleted immediately at the end of the
          browsing session.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "-webkit-fill-available",
          }}
        >
          <p>What personal data do we store? 😉</p>
        </div>
        <ul
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "90%",
            flexDirection: "column",
            marginBlockEnd: 0,
            paddingInlineStart: 0,
          }}
        >
          <li style={{ textAlign: "left", fontSize: "13px" }}>Username;</li>
          <br />
          <li style={{ textAlign: "left", fontSize: "13px" }}>
            Profile picture.
          </li>
        </ul>
        <br />
        <br />
      </div>
    </AbstractBackground>
  );
};

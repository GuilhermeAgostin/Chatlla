import "./CookiesContainer.css";

import { useNavigate } from "react-router-dom";

import { setAuthorizedCookies } from "../../utils/utils";

export const CookiesContainer = ({
  rejectButtonClick,
  proceedButtonClick,
  setShowCookiesContainer,
  cookiesAccepted,
  setCookiesAccepted,
}) => {
  const navigate = useNavigate();

  return (
    <div className="cookies-container">
      <h4 className="cookies-container-title">We use cookies</h4>
      <p color="#000000" style={{ textAlign: "left" }}>
        They are used to improve your experience and navigation in this
        application.
      </p>

      <div className="consult-privacy-policy-container">
        <label style={{ fontSize: "13px" }}>
          Know and consult our{" "}
          <a
            style={{
              fontSize: "13px",
              color: "#D88DB6",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/login/privacy-policy")}
          >
            Privacy Policy
          </a>
          .
        </label>
      </div>
      <br />

      <div className="cokkies-button-container">
        <button
          className="button-reject"
          onClick={() => {
            setCookiesAccepted(false);
            setAuthorizedCookies(false);
          }}
        >
          Reject
        </button>
        <button
          className="button-proceed"
          onClick={() => {
            setCookiesAccepted(true);
            setAuthorizedCookies(true);
          }}
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

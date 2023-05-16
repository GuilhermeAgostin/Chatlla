import "./Warning.css";
import IconWarning from "../../assets/warning.svg";
import IconError from "../../assets/error.svg";
import IconNotAvailable from "../../assets/not-available-chat.svg";

export const Warning = ({
  children,
  openWarning,
  setOpenWarning,
  type = "warning",
  button = false,
  textButton = "",
  handleLogout,
}) => {
  function changeClass() {
    const element = document.getElementById("myWarning");
    const element2 = document.getElementById("warningContent");
    element2.classList.add("out-content");
    element.classList.add("out");

    setTimeout(() => {
      setOpenWarning(false);
      element2.classList.remove("out-content");
      element.classList.remove("out");
    }, 1000);
  }

  return (
    <div
      id="myWarning"
      className="warning"
      style={{ display: openWarning ? "flex" : "none" }}
    >
      <div
        id="warningContent"
        className="warning-content"
        style={{
          border:
            type === "warning" ? "1vw solid #f1df72" : type === "simpleWarning"? "none"  :  "1vw solid #E96F6F",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            minHeight: "4vh",
            width: "100%",
            zIndex: 1,
          }}
        >
          <span className="warning-close" onClick={() => changeClass()}>
            &times;
          </span>
        </div>

        <div
          className="warning-container-children"
          style={{ color: type === "warning" ? "#918125" : type === "simpleWarning"? "#000"  :  "red" }}
        >
          <div style={{width: "100%", fontSize: "13px"}}>
            <img
              src={type === "warning" ? IconWarning : type === "simpleWarning"? IconNotAvailable :  IconError}
              className="warning-component-image"
            />
            {children}

            {button ? (
              <div className="warning-component-button">
                <button
                  className="login-button"
                  style={{ backgroundColor: "#E96F6F" }}
                  onClick={handleLogout}
                >
                  {textButton}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

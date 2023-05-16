import "./Modal.css";

import Close from "../../assets/close.svg";

export const Modal = ({ title, children, color, openModal, setOpenModal }) => {
  function changeClass() {
    const element = document.getElementById("myModal");
    const element2 = document.getElementsByClassName("modal-content");
    element.classList.add("out");
    element.style.transform = "translateY(100%)";

    setTimeout(() => {
      setOpenModal(false);
    }, 500);
  }

  return (
    <div
      id="myModal"
      className={openModal ? "modal" : "out"}
      style={{ display: openModal ? "flex" : "none" }}
    >
      <div className="modal-content">
        <button
          onClick={() => {
            const element = document.getElementById("myModal");

            element.style.height = "10vh !important";
          }}
          style={{
            backgroundColor: "transparent",
            border: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "10vw",
          }}
        >
          <div
            style={{
              display: "flex",
              cursor: "pointer",
              width: "15vw",
              height: "3px",
              margin: "2vh 0",
              backgroundColor: "#9f9898",
              borderRadius: "1vw",
            }}
          ></div>
        </button>

        <div
          style={{
            display: "flex",
            width: "90%",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <label style={{ width: "inherit" }}>Contact profile picture</label>

          <button
            style={{
              backgroundColor: "transparent",
              border: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "10vw",
              height: "10vw",
            }}
          >
            <img
              style={{ cursor: "pointer", width: "24px", height: "24px" }}
              onClick={() => changeClass()}
              src={Close}
            ></img>
          </button>
        </div>
        <br />
        {children}
      </div>
    </div>
  );
};

import "./FullImageView.css";

import ArrowBack from "../../assets/chevron-left.svg";

export const FullImageView = ({
  title,
  children,
  color,
  openFullImageView,
  setOpenFullImageView,
  goBackLabel = true,
}) => {
  return (
    <div
      className="full-image-view"
      style={{ display: openFullImageView ? "flex" : "none" }}
    >
      <div className="full-image-view-header">
        <button className="channel-go-back-button">
          <img
            src={ArrowBack}
            className="channel-image-go-back-button"
            onClick={() => setOpenFullImageView(false)}
          ></img>
        </button>

        {goBackLabel ? (
          <div className="container-back">
            <label>Back</label>
          </div>
        ) : null}

        <h2 style={{ fontSize: "20px", fontWeight: "300", paddingLeft: "2vw" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

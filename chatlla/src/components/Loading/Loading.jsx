import "./Loading.css";

import ChatllaLogoOfficial from "../../assets/chatlla-logo-offcial.svg";

export const Loading = ({ loading, setLoading }) => {
  return (
    <div
      id="myModal"
      className="loading"
      style={{ display: loading ? "flex" : "none" }}
      onClick={() => setLoading(!loading)}
    >
      <img className="chatlla-logo-official" src={ChatllaLogoOfficial} />

      <h1 className="splash-screen-title loading-chatlla-title notranslate">
        Chatlla
      </h1>
      <div className="loading-span">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

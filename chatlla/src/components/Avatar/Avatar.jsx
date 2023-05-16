import "./Avatar.css";

export const Avatar = ({
  avatarBackgroundColor,
  frameBackgroundColor,
  frameBodyBackgroundColor,
}) => {
  return (
    <div className="" style={{ backgroundColor: avatarBackgroundColor }}>
      <div className="frame" style={{ backgroundColor: frameBackgroundColor }}>
        <div
          className="head"
          style={{
            backgroundColor: frameBodyBackgroundColor,
            borderColor: frameBodyBackgroundColor,
          }}
        ></div>
        <div
          className="body"
          style={{
            backgroundColor: frameBodyBackgroundColor,
            borderColor: frameBodyBackgroundColor,
          }}
        ></div>
      </div>
    </div>
  );
};

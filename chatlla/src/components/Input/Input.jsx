import "./Input.css";

import { useEffect, useRef, useState } from "react";

export const Input = ({
  inputType,
  placeholder = " ",
  id = "",
  value = undefined,
  onChange = () => {},
  onTouchEnd = () => {},
  onFocus = () => {},
  onClick = () => {},
  onClickIcon = () => {},
  onBlur = () => {},
  onKeyDown = () => {},
  required = false,
  autoComplete = "off",
  label = "Label",
  innerRef = useRef(""),
  icon = "",
  iconToTurn = "",
  seePassword = null,
  setSeePassword,
  autofocus = false,
  readOnly = false,
  pattern = null,
  disabled = false,
  styleContainerInput,
  inputWidth = "86%",
  title = "",
  innerDefaultValue = undefined,
  useSearchClass = false,
}) => {
  const [changeIcon, setChangeIcon] = useState(false);

  const handleClickLabel = (inputWhichBelongs) => {
    let element = document.getElementById(inputWhichBelongs);

    element.focus();
  };

  return (
    <>
      {value !== undefined && innerDefaultValue === undefined ? (
        <div
          className={
            disabled
              ? "custom-container-input-disabled"
              : "custom-container-input"
          }
          style={styleContainerInput}
        >
          <input
            id={id}
            value={value}
            required={required}
            type={
              inputType === "password"
                ? seePassword
                  ? (inputType = "text")
                  : inputType
                : inputType
            }
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={200}
            autoFocus={autofocus}
            readOnly={readOnly}
            pattern={pattern}
            title={title}
            disabled={disabled}
            className="custom-input"
            style={{
              left: title !== "" ? "3vw" : title === "" ? "auto" : "10%",
              opacity: disabled ? "0.5" : "1",
              width:
                icon === "" && inputWidth !== "86%"
                  ? inputWidth
                  : icon !== "" && inputWidth !== "86%"
                  ? inputWidth
                  : icon === "" && inputWidth !== "86%"
                  ? inputWidth
                  : "77%",
            }}
            onChange={(e) => onChange(e.target.value)}
            onClick={() => onClick()}
            onFocus={() => onFocus()}
            onBlur={() => onBlur()}
            onKeyDown={(event) => {
              if (event.key === "Enter" && id === "search") {
                onKeyDown();
              }
            }}
          />

          {placeholder === " " ? (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{
                maxWidth: label.length >= 20 ? "180px" : "150px",
                left: "auto",
              }}
            >
              {label.substring(0, 30)}
            </label>
          ) : (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{ opacity: "0" }}
            >
              {label.substring(0, 30)}
            </label>
          )}

          {icon === "" ? null : (
            <div
              className={
                useSearchClass
                  ? "search-container-password-icon"
                  : "container-password-icon"
              }
            >
              <img
                className="password-icon"
                src={
                  iconToTurn !== ""
                    ? disabled
                      ? iconToTurn
                      : seePassword || changeIcon
                      ? icon
                      : iconToTurn
                    : icon
                }
                onClick={() => {
                  onClickIcon();

                  if (iconToTurn !== "") {
                    setChangeIcon(!changeIcon);

                    if (seePassword !== null) {
                      setSeePassword(!seePassword);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : innerDefaultValue !== undefined && value !== undefined ? (
        <div
          className={
            disabled
              ? "custom-container-input-disabled"
              : "custom-container-input"
          }
          style={styleContainerInput}
        >
          <input
            id={id}
            defaultValue={innerDefaultValue}
            required={required}
            type={
              inputType === "password"
                ? seePassword
                  ? (inputType = "text")
                  : inputType
                : inputType
            }
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={200}
            autoFocus={autofocus}
            readOnly={readOnly}
            pattern={pattern}
            title={title}
            disabled={disabled}
            className="custom-input"
            style={{
              left: title !== "" ? "3vw" : title === "" ? "auto" : "10%",
              opacity: disabled ? "0.5" : "1",
              width:
                icon === "" && inputWidth !== "86%"
                  ? inputWidth
                  : icon !== "" && inputWidth !== "86%"
                  ? inputWidth
                  : "77%",
            }}
            onChange={(e) => onChange(e.target.value)}
            onClick={() => onClick()}
            onFocus={() => onFocus()}
            onBlur={() => onBlur()}
            onKeyDown={(event) => {
              if (event.key === "Enter" && id === "search") {
                onKeyDown();
              }
            }}
          />

          {placeholder === " " ? (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{
                maxWidth: label.length >= 20 ? "180px" : "150px",
                left: "auto",
              }}
            >
              {label.substring(0, 30)}
            </label>
          ) : (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{ opacity: "0" }}
            >
              {label.substring(0, 30)}
            </label>
          )}

          {icon === "" ? null : (
            <div
              className={
                useSearchClass
                  ? "search-container-password-icon"
                  : "container-password-icon"
              }
            >
              <img
                className="password-icon"
                src={
                  iconToTurn !== ""
                    ? disabled
                      ? iconToTurn
                      : seePassword || changeIcon
                      ? icon
                      : iconToTurn
                    : icon
                }
                onClick={() => {
                  onClickIcon();

                  if (iconToTurn !== "") {
                    setChangeIcon(!changeIcon);

                    if (seePassword !== null) {
                      setSeePassword(!seePassword);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : innerDefaultValue === undefined && value === undefined ? (
        <div
          className={
            disabled
              ? "custom-container-input-disabled"
              : "custom-container-input"
          }
          style={styleContainerInput}
        >
          <input
            id={id}
            ref={innerRef}
            required={required}
            type={
              inputType === "password"
                ? seePassword
                  ? (inputType = "text")
                  : inputType
                : inputType
            }
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={200}
            autoFocus={autofocus}
            readOnly={readOnly}
            pattern={pattern}
            title={title}
            disabled={disabled}
            className="custom-input"
            style={{
              left: title !== "" ? "auto" : "auto",
              opacity: disabled ? "0.5" : "1",
              width:
                icon === "" && inputWidth !== "86%"
                  ? inputWidth
                  : icon !== "" && inputWidth !== "86%"
                  ? inputWidth
                  : "77%",
            }}
            onChange={onChange}
            onClick={() => onClick()}
            onFocus={() => onFocus()}
            onBlur={() => onBlur()}
            onTouchEnd={onTouchEnd}
            onKeyDown={(event) => {
              if (event.key === "Enter" && id === "search") {
                onKeyDown();
              }
            }}
          />

          {placeholder === " " ? (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{
                maxWidth: label.length >= 20 ? "180px" : "150px",
                left: "auto",
              }}
            >
              {label.substring(0, 30)}
            </label>
          ) : (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{ opacity: "0" }}
            >
              {label.substring(0, 30)}
            </label>
          )}

          {icon === "" ? null : (
            <div
              className={
                useSearchClass
                  ? "search-container-password-icon"
                  : "container-password-icon"
              }
            >
              <img
                className="password-icon"
                src={
                  iconToTurn !== ""
                    ? disabled
                      ? iconToTurn
                      : seePassword || changeIcon
                      ? icon
                      : iconToTurn
                    : icon
                }
                onClick={(e) => {
                  if (disabled === false) {
                    onClickIcon(e);

                    if (iconToTurn !== "") {
                      setChangeIcon(!changeIcon);

                      if (seePassword !== null) {
                        setSeePassword(!seePassword);
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : innerDefaultValue !== undefined && value === undefined ? (
        <div
          className={
            disabled
              ? "custom-container-input-disabled"
              : "custom-container-input"
          }
          style={styleContainerInput}
        >
          <input
            id={id}
            defaultValue={innerDefaultValue}
            required={required}
            type={
              inputType === "password"
                ? seePassword
                  ? (inputType = "text")
                  : inputType
                : inputType
            }
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={200}
            autoFocus={autofocus}
            readOnly={readOnly}
            pattern={pattern}
            title={title}
            disabled={disabled}
            className="custom-input"
            style={{
              left: title !== "" ? "auto" : "auto",
              opacity: disabled ? "0.5" : "1",
              width:
                icon === "" && inputWidth !== "86%"
                  ? inputWidth
                  : icon !== "" && inputWidth !== "86%"
                  ? inputWidth
                  : "77%",
            }}
            onChange={(e) => onChange(e.target.value)}
            onClick={() => onClick()}
            onFocus={() => onFocus()}
            onBlur={() => onBlur()}
            onKeyDown={(event) => {
              if (event.key === "Enter" && id === "search") {
                onKeyDown();
              }
            }}
          />

          {placeholder === " " ? (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{
                maxWidth: label.length >= 20 ? "180px" : "150px",
                left: "auto",
              }}
            >
              {label.substring(0, 30)}
            </label>
          ) : (
            <label
              onClick={() => handleClickLabel(id)}
              className="custom-label"
              style={{ opacity: "0" }}
            >
              {label.substring(0, 30)}
            </label>
          )}

          {icon === "" ? null : (
            <div className="container-password-icon">
              <img
                className="password-icon"
                src={
                  iconToTurn !== ""
                    ? disabled
                      ? iconToTurn
                      : seePassword || changeIcon
                      ? icon
                      : iconToTurn
                    : icon
                }
                onClick={() => {
                  onClickIcon();

                  if (iconToTurn !== "") {
                    setChangeIcon(!changeIcon);

                    if (seePassword !== null) {
                      setSeePassword(!seePassword);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

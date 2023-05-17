import "../../pages/Chats/Chats.css";
import "./ChatList.css";

import moment from "moment";
import { useContext, useState } from "react";

import ChatllaForum from "../../assets/chatlla-forum.svg";
import Delete from "../../assets/delete.svg";
import DoneAll from "../../assets/done-all.svg";
import Person from "../../assets/person.svg";
import { AuthContext } from "../../context/AuthContext";
import { SmallLoading } from "../SmallLoading/SmallLoading";

export const ChatList = ({
  usersQuantity,
  usersPerPage,
  userActually,
  search,
  chats = [],
  listUsers = [],
  listUsersFiltered = [],
  alreadyCookies,
  imageProfile,
  cookies,
  viewportSize,
  startMessageRemoval,
  setStartMessageRemoval,
  toRemove,
  setToRemove,
  viewRecent,
  setViewRecent,
  viewAll,
  setViewAll,
  getAllUsers,
  handleStartConversation,
  handleInitiateChat,
  handleSeeMoreUsers,
  chatWarningRemoved,
  setChatWarningRemoved,
}) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const { currentUser } = useContext(AuthContext);
  const [showRemoved, setShowRemoved] = useState(false);

  const returnDateCalculation = (dateTime) => {
    const timeFormatPattern = "h:mm A";

    let comparisonDate = parseInt(
      moment(dateTime)
        .local()
        .diff(moment().local().format())
        .toString()
        .replace("-", "")
    );

    let comparisonDate2 = (comparisonDate / 60000).toFixed();
    let comparisonDate3 = (comparisonDate / 60000).toFixed();

    if (comparisonDate2 === "NaN") {
      comparisonDate2 = "";
    }

    //If the previously calculated difference is less than 1 minute
    if (comparisonDate3 < 1) {
      comparisonDate2 = "just now";
    }

    //If the difference is greater than or equal to 1 minute and less than 12 hours (720 minutes)
    if (comparisonDate3 >= 1 && comparisonDate3 < 720) {
      comparisonDate2 =
        "today at " + moment(dateTime).format(timeFormatPattern);
    }

    //If the difference is greater than or equal to 12 hours and less than 24 hours (1440 minutes)
    if (comparisonDate3 >= 720 && comparisonDate3 < 1440) {
      comparisonDate2 = "yesterday";
    }

    //If the difference is greater than or equal to 24 hours
    if (comparisonDate3 >= 1440) {
      comparisonDate2 = moment(dateTime).format("MMM Do YY");
    }

    return comparisonDate2;
  };

  const handleDragStart = (event) => {
    setStartX(event.clientX);
    setStartY(event.clientY);
  };

  const handleDragEnd = (event, item, index) => {
    const diffX = event.clientX - startX;
    const diffY = event.clientY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX <= 0) {
        handleStartMessageRemoval(index, "left");
      } else {
        startMessageRemoval ? handleStartMessageRemoval(index, "right") : null;
      }
    }
  };

  const handleStartMessageRemoval = (chatElement, direction) => {
    let element = document.getElementById(chatElement);

    let element2 = document.getElementById("remove" + chatElement);

    if (direction === "left" && viewportSize === "Desktop") {
      setStartMessageRemoval(true);

      element.style.transform = "translateX(-20px)";
      element2.style.transform = "translateX(40px)";
    } else if (direction === "left" && viewportSize !== "Desktop") {
      setStartMessageRemoval(true);

      element.style.transform = "translateX(-15px)";
      element2.style.transform = "translateX(25px)";
    } else {
      element.style.transform = "none";
      element2.style.transform = "translateX(80px)";
      setStartMessageRemoval(false);
    }
  };

  const handleRemoveChat = (chat, chatElement) => {
    let element = document.getElementById(chatElement);

    let element2 = document.getElementById("remove" + chatElement);

    if (confirm("You really want delete this chat message?")) {
      setToRemove(chat);
      element.style.transform = "none";
      element2.style.transform = "translateX(80px)";
    } else {
      element.style.transform = "none";
      element2.style.transform = "translateX(80px)";
    }
  };

  const allRemoved =
    chats.length > 0
      ? chats.filter(
          (item) =>
            item.removedByUserId !== currentUser.uid && item.remove === true
        )
      : null;

  const allNotRemoved =
    chats.length > 0
      ? chats.filter(
          (item) => item.removedByUserId === "" && item.remove === false
        )
      : null;

  const getProfileImage = (item) => {
    if (currentUser.uid !== item.userIdCreator) {
      if (item.imageProfile.includes("person")) {
        return Person;
      } else {
        return item.imageProfile;
      }
    } else {
      if (item.imageProfileReceiver.includes("person")) {
        return Person;
      } else {
        return item.imageProfileReceiver;
      }
    }
  };

  const getUserNameChat = (item) => {
    let chatName = "null";

    if (alreadyCookies) {
      if (item.chatName === cookies.userName) {
        chatName = item.senderName;
      } else {
        chatName = item.receiverName;
      }
    } else if (userActually !== null) {
      if (item.receiverName === userActually.userName) {
        chatName = item.receiverName;
      } else {
        chatName = item.senderName;
      }
    }

    return chatName;
  };

  let SwipeStartX,
    SwipestartY,
    dist,
    threshold = 100,
    allowedTime = 300,
    elapsedTime,
    startTime;

  const getSwipeDetection = (e) => {
    const touchobj = e.changedTouches[0];
    dist = 0;
    SwipeStartX = touchobj.pageX;
    SwipestartY = touchobj.pageY;
    startTime = new Date().getTime();
  };

  function handleSwipe(touchobj, chat, e, index) {
    dist = touchobj.pageX - SwipeStartX;
    elapsedTime = new Date().getTime() - startTime;
    const isRightSwipe =
      elapsedTime <= allowedTime &&
      dist >= threshold &&
      Math.abs(touchobj.pageY - SwipestartY) > 0;

    const isLeftSwipe =
      elapsedTime <= allowedTime && Math.abs(dist) >= threshold && dist < 0;

    if (isRightSwipe) {
      if (showRemoved && e.target.tagName !== "IMG") {
        handleStartMessageRemoval(index, "right");
      }
    } else if (isLeftSwipe) {
      handleStartMessageRemoval(index, "left");
      setShowRemoved(true);
    }
  }

  const getEndSwipeDetection = (e, chat, index) => {
    const touchobj = e.changedTouches[0];
    handleSwipe(touchobj, chat, e, index);
  };

  const getUserStatus = (item) => {
    let logged = false;

    let dateComparisonResult = compareDates(item.uptime, 10, "minutes");
    dateComparisonResult ? (logged = false) : (logged = true);

    return logged;
  };

  const compareDates = (inputDate, amount, unit) => {
    const newDate = moment(inputDate);

    const diff = moment(new Date()).diff(newDate, "minutes");

    //The difference between the dates is greater than 10 minutes
    if (diff > 10) {
      return true;
    } else {
      //The difference between the dates is less than or equal to 10 minutes
      return false;
    }
  };

  return (
    <>
      {viewportSize === "Desktop" ? (
        chats.length > 0 ? (
          <div className="large-desktop-chats-container">
            {chats.map((item, index) => {
              if (item.remove === false && item.removedByUserId === "")
                return (
                  <div
                    id={index}
                    key={index}
                    draggable="true"
                    onDragStart={handleDragStart}
                    onDragEnd={(event) => handleDragEnd(event, item, index)}
                    style={{ width: "45vw", transition: "all 400ms" }}
                  >
                    <div
                      className="chat-item"
                      style={{
                        cursor:
                          item.senderName !== "Unknown" &&
                          item.receiverName !== "Unknown"
                            ? "pointer"
                            : "not-allowed",
                        backgroundColor:
                          item.senderName !== "Unknown" &&
                          item.receiverName !== "Unknown"
                            ? "#fbfbfb"
                            : "#d9d9d9",
                        opacity:
                          item.senderName !== "Unknown" &&
                          item.receiverName !== "Unknown"
                            ? "1"
                            : ".5",
                      }}
                    >
                      <div
                        className="chat-item-profile-image-container"
                        onClick={() => {
                          if (
                            item.senderName !== "Unknown" &&
                            item.receiverName !== "Unknown"
                          ) {
                            handleStartConversation(item);
                          } else {
                            setChatWarningRemoved(true);
                          }
                        }}
                      >
                        <img
                          src={getProfileImage(item)}
                          className="chat-item-profile-image"
                        ></img>

                        <div className="chat-item-body-status">
                          <div
                            className="chat-item-status"
                            style={{
                              backgroundColor: item.logged
                                ? "lightgreen"
                                : "#7a7a7a",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div
                        className="chat-item-username-container"
                        onClick={() => {
                          if (
                            item.senderName !== "Unknown" &&
                            item.receiverName !== "Unknown"
                          ) {
                            handleStartConversation(item);
                          } else {
                            setChatWarningRemoved(true);
                          }
                        }}
                      >
                        <label
                          className="chat-item-username"
                          style={{
                            color: "#000000",
                            cursor:
                              item.senderName !== "Unknown" &&
                              item.receiverName !== "Unknown"
                                ? "pointer"
                                : "not-allowed",
                          }}
                        >
                          {getUserNameChat(item)}
                        </label>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "90%",
                            minHeight: "1vh",
                            justifyContent: "space-between",
                          }}
                        >
                          <label
                            className="chat-item-last-message"
                            style={{
                              minWidth: "32vw",
                              width: "32vw",
                              paddingRight: "5px",
                              fontSize: "13px",
                              cursor:
                                item.senderName !== "Unknown" &&
                                item.receiverName !== "Unknown"
                                  ? "pointer"
                                  : "not-allowed",
                            }}
                          >
                            {item.lastMessage.startsWith("data:image")
                              ? "📷"
                              : item.lastMessage}
                          </label>
                        </div>

                        <div
                          className="chat-item-datetime"
                          style={{
                            fontSize: "10px",
                            textAlign: "right",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            width: "90%",
                            color: "#808080",
                            paddingLeft: "5px",
                          }}
                        >
                          <img
                            src={DoneAll}
                            style={{
                              width: "12px",
                              height: "12px",
                              paddingRight: "2px",
                            }}
                          ></img>

                          <label
                            className="chat-item-last-message"
                            style={{
                              fontSize: "10px",
                              textAlign: "right",
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "flex-end",
                              color: "#808080",
                              width: "auto",
                            }}
                          >
                            {" "}
                            {returnDateCalculation(item.lastMessageDateTime)}
                          </label>
                        </div>
                      </div>

                      <img
                        id={"remove" + index}
                        src={Delete}
                        onClick={() => handleRemoveChat(item, index)}
                        style={{ transform: "translateX(80px)" }}
                      ></img>
                    </div>
                    <br />
                    <br />
                  </div>
                );
            })}
            {allRemoved.length > 0 ? (
              allRemoved.map((item, index) => {
                return (
                  <div
                    id={index}
                    key={index}
                    draggable="true"
                    onDragStart={handleDragStart}
                    onDragEnd={(event) => handleDragEnd(event, item, index)}
                    style={{ width: "45vw", transition: "all 400ms" }}
                  >
                    <div
                      className="chat-item"
                      onClick={() => handleStartConversation(item)}
                    >
                      <div className="chat-item-profile-image-container">
                        <img
                          src={getProfileImage(item)}
                          className="chat-item-profile-image"
                        ></img>

                        <div className="chat-item-body-status">
                          <div
                            className="chat-item-status"
                            style={{
                              backgroundColor: item.logged
                                ? "lightgreen"
                                : "#7a7a7a",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="chat-item-username-container">
                        <label
                          className="chat-item-username"
                          style={{ color: "#000000" }}
                        >
                          {getUserNameChat(item)}
                        </label>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "90%",
                            minHeight: "1vh",
                            justifyContent: "space-between",
                          }}
                        >
                          <label
                            className="chat-item-last-message"
                            style={{
                              minWidth: "32vw",
                              width: "32vw",
                              paddingRight: "5px",
                              fontSize: "13px",
                            }}
                          >
                            {item.lastMessage.startsWith("data:image")
                              ? "📷"
                              : item.lastMessage}
                          </label>
                        </div>

                        <div
                          className="chat-item-datetime"
                          style={{
                            fontSize: "10px",
                            textAlign: "right",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            width: "90%",
                            color: "#808080",
                            paddingLeft: "5px",
                          }}
                        >
                          <img
                            src={DoneAll}
                            style={{
                              width: "12px",
                              height: "12px",
                              paddingRight: "2px",
                            }}
                          ></img>

                          <label
                            className="chat-item-last-message"
                            style={{
                              fontSize: "10px",
                              textAlign: "right",
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "flex-end",
                              color: "#808080",
                              width: "auto",
                            }}
                          >
                            {" "}
                            {returnDateCalculation(item.lastMessageDateTime)}
                          </label>
                        </div>
                      </div>

                      <img
                        id={"remove" + index}
                        src={Delete}
                        onClick={() => handleRemoveChat(item, index)}
                        style={{ transform: "translateX(80px)" }}
                      ></img>
                    </div>
                    <br />
                    <br />
                  </div>
                );
              })
            ) : allNotRemoved <= 0 ? (
              <div
                className="chats-container"
                style={{
                  justifyContent: "center",
                  backgroundColor: "#ffffff",
                  height: "100%",
                  zIndex: 2,
                }}
              >
                <h4
                  className="chat-item-username"
                  style={{
                    fontWeight: "500",
                    width: "100%",
                    textAlign: "center",
                    marginTop: "0",
                  }}
                >
                  Hey!
                </h4>

                <h5
                  style={{
                    fontWeight: "500",
                    width: "86%",
                    textAlign: "center",
                    color: "#808080",
                    marginTop: "0",
                  }}
                >
                  It seems like there are no recent conversations here. How
                  about starting a new one?
                </h5>

                <img
                  src={ChatllaForum}
                  style={{ width: "16vw", height: "13vw" }}
                ></img>

                <div
                  style={{
                    display: "flex",
                    height: "10%",
                    alignItems: "flex-end",
                  }}
                >
                  <button
                    className="login-button"
                    style={{ backgroundColor: "#92CDC8" }}
                    onClick={() => {
                      setViewAll(true);
                      setViewRecent(false);
                      getAllUsers();
                    }}
                  >
                    Start a conversation
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : listUsers.length > 0 ? (
          <div className="large-desktop-chats-container">
            {listUsers.map((item, index) => {
              return (
                <div key={index} style={{ width: "45vw" }}>
                  <div
                    className="chat-item"
                    onClick={() => {
                      handleInitiateChat(item);
                    }}
                  >
                    <div className="chat-item-profile-image-container">
                      <img
                        src={getProfileImage(item)}
                        className="chat-item-profile-image"
                      ></img>
                      <div className="chat-item-body-status ">
                        <div
                          className="chat-item-status"
                          style={{
                            backgroundColor: getUserStatus(item)
                              ? "lightgreen"
                              : "#7a7a7a",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="chat-item-username-container">
                      <label className="chat-item-username">
                        {item.userName}
                      </label>

                      <div
                        style={{
                          width: "88%",
                          height: "1px",
                          margin: "0.5vw 0",
                          backgroundColor: "transparent",
                          borderBottom: "1px dotted #d9d9d9",
                        }}
                      ></div>

                      <label
                        className="chat-item-username"
                        style={{
                          fontSize: "10px",
                          textAlign: "right",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          color: "#808080",
                          paddingLeft: "5px",
                        }}
                      >
                        last seen {returnDateCalculation(item.uptime)}
                      </label>
                    </div>
                    <br />
                  </div>
                  <br />
                </div>
              );
            })}

            {listUsers.length !== usersQuantity - 1 ? (
              <button
                className="login-button"
                style={{
                  backgroundColor: viewRecent ? "#D88DB6" : "#ffffff",
                  color: viewRecent ? "#ffffff" : "#D88DB6",
                  width: "20vw",
                }}
                onClick={async () => {
                  await handleSeeMoreUsers(usersPerPage);
                }}
              >
                See more
              </button>
            ) : null}
          </div>
        ) : search && viewAll && listUsersFiltered.length === 0 ? (
          <div className="large-desktop-chats-container">
            <h3
              className="chat-item-username"
              style={{
                fontSize: "13px",
                fontWeight: "500",
                width: "86%",
                textAlign: "center",
                marginTop: 0,
              }}
            >
              No users found. Please try again.
            </h3>

            <br />

            <div style={{ width: "45vw" }}>
              <div
                className="chat-item"
                style={{ cursor: "not-allowed", opacity: 0.5 }}
              >
                <div className="chat-item-profile-image-container">
                  <img src={Person} className="chat-item-profile-image" />
                </div>
              </div>
            </div>

            <br />
            <div style={{ width: "45vw" }}>
              <div
                className="chat-item"
                style={{ cursor: "not-allowed", opacity: 0.5 }}
              >
                <div className="chat-item-profile-image-container">
                  <img src={Person} className="chat-item-profile-image" />
                </div>
              </div>
            </div>
            <br />
            <div style={{ width: "45vw" }}>
              <div
                className="chat-item"
                style={{ cursor: "not-allowed", opacity: 0.5 }}
              >
                <div className="chat-item-profile-image-container">
                  <img src={Person} className="chat-item-profile-image" />
                </div>
              </div>
            </div>

            <br />
          </div>
        ) : search && viewAll && listUsersFiltered.length > 0 ? (
          <div className="large-desktop-chats-container">
            {listUsersFiltered.map((item, index) => {
              return (
                <div key={index} style={{ width: "45vw" }}>
                  <div
                    className="chat-item"
                    onClick={() => {
                      handleInitiateChat(item);
                    }}
                  >
                    <div className="chat-item-profile-image-container">
                      <img
                        src={item.imageProfile}
                        className="chat-item-profile-image"
                      ></img>
                      <div className="chat-item-body-status ">
                        <div
                          className="chat-item-status"
                          style={{
                            backgroundColor: item.logged
                              ? "lightgreen"
                              : "#7a7a7a",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="chat-item-username-container">
                      <label className="chat-item-username">
                        {item.userName}
                      </label>

                      <div
                        style={{
                          width: "88%",
                          height: "1px",
                          backgroundColor: "transparent",
                          margin: "0.5vw 0",
                          borderBottom: "1px dotted #d9d9d9",
                        }}
                      ></div>

                      <label
                        className="chat-item-username"
                        style={{
                          fontSize: "10px",
                          textAlign: "right",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          color: "#808080",
                          paddingLeft: "5px",
                        }}
                      >
                        last seen {returnDateCalculation(item.uptime)}
                      </label>
                    </div>
                    <br />
                  </div>
                  <br />
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%", marginTop: "20%" }}>
            <SmallLoading></SmallLoading>
          </div>
        )
      ) : chats.length > 0 ? (
        <div className="large-desktop-chats-container">
          {chats.map((item, index) => {
            if (item.remove === false && item.removedByUserId === "")
              return (
                <div
                  id={index}
                  key={index}
                  draggable="true"
                  onTouchStart={getSwipeDetection}
                  onTouchEnd={(e) => getEndSwipeDetection(e, item, index)}
                  style={{
                    padding: "0 4vw",
                    width: "90vw",
                    transition: "all 400ms",
                  }}
                >
                  <div
                    className="chat-item"
                    style={{
                      backgroundColor:
                        item.senderName !== "Unknown" &&
                        item.receiverName !== "Unknown"
                          ? "#fbfbfb"
                          : "#d9d9d9",
                      opacity:
                        item.senderName !== "Unknown" &&
                        item.receiverName !== "Unknown"
                          ? "1"
                          : ".5",
                    }}
                  >
                    <div
                      className="chat-item-profile-image-container"
                      onClick={() => {
                        if (
                          item.senderName !== "Unknown" &&
                          item.receiverName !== "Unknown"
                        ) {
                          handleStartConversation(item);
                        } else {
                          setChatWarningRemoved(true);
                        }
                      }}
                    >
                      <img
                        src={getProfileImage(item)}
                        className="chat-item-profile-image"
                      ></img>

                      <div
                        className="chat-item-body-status"
                        style={{ backgroundColor: "#d9d9d9" }}
                      >
                        <div
                          className="chat-item-status"
                          style={{
                            backgroundColor: item.logged
                              ? "lightgreen"
                              : "#7a7a7a",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div
                      className="chat-item-username-container"
                      onClick={() => {
                        if (
                          item.senderName !== "Unknown" &&
                          item.receiverName !== "Unknown"
                        ) {
                          handleStartConversation(item);
                        } else {
                          setChatWarningRemoved(true);
                        }
                      }}
                    >
                      <label
                        className="chat-item-username"
                        style={{ color: "#000000" }}
                      >
                        {getUserNameChat(item)}
                      </label>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          width: "90%",
                          minHeight: "1vh",
                          justifyContent: "space-between",
                        }}
                      >
                        <label
                          className="chat-item-last-message"
                          style={{
                            minWidth: "60vw",
                            width: "60vw",
                            paddingRight: "5px",
                            fontSize: "13px",
                          }}
                        >
                          {item.lastMessage.startsWith("data:image")
                            ? "📷"
                            : item.lastMessage}
                        </label>
                      </div>

                      <div
                        className="chat-item-datetime"
                        style={{
                          fontSize: "10px",
                          textAlign: "right",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          width: "90%",
                          color: "#808080",
                          paddingLeft: "5px",
                        }}
                      >
                        <img
                          src={DoneAll}
                          style={{
                            width: "12px",
                            height: "12px",
                            paddingRight: "2px",
                          }}
                        ></img>

                        <label
                          className="chat-item-last-message"
                          style={{
                            fontSize: "10px",
                            textAlign: "right",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            color: "#808080",
                            width: "auto",
                          }}
                        >
                          {" "}
                          {returnDateCalculation(item.lastMessageDateTime)}
                        </label>
                      </div>
                    </div>

                    <img
                      id={"remove" + index}
                      src={Delete}
                      onClick={() => handleRemoveChat(item, index)}
                      style={{ transform: "translateX(80px)" }}
                    ></img>
                  </div>
                  <br />
                </div>
              );
          })}
          {allRemoved.length > 0 ? (
            allRemoved.map((item, index) => {
              return (
                <div
                  id={index}
                  key={index}
                  draggable="true"
                  onTouchStart={getSwipeDetection}
                  onTouchEnd={(e) => getEndSwipeDetection(e, item, index)}
                  style={{
                    padding: "0 4vw",
                    width: "90vw",
                    transition: "all 400ms",
                  }}
                >
                  <div
                    className="chat-item"
                    onClick={() => handleStartConversation(item)}
                  >
                    <div className="chat-item-profile-image-container">
                      <img
                        src={getProfileImage(item)}
                        className="chat-item-profile-image"
                      ></img>

                      <div className="chat-item-body-status">
                        <div
                          className="chat-item-status"
                          style={{
                            backgroundColor:
                              item.logged &&
                              returnDateCalculation(item.uptime).includes(
                                "today at"
                              )
                                ? "lightgreen"
                                : "#7a7a7a",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="chat-item-username-container">
                      <label
                        className="chat-item-username"
                        style={{ color: "#000000" }}
                      >
                        {getUserNameChat(item)}
                      </label>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          width: "90%",
                          minHeight: "1vh",
                          justifyContent: "space-between",
                        }}
                      >
                        <label
                          className="chat-item-last-message"
                          style={{
                            minWidth: "32vw",
                            width: "32vw",
                            paddingRight: "5px",
                            fontSize: "13px",
                          }}
                        >
                          {item.lastMessage.startsWith("data:image")
                            ? "📷"
                            : item.lastMessage}
                        </label>
                      </div>

                      <div
                        className="chat-item-datetime"
                        style={{
                          fontSize: "10px",
                          textAlign: "right",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          width: "90%",
                          color: "#808080",
                          paddingLeft: "5px",
                        }}
                      >
                        <img
                          src={DoneAll}
                          style={{
                            width: "12px",
                            height: "12px",
                            paddingRight: "2px",
                          }}
                        ></img>

                        <label
                          className="chat-item-last-message"
                          style={{
                            fontSize: "10px",
                            textAlign: "right",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            color: "#808080",
                            width: "auto",
                          }}
                        >
                          {" "}
                          {returnDateCalculation(item.lastMessageDateTime)}
                        </label>
                      </div>
                    </div>

                    <img
                      id={"remove" + index}
                      src={Delete}
                      onClick={() => handleRemoveChat(item, index)}
                      style={{ transform: "translateX(80px)" }}
                    ></img>
                  </div>
                  <br />
                </div>
              );
            })
          ) : allNotRemoved <= 0 ? (
            <div
              className="chats-container"
              style={{
                backgroundColor: "#ffffff",
                height: "100%",
                zIndex: 2,
              }}
            >
              <h4
                className="chat-item-username"
                style={{
                  fontWeight: "500",
                  width: "100%",
                  textAlign: "center",
                  marginTop: "0",
                }}
              >
                Hey!
              </h4>

              <h5
                style={{
                  fontWeight: "500",
                  width: "86%",
                  textAlign: "center",
                  color: "#808080",
                  marginTop: "0",
                  marginBottom: "0",
                }}
              >
                It seems like there are no recent conversations here. How about
                starting a new one?
              </h5>

              <img
                src={ChatllaForum}
                style={{ width: "45vw", height: "48vw" }}
              ></img>

              <div
                style={{
                  display: "flex",
                  height: "10%",
                  alignItems: "flex-end",
                }}
              >
                <button
                  className="login-button"
                  style={{ backgroundColor: "#92CDC8" }}
                  onClick={() => {
                    setViewAll(true);
                    setViewRecent(false);
                    getAllUsers();
                  }}
                >
                  Start a conversation
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : listUsers.length > 0 ? (
        <div className="large-desktop-chats-container">
          {listUsers.map((item, index) => {
            return (
              <div key={index} style={{ padding: "0 4vw", width: "90vw" }}>
                <div
                  className="chat-item"
                  onClick={() => {
                    handleInitiateChat(item);
                  }}
                >
                  <div className="chat-item-profile-image-container">
                    <img
                      src={getProfileImage(item)}
                      className="chat-item-profile-image"
                    ></img>
                    <div
                      className="chat-item-body-status"
                      style={{ backgroundColor: "#d9d9d9" }}
                    >
                      <div
                        className="chat-item-status"
                        style={{
                          backgroundColor: getUserStatus(item)
                            ? "lightgreen"
                            : "#7a7a7a",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="chat-item-username-container">
                    <label className="chat-item-username">
                      {item.userName}
                    </label>

                    <div
                      style={{
                        width: "88%",
                        height: "1px",
                        margin: "0.5vw 0",
                        backgroundColor: "transparent",
                        borderBottom: "1px dotted #d9d9d9",
                      }}
                    ></div>

                    <label
                      className="chat-item-username"
                      style={{
                        fontSize: "10px",
                        textAlign: "right",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        color: "#808080",
                        paddingLeft: "5px",
                      }}
                    >
                      last seen {returnDateCalculation(item.uptime)}
                    </label>
                  </div>
                  <br />
                </div>
                <br />
              </div>
            );
          })}

          {listUsers.length !== usersQuantity - 1 ? (
            <button
              className="login-button"
              style={{
                backgroundColor: viewRecent ? "#D88DB6" : "#ffffff",
                color: viewRecent ? "#ffffff" : "#D88DB6",
                width: "40vw",
              }}
              onClick={async () => {
                await handleSeeMoreUsers(usersPerPage);
              }}
            >
              See more
            </button>
          ) : null}
        </div>
      ) : search && viewAll && listUsersFiltered.length === 0 ? (
        <div className="large-desktop-chats-container">
          <h3
            className="chat-item-username"
            style={{
              fontSize: "13px",
              fontWeight: "500",
              width: "86%",
              textAlign: "center",
              marginTop: 0,
              color: "#000",
            }}
          >
            No users found. Please try again.
          </h3>

          <br />

          <div style={{ width: "90vw" }}>
            <div
              className="chat-item"
              style={{ cursor: "not-allowed", opacity: 0.5 }}
            >
              <div className="chat-item-profile-image-container">
                <img src={Person} className="chat-item-profile-image" />
              </div>
            </div>
          </div>

          <br />
          <div style={{ width: "90vw" }}>
            <div
              className="chat-item"
              style={{ cursor: "not-allowed", opacity: 0.5 }}
            >
              <div className="chat-item-profile-image-container">
                <img src={Person} className="chat-item-profile-image" />
              </div>
            </div>
          </div>
          <br />
          <div style={{ width: "90vw" }}>
            <div
              className="chat-item"
              style={{ cursor: "not-allowed", opacity: 0.5 }}
            >
              <div className="chat-item-profile-image-container">
                <img src={Person} className="chat-item-profile-image" />
              </div>
            </div>
          </div>

          <br />
        </div>
      ) : search && viewAll && listUsersFiltered.length > 0 ? (
        <div className="large-desktop-chats-container">
          {listUsersFiltered.map((item, index) => {
            return (
              <div
                key={index}
                style={{ width: "90vw", transition: "all 400ms" }}
              >
                <div
                  className="chat-item"
                  onClick={() => {
                    handleInitiateChat(item);
                  }}
                >
                  <div className="chat-item-profile-image-container">
                    <img
                      src={item.imageProfile}
                      className="chat-item-profile-image"
                    ></img>
                    <div
                      className="chat-item-body-status"
                      style={{ backgroundColor: "#d9d9d9" }}
                    >
                      <div
                        className="chat-item-status"
                        style={{
                          backgroundColor: item.logged
                            ? "lightgreen"
                            : "#7a7a7a",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="chat-item-username-container">
                    <label className="chat-item-username">
                      {item.userName}
                    </label>

                    <div
                      style={{
                        width: "88%",
                        height: "1px",
                        backgroundColor: "transparent",
                        margin: "0.5vw 0",
                        borderBottom: "1px dotted #d9d9d9",
                      }}
                    ></div>

                    <label
                      className="chat-item-username"
                      style={{
                        fontSize: "10px",
                        textAlign: "right",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        color: "#808080",
                        paddingLeft: "5px",
                      }}
                    >
                      last seen {returnDateCalculation(item.uptime)}
                    </label>
                  </div>
                  <br />
                </div>
                <br />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="small-Loading-container">
          <SmallLoading />
        </div>
      )}
    </>
  );
};

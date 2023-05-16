import "./Channel.css";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

import ArrowBack from "../../assets/chevron-left.svg";
import More from "../../assets/more-vertic.svg";
import Person from "../../assets/person.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";
import { Avatar } from "../../components/Avatar/Avatar";
import { FullImageView } from "../../components/FullImageView/FullImageView";
import InputController from "../../components/InputController/InputController";
import { database } from "../../firebase/firebaseInitialize";
import { handleLocationStateCheck } from "../../utils/utils";

export const Channel = ({
  userIdChatting = "",
  userNameChatting = "",
  userImageProfileChatting = "",
  chatIdNow = "",
  chatName,
  userId = "",
  userName = "",
  userImageProfile,
  closeChannel = () => {},
  removeListener,
  remove = false,
  removedByUserId = "",
  removedDateTime = "",
  windowSize = undefined,
  online,
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [nameUser, setNameUser] = useState("");
  const [infoUserTalking, setInfoUserTalking] = useState([]);
  const [chatId, setChatId] = useState(0);
  const [openProfileImage, setOpenProfileImage] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [textAreaIsFocused, setTextAreaIsFocused] = useState(false);
  const [counter, setCounter] = useState(0);
  const [fullImageView, setFullImageView] = useState(false);
  const [fullImageViewToRender, setFullImageViewToRender] = useState("");
  const [userIdActually, setUserIdActually] = useState(null);
  const [showMenuChannel, setShowMenuChannel] = useState(false);
  const [lastMessageQuantity, setLastMessageQuantity] = useState(0);
  const [userActually, setUserActually] = useState(null);
  const [userTimeActivity, setUserTimeActivity] = useState("");
  const navigate = useNavigate();
  const [updateChats, setUpdateChats] = useState(false);
  const cookies = new Cookies();
  const location = useLocation();
  const DateFormatPattern = " h:mm A | MMM Do ";
  const cardRef = useRef();

  const getCookies = {
    userName: cookies.get("userName"),
    userId: cookies.get("userId"),
    uptime: cookies.get("uptime"),
  };

  useEffect(() => {
    let element = document.getElementById("ul");
    element.scrollTop = element.scrollHeight;
  }, [messages]);

  let messagesList = [];
  let messagesForAdd = null;
  let listenerToStop = null;

  useEffect(() => {
    if (removeListener === false || removeListener === undefined) {
      const dbRef = collection(database, "messages");
      const q = query(dbRef, where("chatId", "==", chatIdNow));

      let result = { messageId: "" };
      let result2 = null;

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docs.map((doc) => {
          if (userIdActually !== removedByUserId) {
            result2 = doc.data();
            result = { messageId: doc.id };
            let result3 = { ...result, ...result2 };
            messagesList.push(result3);
          } else {
            if (moment(removedDateTime).isBefore(doc.data().createdAt)) {
              result2 = doc.data();
              result = { messageId: doc.id };
              let result3 = { ...result, ...result2 };
              messagesList.push(result3);
            }
          }
        });

        messagesForAdd = messagesList.sort(sortFunction);
        setMessages(messagesForAdd);

        if (messagesForAdd.length > 0) {
          separateMessagesToBeRemoved(messagesForAdd);
        } else {
          setFullImageViewToRender("");
        }

        messagesList = [];
        messagesForAdd = null;
      });

      if (removeListener === true) {
        unsubscribe();
      }

      return () => {
        unsubscribe();
      };
    }
  }, [database, removeListener, chatIdNow]);

  const Mount = async () => {
    let response = await handleLocationStateCheck(location.state);
    let itemToCompare = null;

    if (getCookies.userId !== undefined) {
      itemToCompare = getCookies.userId;
      setNameUser(getCookies.userName);
    }
    if (userId !== "" && userName !== "") {
      itemToCompare = userId;
      setNameUser(userName);
    }

    setUserIdActually(itemToCompare);
    let chatIdReturned = "";

    if (!!location.state) {
      if (!!location.state.chatId) {
        setChatId(location.state.chatId);
        chatIdReturned = location.state.chatId;
      } else {
        setChatId(chatIdNow);
        chatIdReturned = chatIdNow;
      }
    }

    let userChatting = {
      userIdChatting: "",
      userNameChatting: "",
      imageProfileChatting: "",
    };

    userChatting.userIdChatting = userIdChatting;
    userChatting.userNameChatting = userNameChatting;
    userChatting.imageProfileChatting = userImageProfileChatting;
    setInfoUserTalking(userChatting);
  };

  useEffect(() => {
    Mount();
  }, []);

  function sortFunction(a, b) {
    var dateA = new Date(a.createdAt).getTime();
    var dateB = new Date(b.createdAt).getTime();
    return dateA > dateB ? 1 : -1;
  }

  function theDiffDate(date2) {
    return parseInt(
      moment(date2).diff(moment().format()).toString().replace("-", "")
    );
  }

  const separateMessagesToBeRemoved = (messagesList) => {
    let messagesIdsToRemove = [];

    messagesList.map((item) => {
      if (parseInt((theDiffDate(item.createdAt) / 60000).toFixed()) > 5) {
        messagesIdsToRemove.push(item.messageId);
      }
    });

    messagesIdsToRemove.map((messageIdToRemove) => {
      removeMessage(messageIdToRemove);
    });

    messagesIdsToRemove = [];
  };

  const removeMessage = async (messageIndex) => {
    const docRef = doc(database, "messages", messageIndex);

    let result = await deleteDoc(docRef);
  };

  const handleSubmit = async (e) => {
    if (message !== "") {
      if (
        remove &&
        removedByUserId === userIdActually &&
        updateChats === false
      ) {
        setUpdateChats(true);
        alert("update");
        const chatRef = doc(database, "chats", chatIdNow);

        await updateDoc(chatRef, {
          remove: false,
          removedDateTime: "",
          removedByUserId: "",
        });
      }

      const trimmedMessage = message.trim();
      const messagesRef = await addDoc(collection(database, "messages"), {
        chatId: chatIdNow,
        senderUserId: userIdActually,
        receiverUserId:
          infoUserTalking !== null ? infoUserTalking.userIdChatting : "",
        message: trimmedMessage,
        senderName: nameUser,
        createdAt: moment().format(),
      });

      setLastMessageQuantity(lastMessageQuantity + 1);

      handleUpdateLastMessage(trimmedMessage);

      setTextAreaIsFocused(false);

      setMessage("");

      return true;
    } else {
      return false;
    }
  };

  const handleTextChange = ({ target }) => {
    const { value } = target;
    setMessage(value);
  };

  const showMoreText = (target, message, index) => {
    let arr = target.target.offsetParent.childNodes;

    if (arr[0].textContent !== message) {
      target.target.textContent = "See less";

      arr[0].textContent = message;

      setShowMore(true);

      arr = null;
    }

    if (arr[0].textContent === message || arr === null) {
     
      target.target.textContent = "See more";
      arr[0].textContent = message.substring(0, 200);

      setShowMore(false);
      arr = null;
    }
  };

  const handleFocusTextArea = (focused) => {
    handle();

    setTextAreaIsFocused(focused);
  };

  const handle = () => {
    setCounter(counter + 1);

    let textAreaElement = document.getElementById("input-message");

    if (
      counter === 0 &&
      textAreaElement.classList.item(0) === "input-message"
    ) {
      textAreaElement.classList.remove("input-message");
      textAreaElement.classList.add("input-message-expanded");
    }
    if (
      counter === 1 &&
      textAreaElement.classList.item(0) === "input-message-expanded"
    ) {
      textAreaElement.classList.remove("input-message-expanded");
      textAreaElement.classList.add("input-message");

      setCounter(0);
    }
  };

  const callFunction = (img) => {
    return new Promise((resolve, reject) => {
      img.onload = () => {
        resolve(true);
      };
    });
  };

  const compressImage = async (blobImg, percent) => {
    let img = new Image();
    img.src = URL.createObjectURL(blobImg);
    await callFunction(img);
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = img.width * 0.5;
    canvas.height = img.height * 0.5;

    ctx.drawImage(img, 0, 0, img.width * 0.5, img.height * 0.5);
    let dataUrl = canvas.toDataURL("image/jpeg", percent / 100);

    return dataUrl;
  };

  const handleImage = async (e) => {
    let imageFileText = null;
    var file = e.target.files[0];

    let imgCompressed = await compressImage(file, 40);
    const trimmedMessage = imgCompressed;
    const messagesRef = await addDoc(collection(database, "messages"), {
      chatId: chatIdNow,
      senderUserId: userIdActually,
      receiverUserId:
        infoUserTalking !== null ? infoUserTalking.userIdChatting : "",
      message: trimmedMessage,
      senderName: nameUser,
      createdAt: moment().format(),
    });

    handleUpdateLastMessage(trimmedMessage);
  };

  const handleShowMenuChannel = () => {
    setShowMenuChannel(!showMenuChannel);
  };

  const handleGetChat = async () => {
    const chatRef = doc(database, "chats", chatIdNow);

    const querySnapshot = await getDoc(chatRef);

    let result = querySnapshot.data();

    return result;
  };

  const handleRemoveChat = async () => {
    let result = await handleGetChat();

    if (confirm("You really want delete this chat?")) {
      if (result.remove === true) {
        const chatRef = doc(database, "chats", chatIdNow);
        await deleteDoc(chatRef);

      } else {
        const chatRef = doc(database, "chats", chatIdNow);

        await updateDoc(chatRef, {
          remove: true,
          removedDateTime: moment().format(),
          removedByUserId: userIdActually,
        });
      }

      closeChannel();
    } else {
      alert("Chat already exists");
    }
  };

  const uptimeCheckControl = async () => {
    if (getCookies.userId !== null) {
      const userRef = doc(database, "users", getCookies.userId);

      await updateDoc(userRef, {
        uptime: moment().format(),
        logged: true,
      });

      cookies.set("uptime", moment().format(), {
        path: "/",
        domain: import.meta.env.PUBLIC_URL,
      });
    } else {
      const userRef = doc(database, "users", userActually.userId);

      await updateDoc(userRef, {
        uptime: moment().format(),
        logged: true,
      });

      cookies.set("uptime", moment().format(), {
        path: "/",
        domain: import.meta.env.PUBLIC_URL,
      });
    }
  };

  const handleUpdateLastMessage = async (trimmedMessage) => {
    if (lastMessageQuantity === 0) {
      await uptimeCheckControl();
      const chatRef = doc(database, "chats", chatIdNow);
      await updateDoc(chatRef, {
        lastMessage: trimmedMessage,
        lastMessageDateTime: moment().format(),
      });
    }
    if (lastMessageQuantity === 9) {
      await uptimeCheckControl();

      const chatRef = doc(database, "chats", chatIdNow);

      await updateDoc(chatRef, {
        lastMessage: trimmedMessage,
        lastMessageDateTime: moment().format(),
      });

      setLastMessageQuantity(0);
    }
  };

  const createLink = (linkString) => {
    return (
      <p>
        <a href={linkString}>{linkString}</a>
      </p>
    );
  };

  return (
    <AbstractBackground
      className="channel"
      removeRightTopAbstractForm={true}
      removeRightBottomAbstractForm={true}
      removeLeftBottomAbstractForm={true}
      removeLeftTopAbstractForm={true}
      onTouchMove={() => {
        setShowMenuChannel(false);
      }}
    >
      <div
        style={{ position: windowSize !== "Desktop" ? "fixed" : "relative" }}
        className="profile-header"
      >
        {windowSize !== "Desktop" ? (
          <button className="channel-go-back-button">
            <img
              src={ArrowBack}
              className="channel-image-go-back-button"
              onClick={closeChannel}
            ></img>
          </button>
        ) : null}

        <div
          className="profile-header-image"
          style={{
            paddingLeft: windowSize !== "Desktop" ? 0 : "2vw",
            width: windowSize?.orientation === "landscape" ? "85%" : "auto",
          }}
        >
          <div
            className="profile-image-container"
            onClick={() => setOpenProfileImage(!openProfileImage)}
          >
            {userImageProfileChatting !== null ? (
              <>
                <img
                  src={
                    userImageProfileChatting === "/src/assets/person.svg"
                      ? Person
                      : userImageProfileChatting
                  }
                  className="profile-image"
                ></img>
                <div className="chat-item-body-status">
                  <div
                    className="chat-item-status"
                    style={{
                      backgroundColor: online ? "lightgreen" : "#7a7a7a",
                    }}
                  ></div>
                </div>
              </>
            ) : (
              <Avatar
                avatarBackgroundColor={"#ffffff"}
                frameBackgroundColor={"#d9d9d9"}
                frameBodyBackgroundColor={"#ffffff"}
              ></Avatar>
            )}
          </div>

          <h2
            className="userName"
            style={{
              width: "80%",
              fontSize: "20px",
              minWidth: windowSize === "Desktop" ? "80px" : "240px",
              maxWidth: windowSize === "Desktop" ? "200px" : "80%",
              paddingLeft: windowSize === "Desktop" ? "auto" : "2%",
            }}
          >
            {userNameChatting}
          </h2>
        </div>
        <button
          ref={cardRef}
          className="profile-header-menu"
          onClick={() => handleShowMenuChannel()}
        >
          <img src={More} className="more-icon"></img>
        </button>

        <FullImageView
          openFullImageView={openProfileImage}
          setOpenFullImageView={setOpenProfileImage}
          title={"User profile picture"}
          goBackLabel={false}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#000000",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <img
              src={
                userImageProfileChatting === "/src/assets/person.svg"
                  ? Person
                  : userImageProfileChatting
              }
              style={{
                maxWidth: "-webkit-fill-available",
                maxHeight: "-webkit-fill-available",
                float: "inline-end",
                width: windowSize === "Desktop" ? "25vw" : "50vw",
                height: windowSize === "Desktop" ? "25vw" : "50vw",
                position: "relative",
                padding: "2vw",
                objectFit: "contain",
              }}
            ></img>
          </div>
        </FullImageView>
      </div>

      {showMenuChannel ? (
        <div className="card-navigation" style={{ right: "5%" }}>
          <button
            className="button-navigation"
            style={{ border: "none" }}
            onClick={() => {
              handleRemoveChat();
            }}
          >
            <p>Delete Chat</p>
          </button>
        </div>
      ) : null}

      <section id="chats">
        <ul id="ul">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className="message-item-container"
                style={{
                  marginBottom: message.message
                    .toString()
                    .startsWith("data:image")
                    ? windowSize !== "Desktop"
                      ? "33vh"
                      : "45vh"
                    : "5vh",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      message.senderUserId === userId
                        ? "flex-end"
                        : "flex-start",
                    margin: "0 1vw",
                  }}
                >
                  <li
                    className="message-item"
                    style={{
                      textAlign:
                        message.senderUserId === userId ? "initial" : "left",
                      borderRadius:
                        message.senderUserId === userId
                          ? "1rem 0 1rem 1rem"
                          : "0 1rem 1rem 1rem",
                      backgroundColor:
                        message.senderUserId === userId
                          ? "#e0d9d9"
                          : "rgb(254,245,245)",
                      background:
                        message.senderUserId === userId ? "#92CDC8" : "#e0d9d9",
                    }}
                  >
                    <label
                      className="message"
                      style={{
                        textAlign:
                          message.senderUserId === userId ? "right" : "left",
                      }}
                    >
                      {message.message.startsWith("data:image") ? (
                        <img
                          onClick={() => {
                            setFullImageView(true);
                            setFullImageViewToRender(message.message);
                          }}
                          src={message.message}
                          className="image-message"
                          style={{
                            borderTopLeftRadius:
                              message.senderUserId === userId ? "1rem" : 0,
                            borderTopRightRadius:
                              message.senderUserId !== userId ? "1rem" : 0,
                          }}
                        ></img>
                      ) : message.message.startsWith("http") ? (
                        createLink(message.message)
                      ) : (
                        `${message.message.substring(0, 200)}`
                      )}
                    </label>

                    {message.message
                      .toString()
                      .startsWith("data:image") ? null : message.message
                        .length > 199 &&
                      message.message.toString().startsWith("data:image") ===
                        false ? (
                      <button
                        className="btn"
                        style={{
                          margin: "0 4vw",
                          float:
                            message.senderUserId === userId
                              ? "inline-end"
                              : "inline-end",
                        }}
                        onClick={(e) => showMoreText(e, message.message, index)}
                      >
                        See more
                      </button>
                    ) : null}

                    <label
                      className="message-date-time"
                      style={{
                        float:
                          message.senderUserId === userIdActually
                            ? "right"
                            : "left",
                      }}
                    >
                      {moment(message.createdAt).format(DateFormatPattern)}
                    </label>

                    <br />
                  </li>
                </div>

                <FullImageView
                  openFullImageView={fullImageView}
                  setOpenFullImageView={setFullImageView}
                >
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: "#000000",
                      width: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <img
                      src={fullImageViewToRender}
                      style={{
                        maxWidth: "-webkit-fill-available",
                        maxHeight: "-webkit-fill-available",
                        float: "inline-end",
                        width: windowSize === "Desktop" ? "50vw" : "50vw",
                        height: windowSize === "Desktop" ? "35vw" : "50vw",
                        position: "relative",
                        padding: "2vw",
                        objectFit: "contain",
                      }}
                    ></img>
                  </div>
                </FullImageView>
              </div>
            ))
          ) : (
            <li style={{ textAlign: "center" }}>Nothing to see 😢</li>
          )}
        </ul>
      </section>

      <InputController
        messageContent={message}
        setMessageContent={setMessage}
        handleChangeTextArea={handleTextChange}
        handleKeyDown={async (event) => {
          if (event.key === "Enter" && windowSize === "Desktop") {
            await handleSubmit(event);
          }
        }}
        handleChangeImage={handleImage}
        handleSubmit={handleSubmit}
        windowSize={windowSize}
      ></InputController>
    </AbstractBackground>
  );
};

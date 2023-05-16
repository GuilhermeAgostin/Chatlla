import "./EditProfile.css";

import {
  deleteUser,
  signOut,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

import ArrowBack from "../../assets/chevron-left.svg";
import Help from "../../assets/help.svg";
import Avatar from "../../assets/person.svg";
import UpdatePhoto from "../../assets/update-photo.svg";
import VisibilityOff from "../../assets/visibility-off.svg";
import Visibility from "../../assets/visibility.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";
import { Input } from "../../components/Input/Input";
import { Loading } from "../../components/Loading/Loading";
import { Warning } from "../../components/Warning/Warning";
import { AuthContext } from "../../context/AuthContext";
import { Environment } from "../../environment/config";
import { auth, database } from "../../firebase/firebaseInitialize";
import ViewportListener from "../../utils/checkViewport";
import {
  handleAuthorizationCookies,
  handleImage,
  handleLocationStateCheck,
  imageProfile,
  removeAuthorization,
  removeUserImageProfile,
} from "../../utils/utils";

export const EditProfile = () => {
  const [userImageProfile, setUserImageProfile] = useState("");
  const [newImageProfile, setNewImageProfile] = useState("");
  const [userName, setUserName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [alredyCookies, setAlredyCookies] = useState(null);
  const [userActually, setUserActually] = useState(null);
  const [correctOldPassword, setCorrectOldPassword] = useState(null);
  const [seeOldPassword, setSeeOldPassword] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmNewPassword, setSeeConfirmNewPassword] = useState(false);
  const [seeNewPassword, setSeeNewPassword] = useState(false);

  const [newPasswordMatchesOld, setNewPasswordMatchesOld] = useState(false);
  const [requiresRecentLogin, setRequiresRecentLogin] = useState(false);

  const [seeUpdatePhoto, setSeeUpdatePhoto] = useState(false);
  const [arrAnswersDatabase, setArrAnswersDatabase] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [correctSecurityQuestions, setCorrectSecurityQuestions] =
    useState(null);
  const [securityQuestion0, setSecurityQuestion0] = useState("");
  const [securityQuestion1, setSecurityQuestion1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");
  const [forgotSecurityAnswers, setForgotSecurityAnswers] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answerIds, setAnswerIds] = useState([]);

  const userNameRef = useRef("");
  const passwordRef = useRef("");
  const answer1Ref = useRef("");
  const answer2Ref = useRef("");
  const answer3Ref = useRef("");

  const oldPasswordRef = useRef("");
  const newPasswordRef = useRef("");
  const confirmNewPasswordRef = useRef("");

  const location = useLocation();
  const navigate = useNavigate();
  const viewportSize = ViewportListener();
  const { currentUser } = useContext(AuthContext);
  const regularExpression =
    "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+.!])([a-zA-Z0-9@#$%^&+.!]{10,})$";
  const cookies = new Cookies();

  const getCookies = {
    userName: cookies.get("userName"),
    userId: cookies.get("userId"),
    uptime: cookies.get("uptime"),
  };

  let instantRequiresRecentLogin = null;

  const goBackComponent = () => {
    navigate("/chats");
  };

  const handleLogout = async () => {
    try {
      const userRef = doc(database, "users", currentUser.uid);

      await updateDoc(userRef, {
        uptime: moment().format(),
        logged: false,
      });
    } catch (error) {
    }
    removeUserImageProfile();
    cookies.remove("uptime");
    cookies.remove("logged");
    cookies.remove("userName");
    cookies.remove("userId");

    signOut(auth);

    navigate("/login");
  };

  const Mount = async () => {
    window.scrollTo(0, 0);

    let response = await handleLocationStateCheck(location.state);

    if (response) {
      try {
        if (getCookies.userId === undefined) {
          setAlredyCookies(false);
          const user = {
            userName: location.state.userName,
            userId: location.state.userId,
            uptime: "",
            imageProfile: location.state.imageProfile,
          };
          setUserActually(user);
          setUserName(location.state.userName);
          let result = await handleGetSecurityQuestions(user);
        } else {
          setAlredyCookies(getCookies);
          let returnKey = imageProfile();
          const userImageProfile = { imageProfile: returnKey };
          const user = { ...getCookies, ...userImageProfile };
          setUserActually(user);
          setUserName(user.userName);
          await handleGetSecurityQuestions(user);
        }
      } catch (error) {
        await handleLogout();
      } finally {
        setLoading(false);
      }
    } else {
      try {

        const authorizedCookies = handleAuthorizationCookies();
        if (authorizedCookies) {
          setAlredyCookies(getCookies);

          const userImageProfile = { imageProfile: imageProfile() };
          const user = { ...getCookies, ...userImageProfile };
          setUserActually(user);
          setUserName(user.userName);
          let result = await handleGetSecurityQuestions(user);
        }
      } catch (error) {
        await handleLogout();
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    Mount();
  }, []);

  const getOwnedChats = async () => {
    let itemToCompare = null;
    let userName = null;

    if (getCookies.userId !== undefined) {
      itemToCompare = getCookies.userId;
      userName = getCookies.userName;
    } else {
      itemToCompare = location.state.userId;
      userName = location.state.userName;
    }

    let verifyChatName = null;
    let chatList = [];
    let chatListUsers = [];

    const q = query(
      collection(database, "chats"),
      where("userIdCreator", "==", itemToCompare)
    );

    const querySnapshot = await getDocs(q);
    let result = { chatId: "" };
    let result2 = null;
    let result3 = null;

    querySnapshot.forEach((doc) => {
      result = { chatId: doc.id };
      result2 = doc.data();
      result3 = { ...result, ...result2 };
      chatList.push(result3);
    });

    let result4 = null;
    const q2 = query(
      collection(database, "chats"),
      where("receiverUserId", "==", itemToCompare)
    );
    const querySnapshot2 = await getDocs(q2);
    querySnapshot2.forEach((doc) => {
      result = { chatId: doc.id };
      result2 = doc.data();
      result4 = { ...result, ...result2 };
      chatList.push(result4);
    });

    return chatList;
  };

  const handleUpdateUserName = async () => {
    const userRef = doc(database, "users", currentUser.uid);
    cookies.set("userName", newUserName, {
      path: "/",
      domain: Environment.PUBLIC_URL,
    });

    let userWithoutBlankSpaces = newUserName
      .toLowerCase()
      .replaceAll(/\s/g, "");

    await updateEmail(auth.currentUser, `${userWithoutBlankSpaces}@email.com`);

    let result = await updateDoc(userRef, {
      userName: newUserName,
      modifiedAt: moment().format(),
      logged: false,
    });
    location.state.userName = newUserName;

    return true;
  };

  const handleUpdateChatNameAndReceiver = async (chatId, toRemove = false) => {
    if (toRemove === false) {
      const chatsRef = doc(database, "chats", chatId);
      await updateDoc(chatsRef, {
        chatName: newUserName,
        receiverName: newUserName,
        modifiedAt: moment().format(),
      });
    } else {
      const chatsRef = doc(database, "chats", chatId);
      await updateDoc(chatsRef, {
        chatName: "Unknown",
        receiverName: "Unknown",
        modifiedAt: moment().format(),
      });
    }
  };

  const handleUpdateChatSenderName = async (chatId, toRemove = false) => {
    if (toRemove === false) {
      const chatsRef = doc(database, "chats", chatId);

      await updateDoc(chatsRef, {
        senderName: newUserName,
        modifiedAt: moment().format(),
      });

      return true;
    } else {

      const chatsRef = doc(database, "chats", chatId);
      await updateDoc(chatsRef, {
        senderName: "Unknown",
        modifiedAt: moment().format(),
      });
      return true;
    }
  };

  const handleChangeChatNames = async () => {
    let ownedChats = await getOwnedChats();
    let promises = [];

    ownedChats.forEach(async (item) => {
      if (item.chatName === currentUser.displayName) {
        promises.push(handleUpdateChatNameAndReceiver(item.chatId));
      } else {
        promises.push(handleUpdateChatSenderName(item.chatId));
      }
    });

    let result = await Promise.all(promises);
    return result;
  };

  const handleUpdateChatImageProfileReceiver = async (
    chatId,
    toRemove = false
  ) => {
    if (toRemove === false) {
      const chatsRef = doc(database, "chats", chatId);

      await updateDoc(chatsRef, {
        imageProfileReceiver: newImageProfile,
        modifiedAt: moment().format(),
      });
    } else {
      const chatsRef = doc(database, "chats", chatId);

      await updateDoc(chatsRef, {
        imageProfileReceiver: Avatar,
        modifiedAt: moment().format(),
      });
    }
  };

  const handleUpdateChatImageProfile = async (chatId, toRemove = false) => {
    if (toRemove === false) {
      const chatsRef = doc(database, "chats", chatId);

      await updateDoc(chatsRef, {
        imageProfile: newImageProfile,
        modifiedAt: moment().format(),
      });
    } else {
      const chatsRef = doc(database, "chats", chatId);

      await updateDoc(chatsRef, {
        imageProfile: Avatar,
        modifiedAt: moment().format(),
      });
    }
  };

  const changeImageChat = async (toRemove = false) => {
    if (toRemove === false) {
      let ownedChats = await getOwnedChats();

      ownedChats.forEach(async (item) => {
        if (item.userIdCreator === userActually.userId) {
          await handleUpdateChatImageProfile(item.chatId);
        } else {
          await handleUpdateChatImageProfileReceiver(item.chatId);
        }
      });
    } else {
      let ownedChats = await getOwnedChats();

      ownedChats.forEach(async (item) => {
        if (item.chatName === userActually.userName) {
          await handleUpdateChatImageProfileReceiver(item.chatId, true);
        } else {
          await handleUpdateChatImageProfile(item.chatId, true);
        }
      });
    }

    return true;
  };

  const handleChangeImageProfile = async (toRemove = false) => {
    if (toRemove === false) {
      const userRef = doc(database, "users", userActually.userId);

      await updateDoc(userRef, {
        uptime: moment().format(),
        imageProfile: newImageProfile,
        modifiedAt: moment().format(),
      });
    } else {
      const userRef = doc(database, "users", userActually.userId);

      await updateDoc(userRef, {
        uptime: moment().format(),
        imageProfile: Avatar,
        modifiedAt: moment().format(),
      });
    }

    return true;
  };

  const KEY = `imageProfile`;
  const setCookieUserImageProfile = (image) => {
    localStorage.setItem(KEY, image);
  };

  function handleProfileUpdate(isSamePassword) {
    const changedFields = {};

    if (newUserName !== "") {
      changedFields.name = newUserName;
    }

    if (newImageProfile !== "") {
      changedFields.image = newImageProfile;
    }

    if (isSamePassword === false) {
      changedFields.password = newPasswordRef.current.value;
    }

    if (correctSecurityQuestions) {
      changedFields.securityQuestions = true;
    }

    return changedFields;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let showMessage = 0;
    setLoading(true);

    const isSamePassword = await handlingOldVsNewPasswordComparison();

    const result = handleProfileUpdate(isSamePassword);

    try {
      if (Object.keys(result).length === 0) {
        // console.log("Nothing is changed!");
      } else {
        if (!!result.image) {
          await handleChangeImageProfile();
          await changeImageChat();

          if (!!alredyCookies && alredyCookies !== false) {
            setCookieUserImageProfile(newImageProfile);

            cookies.set("uptime", moment().format(), {
              path: "/",
              domain: Environment.PUBLIC_URL,
            });
          } else {
            location.state.imageProfile = newImageProfile;
          }
        }

        if (!!result.name) {
          if (
            confirm(
              "Are you sure you want to make this change? With this action, you will need to login again."
            )
          ) {
            try {
              showMessage = showMessage + 1;
              const result1 = await handleUpdateUserName();
              const result2 = await handleChangeChatNames();
            } catch (error) {
              if (error.code === "auth/requires-recent-login") {
                setRequiresRecentLogin(true);
                instantRequiresRecentLogin = true;
              } else {
                // console.log(error);
              }
            }
          } else {
          }
        }

        if (!!result.password) {

          if (showMessage === 0) {
            if (
              confirm(
                "Are you sure you want to make this change? With this action, you will need to login again."
              )
            ) {
              showMessage = showMessage + 1;
              await handleChangePassword();
            } else {
            }

            showMessage = showMessage + 1;
            await handleChangePassword();
          } else {
            await handleChangePassword();
          }
        } else {
        }
      }
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setRequiresRecentLogin(true);
        instantRequiresRecentLogin = true;
      } else {
        // console.log(error);
      }
    } finally {
      setLoading(false);
      showMessage > 0
        ? instantRequiresRecentLogin === false ||
          instantRequiresRecentLogin === null
          ? await handleLogout()
          : null
        : null;
    }
  };

  const handleDeleteAccount = async () => {
    let confirmText = "Are you sure you want to delete your account?";

    if (confirm(confirmText) && requiresRecentLogin === false) {
      try {
        //------------------------------ CHANGE USER NAME -----------------------------------------//

        cookies.remove("userName");

        const userRef = doc(database, "users", userActually.userId);

        let result = await updateDoc(userRef, {
          userName: "Unknown",
          modifiedAt: moment().format(),
          logged: false,
        });

        // ----------------------------- UPDATE CHATS TABLE -----------------------------------//

        let ownedChats = await getOwnedChats();

        ownedChats.forEach(async (item) => {
          if (item.chatName === userActually.userName) {
            await handleUpdateChatNameAndReceiver(item.chatId, true);
          } else {
            await handleUpdateChatSenderName(item.chatId, true);
          }
        });

        //------------------------------ UPDATE IMAGE PROFILE -----------------------------------------//

        await handleChangeImageProfile(true);

        //------------------------------ UPDATE IMAGE CHAT -----------------------------------------//

        await changeImageChat(true);

        //------------------------------ REMOVE PASSWORD ------------------------------------------- //

        const q = query(
          collection(database, "userxPassword"),
          where("userId", "==", userActually.userId)
        );

        const querySnapshot = await getDocs(q);
        let result4 = { userxPasswordId: "" };
        let result5 = null;

        querySnapshot.forEach((doc) => {
          result5 = doc.data();
          result4 = { userxPasswordId: doc.id };
        });

        let result6 = { ...result4, ...result5 };
        const passwordRef = doc(
          database,
          "userxPassword",
          result4.userxPasswordId
        );

        let response = await deleteDoc(passwordRef);

        //------------------------------ REMOVE SECURITY QUESTIONS  ------------------------------------------- //

        let arrSecurityQuestionsToRemove = [];

        const q2 = query(
          collection(database, "securityQuestionxUser"),
          where("userId", "==", userActually.userId)
        );

        const querySnapshot2 = await getDocs(q2);
        let result7 = { securityQuestionId: "" };

        querySnapshot2.forEach((doc) => {
          result7 = { securityQuestionId: doc.id };
          arrSecurityQuestionsToRemove.push(result7);
        });
        arrSecurityQuestionsToRemove.forEach(async (item) => {
          const securityQuestionToRemoveRef = doc(
            database,
            "securityQuestionxUser",
            item.securityQuestionId
          );

          let response = await deleteDoc(securityQuestionToRemoveRef);
        });

        //------------------------------ REMOVE ANSWERS  ------------------------------------------- //

        answerIds.forEach(async (item) => {
          const answerToRemoveRef = doc(
            database,
            "answerSecurityQuestion",
            item.answerId
          );

          let response = await deleteDoc(answerToRemoveRef);
        });

        //-------------------------- REMOVE MESSAGES -------------------------------------------------- //

        let arrayMessagesToRemove = [];

        const queryToRemoveMessages = query(
          collection(database, "messages"),
          where("senderUserId", "==", userActually.userId)
        );

        const querySnapshotToRemoveMessages = await getDocs(
          queryToRemoveMessages
        );


        let result8 = { messageId: "" };
        querySnapshotToRemoveMessages.forEach((doc) => {
          result8 = { messageId: doc.id };

          arrayMessagesToRemove.push(result8);
        });

        arrayMessagesToRemove.forEach(async (item) => {
          const messagesToRemoveRef = doc(database, "messages", item.messageId);
          let response = await deleteDoc(messagesToRemoveRef);
        });

        cookies.remove("uptime");
        cookies.remove("userName");
        removeAuthorization();
        removeUserImageProfile();
        const user = auth.currentUser;

        await deleteUser(user);
        await handleLogout();
      } catch (error) {
        setRequiresRecentLogin(true);
        instantRequiresRecentLogin = true;
      }
    } else {
      let element = document.getElementsByClassName(
        "show-delete-account-container"
      )[0];

      element.classList.remove("show-delete-account-container");
      element.classList.add("delete-account-container");
      setDeleteAccount(false);
    }
  };

  const handleSendInputedAnswers = () => {
    let same0 = false;
    let same1 = false;
    let same2 = false;

    arrAnswersDatabase.map((item, index) => {
      let databaseAnswer = item.toLowerCase();
      let currentAnswer1 = answer1Ref.current.value.toLowerCase();
      let currentAnswer2 = answer2Ref.current.value.toLowerCase();
      let currentAnswer3 = answer3Ref.current.value.toLowerCase();

      if (databaseAnswer === currentAnswer1) {
        same0 = true;
      }
      if (databaseAnswer === currentAnswer2) {
        same1 = true;
      }
      if (databaseAnswer === currentAnswer3) {
        same2 = true;
      }
    });

    if (same0 && same1 && same2) {
      setCorrectSecurityQuestions(true);
    } else {
      setCorrectSecurityQuestions(false);
    }
  };

  const handleGetSecurityQuestions = async (user) => {
    let arrSecurityQuestions = [];
    let arrSecurityQuestionsIds = [];
    let arrAnswers = [];
    let arrAnswerIds = [];

    const q = query(
      collection(database, "answerSecurityQuestion"),
      where("userId", "==", user.userId)
    );

    const querySnapshot = await getDocs(q);

    let result = null;
    let result2 = { answerId: "" };
    let resultForOtherQuery = null;
    let resultForArrAnswers = null;
    let resultForArrAnswerIds = null;

    querySnapshot.forEach((doc) => {
      result = doc.data();
      result2 = { answerId: doc.id };

      let result3 = { ...result2, ...result };

      resultForOtherQuery = doc.data().securityQuestionId;
      resultForArrAnswers = doc.data().answer;

      arrSecurityQuestions.push(result3);
      arrSecurityQuestionsIds.push(resultForOtherQuery);
      arrAnswers.push(resultForArrAnswers);
      arrAnswerIds.push(result2);
    });

    setArrAnswersDatabase(arrAnswers);
    setAnswerIds(arrAnswerIds);

    arrSecurityQuestionsIds.map(async (item, index) => {
      await getValueOfSecurityQuestions(item, index);
    });
  };

  const getValueOfSecurityQuestions = async (securityQuestionId, index) => {
    const q = doc(database, "securityQuestion", securityQuestionId.toString());

    const querySnapshot = await getDoc(q);

    switch (index) {
      case 0:
        setSecurityQuestion0(querySnapshot.data().question);
        break;

      case 1:
        setSecurityQuestion1(querySnapshot.data().question);
        break;

      case 2:
        setSecurityQuestion2(querySnapshot.data().question);
        break;
    }

    return true;
  };

  const verifyAnswes = () => {
    if (
      answer1Ref.current.value !== "" &&
      answer2Ref.current.value !== "" &&
      answer3Ref.current.value !== ""
    ) {
      handleSendInputedAnswers();
    }
  };

  const handleChangePassword = async () => {
    let userIndex = userActually.userId;
    const user = auth.currentUser;
    const newPassword = newPasswordRef.current.value;

    try {
      await updatePassword(user, newPassword);

      const q = query(
        collection(database, "userxPassword"),
        where("userId", "==", userIndex)
      );

      const querySnapshot = await getDocs(q);
      let result = { userxPasswordId: "" };
      querySnapshot.forEach((doc) => {
        result = { userxPasswordId: doc.id };
      });

      const passwordRef = doc(
        database,
        "userxPassword",
        result.userxPasswordId
      );

      await updateDoc(passwordRef, {
        password: confirmNewPasswordRef.current.value,
      });
    } catch (error) {
      setRequiresRecentLogin(true);
      instantRequiresRecentLogin = true;
    }
  };

  const handleShowMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleShowDeleteAccountContainerDesktop = () => {
    if (deleteAccount == false) {
      let element = document.getElementsByClassName(
        "delete-account-container"
      )[0];
      element.classList.remove("delete-account-container");
      element.classList.add("show-delete-account-container");
      setDeleteAccount(true);
    }

    if (deleteAccount) {
      let element = document.getElementsByClassName(
        "show-delete-account-container"
      )[0];

      element.classList.remove("show-delete-account-container");
      element.classList.add("delete-account-container");
      setDeleteAccount(false);
    }
  };

  const handleComparePassword = async () => {
    let same = false;

    let userIndex = userActually.userId;
    let passwordToCompare = oldPasswordRef.current.value;
    const q = query(
      collection(database, "userxPassword"),
      where("userId", "==", userIndex)
    );

    const querySnapshot = await getDocs(q);
    let result = { userxPasswordId: "" };
    let result2 = null;

    querySnapshot.forEach((doc) => {
      result2 = doc.data();
      result = { userxPasswordId: doc.id };
    });

    let result3 = { ...result, ...result2 };
    if (result3.password === passwordToCompare) {
      same = result3.userxPasswordId;
      setCorrectOldPassword(true);
    } else {
      same = false;
      setCorrectOldPassword(false);
    }

    return same;
  };

  const handlingOldVsNewPasswordComparison = async () => {
    let same = false;

    let userIndex = userActually.userId;
    let passwordToCompare = newPasswordRef.current.value;

    const q = query(
      collection(database, "userxPassword"),
      where("userId", "==", userIndex)
    );

    const querySnapshot = await getDocs(q);

    let result = { userxPasswordId: "" };
    let result2 = null;

    querySnapshot.forEach((doc) => {
      result2 = doc.data();
      result = { userxPasswordId: doc.id };
    });

    let result3 = { ...result, ...result2 };

    if (result3.password === passwordToCompare) {
      same = result3.userxPasswordId;
      setNewPasswordMatchesOld(true);
    } else {
      same = false;
      setNewPasswordMatchesOld(false);
    }

    return same;
  };

  return (
    <>
      {viewportSize ? (
        viewportSize === "Desktop" ? (
          <AbstractBackground
            className="container-forgot-password"
            removeRightBottomAbstractForm={true}
            removeLeftBottomAbstractForm={true}
          >
            <Loading loading={loading}></Loading>
            <Warning
              setOpenWarning={setRequiresRecentLogin}
              openWarning={requiresRecentLogin}
              type="error"
              button
              textButton="Login again"
              handleLogout={handleLogout}
            >
              For security purposes, please log in again before changing your
              password as it has been a while since your last login.
            </Warning>

            <div className="profile-header">
              <button
                className="go-back-button-desktop"
                style={{ width: "2vw", height: "2vw" }}
              >
                <img
                  src={ArrowBack}
                  className="image-go-back-button-desktop"
                  onClick={goBackComponent}
                ></img>
              </button>

              <h2
                className="title-forgot-password"
                style={{ fontSize: "22px" }}
              >
                Settings
              </h2>

              <button
                className="profile-header-menu"
                title="Help"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f1f1f1",
                  width: "2vw",
                  height: "2vw",
                  borderRadius: "1vw",
                }}
              >
                <img
                  src={Help}
                  style={{ width: "24px", height: "24px" }}
                  onClick={() => handleShowMenu()}
                ></img>
              </button>
            </div>

            {showMenu ? (
              <div className="card-navigation" style={{ right: "5%" }}>
                <button
                  className="button-navigation"
                  onClick={() => navigate("/terms-and-conditions-of-use")}
                >
                  <p>Terms of Use</p>
                </button>

                <button
                  className="button-navigation"
                  onClick={() => navigate("/privacy-policy")}
                >
                  <p>Privacy Policy</p>
                </button>
              </div>
            ) : null}

            <form style={{ display: "contents" }}>
              <div
                style={{
                  display: "flex",
                  zIndex: 2,
                  width: "94%",
                  height: 0,
                }}
              >
                <label
                  htmlFor="avatar"
                  className="add-photo"
                  onMouseEnter={() => {
                    setSeeUpdatePhoto(true);
                  }}
                  onMouseLeave={() => {
                    setSeeUpdatePhoto(false);
                  }}
                  style={{
                    zIndex: newImageProfile !== "" ? 2 : 3,
                    opacity: seeUpdatePhoto ? 0.9 : 0,
                    backgroundImage: `url(${UpdatePhoto})`,
                    position: "relative",
                    top: "8px",
                    left: "8px",
                    transition: "all 400ms",
                  }}
                >
                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/png, image/jpeg"
                    onChange={async (e) => {
                      let originalImage = document.querySelector("#img");
                      e.preventDefault();
                      let result = await handleImage(e);
                      setNewImageProfile(result);
                    }}
                  />
                </label>

                <img
                  id="img"
                  src=""
                  style={{
                    display: "none",
                    width: "150px",
                    height: "150px",
                  }}
                ></img>
                <img
                  id="compressedImage"
                  src={
                    !!userActually
                      ? newImageProfile !== ""
                        ? newImageProfile
                        : userActually.imageProfile === "/src/assets/person.svg"
                        ? Avatar
                        : userActually.imageProfile
                      : ""
                  }
                  style={{
                    display: "block",
                    position: "absolute",
                    width: "9vw",
                    height: "9vw",
                    borderRadius: "4.5vw",
                    maxWidth: "125px",
                    maxHeight: "125px",
                    objectFit: "cover",
                    objectPosition: "top",
                    zIndex: !!userActually
                      ? userActually.imageProfile !== Avatar
                        ? 2
                        : null
                      : null,
                  }}
                ></img>
              </div>

              <section
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "absolute",
                  top: "240px",
                  left: "1.5vw",
                  width: "10vw",
                }}
              >
                <button
                  className="button-send"
                  style={{
                    backgroundColor: "#ffffff",
                    width: "10vw",
                    textAlign: "center",
                    color: deleteAccount ? "#84D48C" : "#E97272",
                  }}
                  onClick={() => {
                    handleShowDeleteAccountContainerDesktop();
                  }}
                >
                  {deleteAccount ? "Cancel" : "Delete My Account"}
                </button>

                <br />

                <div className="delete-account-container">
                  <br />

                  <label
                    style={{
                      display: "inline-block",
                      width: "10vw",
                      color: "#E97272",
                      fontSize: "9px",
                      textAlign: "center",
                    }}
                  >
                    *All the data will be deleted permanently including your
                    profile.
                  </label>

                  <br />
                  <br />

                  <button
                    className="button-send"
                    style={{
                      backgroundColor: "#E97272",
                      width: "10vw",
                      margin: 0,
                      color: "#ffffff",
                      textAlign: "center",
                    }}
                    onClick={() => handleDeleteAccount()}
                  >
                    Delete Now
                  </button>
                </div>
              </section>

              <br />

              <label className="register-subtitle" style={{ width: "72vw" }}>
                Profile
              </label>

              <div className="line" style={{ width: "72vw" }}></div>

              <br />
              <br />

              <div
                className="container-with-instructions-to-send"
                style={{ width: "72vw" }}
              >
                <Input
                  id="username"
                  value={newUserName}
                  innerDefaultValue={userName}
                  autoComplete="on"
                  required={true}
                  inputType={"text"}
                  label="Username"
                  styleContainerInput={{
                    paddingLeft: "5px",
                    height: "6vh",
                    maxHeight: "80px",
                    width: "22vw",
                  }}
                  inputWidth={"18vw"}
                  onChange={(e) => setNewUserName(e)}
                ></Input>
              </div>

              <br />
              <br />

              <div
                className="instructions-container"
                style={{
                  backgroundColor:
                    (correctSecurityQuestions !== null &&
                      correctSecurityQuestions !== false) ||
                    forgotSecurityAnswers
                      ? "#92CDC8"
                      : "#D9D9D9",
                  width: "70vw",
                  padding: "1vw 0vw 1vw 2vw",
                }}
              >
                <label style={{ fontSize: "13px" }}>
                  To change your password, you need to answer all security
                  questions correctly. If you don't remember the answers, you
                  can still change your password by providing your old one.
                </label>
              </div>

              <br />
              <br />

              <label className="register-subtitle" style={{ width: "72vw" }}>
                Security Questions
              </label>

              <div className="line" style={{ width: "72vw" }}></div>

              <br />

              <div
                className="container-with-instructions-to-send-2"
                style={{ width: "72vw" }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Input
                    id="securityQuestion1"
                    innerDefaultValue={securityQuestion0}
                    autoComplete="off"
                    inputType={"text"}
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    label=""
                    placeholder="Security Question 1"
                    readOnly={true}
                    styleContainerInput={{
                      paddingLeft: "5px",
                      height: "6vh",
                      maxHeight: "80px",
                      width: "22vw",
                    }}
                    inputWidth={"18vw"}
                    title={securityQuestion0}
                  ></Input>

                  <br />

                  <Input
                    id="answer1"
                    innerRef={answer1Ref}
                    autoComplete="off"
                    required={true}
                    inputType={"text"}
                    placeholder="Answer for Security Question 1"
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    styleContainerInput={{
                      paddingLeft: "5px",
                      height: "6vh",
                      maxHeight: "80px",
                      width: "22vw",
                    }}
                    inputWidth={"18vw"}
                    onBlur={() => {
                      verifyAnswes();
                    }}
                  ></Input>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Input
                    id="securityQuestion2"
                    innerDefaultValue={securityQuestion1}
                    autoComplete="off"
                    inputType={"text"}
                    label=""
                    placeholder="Security Question 2"
                    readOnly={true}
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    styleContainerInput={{
                      paddingLeft: "5px",
                      height: "6vh",
                      maxHeight: "80px",
                      width: "22vw",
                    }}
                    inputWidth={"18vw"}
                    title={securityQuestion1}
                  ></Input>

                  <br />

                  <Input
                    id="answer2"
                    innerRef={answer2Ref}
                    autoComplete="off"
                    required={true}
                    inputType={"text"}
                    placeholder="Answer for Security Question 2"
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    styleContainerInput={{
                      paddingLeft: "5px",
                      height: "6vh",
                      maxHeight: "80px",
                      width: "22vw",
                    }}
                    inputWidth={"18vw"}
                    onBlur={() => {
                      verifyAnswes();
                    }}
                  ></Input>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Input
                    id="securityQuestion3"
                    innerDefaultValue={securityQuestion2}
                    autoComplete="off"
                    inputType={"text"}
                    label=""
                    placeholder="Security Question 3"
                    readOnly={true}
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    styleContainerInput={{
                      paddingLeft: "5px",
                      height: "6vh",
                      maxHeight: "80px",
                      width: "22vw",
                    }}
                    inputWidth={"18vw"}
                    title={securityQuestion2}
                  ></Input>

                  <br />

                  <Input
                    id="answer3"
                    innerRef={answer3Ref}
                    autoComplete="off"
                    required={true}
                    inputType={"text"}
                    placeholder="Answer for Security Question 3"
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    styleContainerInput={{
                      paddingLeft: "5px",
                      height: "6vh",
                      maxHeight: "80px",
                      width: "22vw",
                    }}
                    inputWidth={"18vw"}
                    onBlur={() => {
                      verifyAnswes();
                    }}
                  ></Input>
                </div>
              </div>

              <h4
                className="error-message-for-security-questions"
                style={{
                  color:
                    correctSecurityQuestions === null
                      ? "#ffffff"
                      : correctSecurityQuestions || forgotSecurityAnswers
                      ? "#ffffff"
                      : "#ff5555",
                }}
              >
                Please review your answers and try again
              </h4>

              <br />
              <div
                className="container-button-send"
                style={{ width: "72vw", justifyContent: "center", zIndex: 2 }}
              >
                <button
                  className="button-send"
                  style={{
                    backgroundColor:
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? "#d9d9d9"
                        : "#92CDC8",
                    zIndex: 2,
                  }}
                  disabled={
                    correctSecurityQuestions || forgotSecurityAnswers
                      ? true
                      : false
                  }
                  onClick={() => handleSendInputedAnswers()}
                >
                  Send Answers
                </button>

                <button
                  className="button-send"
                  style={{
                    backgroundColor:
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? "#d9d9d9"
                        : "#92CDC8",
                    zIndex: 2,
                  }}
                  disabled={
                    correctSecurityQuestions || forgotSecurityAnswers
                      ? true
                      : false
                  }
                  onClick={() => setForgotSecurityAnswers(true)}
                >
                  Forgot Security Answers
                </button>
              </div>

              {(correctSecurityQuestions !== null &&
                correctSecurityQuestions !== false) ||
              forgotSecurityAnswers ? (
                <>
                  <label
                    className="register-subtitle"
                    style={{ width: "72vw" }}
                  >
                    Password
                  </label>

                  <div className="line" style={{ width: "72vw" }}></div>

                  <br />

                  <div
                    className="container-with-instructions-to-send-2"
                    style={{ width: "72vw" }}
                  >
                    {forgotSecurityAnswers ? (
                      <Input
                        id="oldPassword"
                        innerRef={oldPasswordRef}
                        autoComplete="off"
                        required={true}
                        inputType={"password"}
                        label="Old Password"
                        icon={Visibility}
                        iconToTurn={VisibilityOff}
                        setSeePassword={setSeeOldPassword}
                        seePassword={seeOldPassword}
                        pattern={regularExpression}
                        styleContainerInput={{
                          paddingLeft: "5px",
                          height: "6vh",
                          maxHeight: "80px",
                          width: "22vw",
                        }}
                        inputWidth={"15%"}
                        onBlur={handleComparePassword}
                      ></Input>
                    ) : null}

                    <Input
                      id="newPassword"
                      innerRef={newPasswordRef}
                      autoComplete="off"
                      required={true}
                      inputType={"password"}
                      label="New Password"
                      icon={Visibility}
                      iconToTurn={VisibilityOff}
                      setSeePassword={setSeeNewPassword}
                      seePassword={seeNewPassword}
                      pattern={regularExpression}
                      styleContainerInput={{
                        paddingLeft: "5px",
                        height: "6vh",
                        maxHeight: "80px",
                        width: "22vw",
                      }}
                      inputWidth={"15%"}
                      containerPasswordIconWidth={"20vw"}
                    ></Input>

                    <div
                      style={{ width: forgotSecurityAnswers ? "auto" : "65%" }}
                    >
                      <Input
                        id="confirmNewPassword"
                        innerRef={confirmNewPasswordRef}
                        autoComplete="off"
                        required={true}
                        inputType={"password"}
                        label="Confirm New Password"
                        icon={Visibility}
                        iconToTurn={VisibilityOff}
                        setSeePassword={setSeeConfirmNewPassword}
                        seePassword={seeConfirmNewPassword}
                        pattern={regularExpression}
                        styleContainerInput={{
                          paddingLeft: "5px",
                          height: "6vh",
                          maxHeight: "80px",
                          width: "22vw",
                        }}
                        inputWidth={"15%"}
                        containerPasswordIconWidth={"20vw"}
                      ></Input>
                    </div>
                  </div>
                  <h4
                    className="error-message-for-security-questions"
                    style={{
                      color: newPasswordMatchesOld
                        ? "#ff5555"
                        : correctOldPassword === null
                        ? "#ffffff"
                        : correctOldPassword
                        ? "#ffffff"
                        : "ff5555",
                    }}
                  >
                    Please check your passwords. Your new password cannot be the
                    same as your old one and must follow the pattern below.
                  </h4>

                  <br />

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ul className="password-condiction-list">
                      <li className="list-item-password">
                        Contain at least 1 uppercase character (A-Z);
                      </li>
                      <li className="list-item-password">
                        Contain at least 1 lowercase character (a-z);
                      </li>
                      <li className="list-item-password">
                        Contain at least 1 number;
                      </li>
                      <li className="list-item-password">
                        Contain at least 10 characters;
                      </li>
                      <li className="list-item-password">
                        Contain at least symbol (!?.@#$%&).
                      </li>
                    </ul>
                  </div>
                </>
              ) : null}

              <br />

              <div
                className="container-button-send"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "25vw",
                  position: "fixed",
                  bottom: "5vh",
                  right: "2vw",
                  alignItems: "flex-end",
                  zIndex: 4,
                }}
              >
                <button
                  className="button-send"
                  style={{ zIndex: 4, marginLeft: 0 }}
                  onClick={handleSubmit}
                  type="submit"
                >
                  Submit Changes
                </button>
              </div>

              <br />
            </form>
          </AbstractBackground>
        ) : (
          <AbstractBackground
            onTouchMove={() => {
              setShowMenu(false);
            }}
          >
            <Loading loading={loading}></Loading>

            <button onClick={goBackComponent} className="go-back-button">
              <img src={ArrowBack} className="image-go-back-button"></img>
            </button>

            <button
              onClick={() => {
                handleShowMenu();
              }}
              className="go-back-button"
              style={{ right: "6vw", left: "auto" }}
            >
              <img
                src={Help}
                style={{ width: "24px", height: "24px", position: "relative" }}
              ></img>
            </button>

            {showMenu ? (
              <div className="card-navigation">
                <button
                  className="button-navigation"
                  onClick={() =>
                    navigate("/terms-and-conditions-of-use", { replace: true })
                  }
                >
                  <p>Terms of Use</p>
                </button>

                <button
                  className="button-navigation"
                  onClick={() => navigate("/privacy-policy", { replace: true })}
                >
                  <p>Privacy Policy</p>
                </button>
              </div>
            ) : null}

            <div className="privacy-policy-container">
              <br />

              <h2
                style={{
                  fontWeight: "500",
                  marginBottom: "1vh",
                  width: "-webkit-fill-available",
                }}
              >
                Settings
              </h2>

              <br />

              <label
                className="register-subtitle"
                style={{ width: "-webkit-fill-available" }}
              >
                Profile
              </label>
              <div className="line"></div>

              <br />
              <br />

              <form style={{ display: "contents" }}>
                <div
                  style={{
                    display: "flex",
                    zIndex: 2,
                    width: "100%",
                    justifyContent: "center",
                  }}
                  onTouchStart={() => {
                    setSeeUpdatePhoto(true);
                  }}
                  onTouchEnd={() => {
                    setSeeUpdatePhoto(false);
                  }}
                >
                  <label
                    htmlFor="avatar"
                    className="add-photo"
                    style={{
                      zIndex: newImageProfile !== "" ? 2 : 3,
                      opacity: seeUpdatePhoto ? 0.9 : 0,
                      backgroundImage: `url(${UpdatePhoto})`,
                      position: "relative",
                      top: "-1px",
                      left: ".5vw",
                      transition: "all 400ms",
                      borderRadius: "75px",
                      maxWidth: "145px",
                      maxHeight: "145px",
                      minWidth: "145px",
                      minHeight: "145px",
                      backgroundSize: "cover",
                    }}
                  >
                    <input
                      type="file"
                      id="avatar"
                      name="avatar"
                      accept="image/png, image/jpeg"
                      onChange={async (e) => {
                        e.preventDefault();
                        let originalImage = document.querySelector("#img");
                        let result = await handleImage(e);
                        setNewImageProfile(result);
                      }}
                    />
                  </label>

                  <img
                    id="img"
                    src=""
                    style={{
                      display: "none",
                      width: "150px",
                      height: "150px",
                    }}
                  ></img>
                  <img
                    id="compressedImage"
                    src={
                      !!userActually
                        ? userActually.imageProfile !== Avatar
                          ? newImageProfile !== ""
                            ? newImageProfile
                            : userActually.imageProfile
                          : userActually.imageProfile
                        : ""
                    }
                    style={{
                      display: "block",
                      position: "absolute",
                      borderRadius: "75px",
                      maxWidth: "145px",
                      maxHeight: "145px",
                      minWidth: "145px",
                      minHeight: "145px",
                      objectFit: "cover",
                      objectPosition: "top",
                      zIndex: !!userActually
                        ? userActually.imageProfile !== Avatar
                          ? 2
                          : null
                        : null,
                    }}
                  ></img>
                </div>

                <br />
                <br />

                <Input
                  id="username"
                  value={newUserName}
                  innerDefaultValue={userName}
                  autoComplete="on"
                  required={true}
                  inputType={"text"}
                  label="Username"
                  onChange={(e) => setNewUserName(e)}
                  inputWidth={
                    viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                  }
                ></Input>

                <br />

                <section
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "86vw",
                  }}
                >
                  <button
                    className="login-button"
                    style={{
                      backgroundColor: "#ffffff",
                      margin: 0,
                      textAlign: "center",
                      color: deleteAccount ? "#ff0000" : "#E97272",
                      border: "1px solid #e97272",
                    }}
                    onClick={() => {
                      if (deleteAccount == false) {
                        let element = document.getElementsByClassName(
                          "delete-account-container"
                        )[0];
                        element.classList.remove("delete-account-container");
                        element.classList.add("show-delete-account-container");
                        setDeleteAccount(true);
                      }

                      if (deleteAccount) {
                        let element = document.getElementsByClassName(
                          "show-delete-account-container"
                        )[0];

                        element.classList.remove(
                          "show-delete-account-container"
                        );
                        element.classList.add("delete-account-container");
                        setDeleteAccount(false);
                      }
                    }}
                  >
                    {deleteAccount ? "Cancel" : "Delete My Account"}
                  </button>
                  <div className="delete-account-container">
                    <br />

                    <label
                      style={{
                        display: "inline-block",
                        width: "86vw",
                        color: "#E97272",
                        fontSize: "13px",
                        textAlign: "center",
                      }}
                    >
                      *All the data will be deleted permanently including your
                      profile.
                    </label>

                    <br />
                    <br />

                    <button
                      className="button-send"
                      style={{
                        backgroundColor: "#E97272",
                        width: "86vw",
                        margin: 0,
                        color: "#ffffff",
                        textAlign: "center",
                      }}
                    >
                      Delete Now
                    </button>
                  </div>
                </section>

                <br />

                <div
                  className="instructions-container"
                  style={{
                    backgroundColor:
                      (correctSecurityQuestions !== null &&
                        correctSecurityQuestions !== false) ||
                      forgotSecurityAnswers
                        ? "#92CDC8"
                        : "#D9D9D9",
                  }}
                >
                  <label style={{ fontSize: "13px" }}>
                    To change your password, you need to answer all security
                    questions correctly. If you don't remember the answers, you
                    can still change your password by providing your old one.
                  </label>
                </div>

                <br />
                <br />

                <label className="register-subtitle" style={{ width: "80vw" }}>
                  Security Questions
                </label>

                <div className="line"></div>

                <br />
                <br />

                <div className="tooltip">
                  <span className="tooltiptext">
                    {securityQuestion0 !== "" && securityQuestion0}
                  </span>

                  <Input
                    id="securityQuestion1"
                    innerDefaultValue={securityQuestion0}
                    autoComplete="off"
                    inputType={"text"}
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    label=""
                    placeholder="Security Question 1"
                    readOnly={true}
                    title=" "
                    inputWidth={
                      viewportSize?.orientation === "portrait" ? "74vw" : "70vw"
                    }
                  ></Input>
                </div>

                <br />

                <Input
                  id="answer1"
                  innerRef={answer1Ref}
                  required={true}
                  inputType={"text"}
                  placeholder="Answer Security Question 1"
                  disabled={
                    correctSecurityQuestions || forgotSecurityAnswers
                      ? true
                      : false
                  }
                  inputWidth={
                    viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                  }
                  onBlur={() => {
                    verifyAnswes();
                  }}
                ></Input>
                <br />

                <div className="tooltip">
                  <span className="tooltiptext">
                    {securityQuestion1 !== "" && securityQuestion1}
                  </span>

                  <Input
                    id="securityQuestion2"
                    innerDefaultValue={securityQuestion1}
                    autoComplete="off"
                    inputType={"text"}
                    label=""
                    placeholder="Security Question 2"
                    readOnly={true}
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    title=" "
                    inputWidth={
                      viewportSize?.orientation === "portrait" ? "74vw" : "70vw"
                    }
                  ></Input>
                </div>

                <br />

                <Input
                  id="answer2"
                  innerRef={answer2Ref}
                  required={true}
                  inputType={"text"}
                  placeholder="Answer Security Question 2"
                  disabled={
                    correctSecurityQuestions || forgotSecurityAnswers
                      ? true
                      : false
                  }
                  inputWidth={
                    viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                  }
                  onBlur={() => {
                    verifyAnswes();
                  }}
                ></Input>
                <br />

                <div className="tooltip">
                  <span className="tooltiptext">
                    {securityQuestion2 !== "" && securityQuestion2}
                  </span>

                  <Input
                    id="securityQuestion3"
                    innerDefaultValue={securityQuestion2}
                    autoComplete="off"
                    inputType={"text"}
                    label=""
                    placeholder="Security Question 3"
                    readOnly={true}
                    disabled={
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? true
                        : false
                    }
                    title=" "
                    inputWidth={
                      viewportSize?.orientation === "portrait" ? "74vw" : "70vw"
                    }
                  ></Input>
                </div>

                <br />

                <Input
                  id="answer3"
                  innerRef={answer3Ref}
                  required={true}
                  inputType={"text"}
                  disabled={
                    correctSecurityQuestions || forgotSecurityAnswers
                      ? true
                      : false
                  }
                  placeholder="Answer Security Question 3"
                  inputWidth={
                    viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                  }
                  onBlur={() => {
                    verifyAnswes();
                  }}
                ></Input>
                <br />

                <h4
                  className="error-message-for-security-questions"
                  style={{
                    display:
                      correctSecurityQuestions === null
                        ? "none"
                        : correctSecurityQuestions || forgotSecurityAnswers
                        ? "none"
                        : "block",
                    color: "#ff5555",
                  }}
                >
                  Please review your answers and try again
                </h4>
                <br />

                <button
                  className="login-button"
                  style={{
                    backgroundColor:
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? "#d9d9d9"
                        : "#92CDC8",
                    zIndex: 2,
                  }}
                  disabled={
                    correctSecurityQuestions || forgotSecurityAnswers
                      ? true
                      : false
                  }
                  onClick={() => handleSendInputedAnswers()}
                >
                  Send Answers
                </button>

                <br />
                <button
                  className="login-button"
                  style={{
                    backgroundColor:
                      correctSecurityQuestions || forgotSecurityAnswers
                        ? "#d9d9d9"
                        : "#92CDC8",
                    zIndex: 2,
                    marginLeft: 0,
                    height: viewportSize
                      ? viewportSize.orientation === "portrait"
                        ? "12vw"
                        : "6vw"
                      : "12vw",
                    padding: 0,
                  }}
                  disabled={
                    correctSecurityQuestions || forgotSecurityAnswers
                      ? true
                      : false
                  }
                  onClick={() => setForgotSecurityAnswers(true)}
                >
                  Forgot Security Answers
                </button>
                <button
                  className="login-button"
                  style={{ bottom: "3vh", position: "absolute" }}
                  onClick={handleSubmit}
                  type="submit"
                >
                  Submit Changes
                </button>

                <br />
                <br />

                {(correctSecurityQuestions !== null &&
                  correctSecurityQuestions !== false) ||
                forgotSecurityAnswers ? (
                  <>
                    <label
                      className="register-subtitle"
                      style={{ width: "80vw" }}
                    >
                      Password
                    </label>

                    <div className="line"></div>

                    <br />
                    <br />

                    {forgotSecurityAnswers ? (
                      <>
                        <Input
                          id="oldPassword"
                          innerRef={oldPasswordRef}
                          autoComplete="off"
                          required={true}
                          inputType={"password"}
                          label="Old Password"
                          icon={Visibility}
                          iconToTurn={VisibilityOff}
                          setSeePassword={setSeeOldPassword}
                          seePassword={seeOldPassword}
                          pattern={regularExpression}
                          inputWidth={"66vw"}
                          containerPasswordIconWidth={
                            viewportSize?.orientation === "portrait"
                              ? "86vw"
                              : "76vw"
                          }
                          onBlur={handleComparePassword}
                        ></Input>{" "}
                        <br />
                      </>
                    ) : null}

                    <Input
                      id="newPassword"
                      innerRef={newPasswordRef}
                      autoComplete="off"
                      required={true}
                      inputType={"password"}
                      label="New Password"
                      icon={Visibility}
                      iconToTurn={VisibilityOff}
                      setSeePassword={setSeeNewPassword}
                      seePassword={seeNewPassword}
                      pattern={regularExpression}
                      inputWidth={"66vw"}
                      containerPasswordIconWidth={
                        viewportSize?.orientation === "portrait"
                          ? "86vw"
                          : "76vw"
                      }
                    ></Input>

                    <br />

                    <Input
                      id="confirmNewPassword"
                      innerRef={confirmNewPasswordRef}
                      autoComplete="off"
                      required={true}
                      inputType={"password"}
                      label="Confirm New Password"
                      icon={Visibility}
                      iconToTurn={VisibilityOff}
                      setSeePassword={setSeeConfirmNewPassword}
                      seePassword={seeConfirmNewPassword}
                      pattern={regularExpression}
                      inputWidth={"66vw"}
                      containerPasswordIconWidth={
                        viewportSize?.orientation === "portrait"
                          ? "86vw"
                          : "76vw"
                      }
                    ></Input>

                    <h4
                      className="error-message-for-security-questions"
                      style={{
                        display: newPasswordMatchesOld
                          ? "block"
                          : correctOldPassword === null
                          ? "none"
                          : correctOldPassword
                          ? "none"
                          : "block",
                        marginBlockStart: "1.33em",
                      }}
                    >
                      Please check your passwords. Your new password cannot be
                      the same as your old one and must follow the pattern
                      below.
                    </h4>

                    {newPasswordMatchesOld ? <br /> : null}

                    <ul
                      className="password-condiction-list"
                      style={{ padding: "0 4vw" }}
                    >
                      <li className="list-item-password">
                        Contain at least 1 uppercase character (A-Z);
                      </li>
                      <li className="list-item-password">
                        Contain at least 1 lowercase character (a-z);
                      </li>
                      <li className="list-item-password">
                        Contain at least 1 number;
                      </li>
                      <li className="list-item-password">
                        Contain at least 10 characters;
                      </li>
                      <li className="list-item-password">
                        Contain at least symbol (!?.@#$%&).
                      </li>
                    </ul>

                    <br />
                    <br />
                  </>
                ) : null}

                <br />
                <br />
              </form>
            </div>
          </AbstractBackground>
        )
      ) : null}
    </>
  );
};

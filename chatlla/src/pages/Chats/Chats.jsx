import "./Chats.css";

import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { debounce } from "lodash";
import moment from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

import ChatllaForum from "../../assets/chatlla-forum.svg";
import More from "../../assets/more-vertic.svg";
import Person from "../../assets/person.svg";
import Search from "../../assets/search.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";
import { Avatar } from "../../components/Avatar/Avatar";
import { ChatList } from "../../components/ChatList/ChatList";
import { Input } from "../../components/Input/Input";
import { Loading } from "../../components/Loading/Loading";
import { Warning } from "../../components/Warning/Warning";
import { AuthContext } from "../../context/AuthContext";
import { Environment } from "../../environment/config";
import { auth, database } from "../../firebase/firebaseInitialize";
import { Channel } from "../../pages/Channel/Channel";
import { CheckArrowNavigation } from "../../utils/checkArrowNavigation";
import ViewportListener from "../../utils/checkViewport";
import {
  compareDates,
  handleLocationStateCheck,
  removeUserImageProfile,
} from "../../utils/utils";

export const Chats = () => {
  const [userActually, setUserActually] = useState(null);
  const [chatToGo, setChatToGo] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [viewRecent, setViewRecent] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [listUsers, setListUsers] = useState([]);
  const [listUsersFiltered, setListUsersFiltered] = useState([]);
  const [alreadyCookies, setAlreadyCookies] = useState(null);
  const [removeListener, setRemoveListener] = useState(false);
  const [datetimeLastUpdated, setDatetimeLastUpdated] = useState("");
  const [transformAllUsers, setTransformAllUsers] = useState(false);
  const [startMessageRemoval, setStartMessageRemoval] = useState(false);
  const [maximumAmountOfChats, setMaximumAmountOfChats] = useState(10);
  const [maximumAmountOfChatsError, setMaximumAmountOfChatsError] =
    useState(false);

  const [chatWarningRemoved, setChatWarningRemoved] = useState(false);

  const [usersQuantity, setUsersQuantity] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(0);
  const [chats, setChats] = useState([]);
  const [toRemove, setToRemove] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const viewportSize = ViewportListener();
  const { currentUser } = useContext(AuthContext);
  const cardRef = useRef();

  let historyData = history.state;
  const path = CheckArrowNavigation(
    window.location.href,
    historyData,
    removeListener
  );

  const cookies = new Cookies();

  const KEY = `imageProfile`;

  const getCookies = {
    userName: cookies.get("userName"),
    userId: cookies.get("userId"),
    uptime: cookies.get("uptime"),
    logged: cookies.get("logged"),
  };

  const imageProfile = () => localStorage.getItem(KEY);

  const searchUserNameRef = useRef("");

  const getAllUsers = async (limitOfUsers = 5) => {
    if (listUsers.length === 0) {
      await getUsersQuantity();
      let users = [];
      let itemToCompare = null;

      if (getCookies.userId !== undefined) {
        itemToCompare = getCookies.userName;
      } else {
        itemToCompare = location.state.userName;
      }

      const q = query(
        collection(database, "users"),
        where("userName", "not-in", [itemToCompare]),
        limit(limitOfUsers)
      );

      const querySnapshot = await getDocs(q);
      let result = { userId: "" };
      let result2 = null;
      let result3 = null;

      querySnapshot.forEach((doc) => {
        result = { userId: doc.id };
        result2 = doc.data();
        result3 = { ...result, ...result2 };

        users.push(result3);
      });
      setListUsers(filterUnknownUsers(users));

      users = [];
    }
  };

  const filterUnknownUsers = (users) => {
    const filteredUsers = users.filter((user) => user.userName !== "Unknown");
    return filteredUsers;
  };

  const handleSeeMoreUsers = async (limitOfUsers = 5) => {
    let users = [];
    let itemToCompare = null;

    if (getCookies.userId !== undefined) {
      itemToCompare = getCookies.userName;
    } else {
      itemToCompare = location.state.userName;
    }

    const q = query(
      collection(database, "users"),
      where("userName", "not-in", [itemToCompare]),
      limit(limitOfUsers)
    );

    const querySnapshot = await getDocs(q);

    let result = { userId: "" };
    let result2 = null;
    let result3 = null;

    querySnapshot.forEach((doc) => {
      result = { userId: doc.id };
      result2 = doc.data();
      result3 = { ...result, ...result2 };

      users.push(result3);
    });
    setListUsers(filterUnknownUsers(users));

    users = [];
  };

  const handleUsersLogged = async (userToVerify) => {

    let user = null;
    let logged = false;

    const q = query(
      collection(database, "users"),
      where("userName", "==", userToVerify)
    );

    const querySnapshot = await getDocs(q);

    let result = { userId: "" };
    let result2 = null;
    let result3 = null;

    querySnapshot.forEach((doc) => {
      result = { userId: doc.id };
      result2 = doc.data();
      result3 = { ...result, ...result2 };

      user = result3;
    });

    if (userToVerify === "Unknown") {
      let dateComparisonResult = await compareDates(user.modifiedAt, 1, "days");

      if (dateComparisonResult) {
        await RemoveUserPermanently(user);
      }
    } else {
      let dateComparisonResult = await compareDates(user.uptime, 10, "minutes");
      user.logged === false
        ? (logged = false)
        : dateComparisonResult
        ? (logged = false)
        : (logged = true);
    }

    return logged;
  };

  const RemoveUserPermanently = async (user) => {
    try {
      const [chatsShouldBeRemoved] = await Promise.all([
        getChatShouldBeRemoved(user.userId),
        handleDeleteDocument(user.userId, "users"),
        getChatsOfUser(),
      ]);

    } catch (error) {
    }
  };

  const getChatShouldBeRemoved = async (user) => {
    alert("getChatShouldBeRemoved");

    let chatList = [];
    const q = query(
      collection(database, "chats"),
      where("userIdCreator", "==", user)
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

    if (chatList.length > 0) {
      chatList.forEach(async (chat, index) => {
        await handleDeleteDocument(chat.chatId, "chats");
      });
    } else {
      chatList = [];
      const q = query(
        collection(database, "chats"),
        where("receiverUserId", "==", user)
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

      if (chatList.length > 0) {
        alert("remove chats");
        chatList.forEach(async (chat, index) => {
          await handleDeleteDocument(chat.chatId, "chats");
        });
      }
    }

    return true;
  };

  const handleDeleteDocument = async (idToSearch, table) => {
    alert(table);
    alert(idToSearch);
    const refToDelete = doc(database, table, idToSearch);

    let response = await deleteDoc(refToDelete);

    return response;
  };

  const getChatsOfUser = async () => {
    let currentUserId = null;
    let userName = null;

    if (getCookies.userId !== undefined) {
      currentUserId = getCookies.userId;
      userName = getCookies.userName;
    } else {
      currentUserId = location.state.userId;
      userName = location.state.userName;
    }

    // console.log("First query");

    let verifyChatName = null;
    let chatList = [];
    let chatListUsers = [];

    const q = query(
      collection(database, "chats"),
      where("userIdCreator", "==", currentUserId)
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

    if (chatList.length === 0) {
      // console.log("Get other query");

      let result4 = null;
      const q2 = query(
        collection(database, "chats"),
        where("receiverUserId", "==", currentUserId)
      );

      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach((doc) => {
        result = { chatId: doc.id };
        result2 = doc.data();
        result4 = { ...result, ...result2 };

        chatList.push(result4);
      });

      chatList.map((item, index) => {
        if (currentUserId === item.receiverUserId) {
          chatListUsers.push({ index: index, value: item.senderName });
        }
      });

      let newList = [];
      await Promise.all(
        chatListUsers.map(async (item, index) => {
          let response = await handleUsersLogged(item.value);
          let ue = { ...chatList[item.index], logged: response };
          newList.push(ue);
        })
      );

      chatList = newList;
      const sortChats = chatList.sort(compareMessages);
      setChats(sortChats);

      if (sortChats.length === 0 && viewportSize !== "Desktop") {
        handleViewRecentChats();
      }
      if (sortChats.length === 0 && viewportSize === "Desktop") {
        await handleViewAllUsers();
      } else {
        let getRemovedChats = sortChats.filter(
          (chat) =>
            chat.remove === true || chat.removedByUserId !== currentUserId
        );

        if (getRemovedChats.length > 0) {
          setChats(getRemovedChats);
          handleViewRecentChats();
        } else {
          await handleViewAllUsers();
        }
      }
    } else {
      let chatListSummation = [];

      result = { chatId: "" };
      result2 = null;
      result3 = null;
      const q2 = query(
        collection(database, "chats"),
        where("receiverUserId", "==", currentUserId)
      );

      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach((doc) => {
        result = { chatId: doc.id };
        result2 = doc.data();
        result3 = { ...result, ...result2 };

        chatListSummation.push(result3);
      });

      chatList.map((item, index) => {
        if (currentUserId === item.userIdCreator) {
          chatListUsers.push({ index: index, value: item.receiverName });
        }
      });

      chatListSummation.map((item, index) => {
        if (currentUserId === item.receiverUserId) {
          chatListUsers.push({ index: index, value: item.senderName });
        }
      });

      let chatListConcat = [];

      let newList = [];
      chatListConcat = [...chatList, ...chatListSummation];

      await Promise.all(
        chatListUsers.map(async (item, index) => {
          let response = await handleUsersLogged(item.value);
          let ue = { ...chatListConcat[index], logged: response };

          newList.push(ue);
        })
      );

      chatListConcat = newList;
      const sortChats = chatListConcat.sort(compareMessages);
      setChats(sortChats);

      if (sortChats.length === 0 && viewportSize !== "Desktop") {
        handleViewRecentChats();
      }
      if (sortChats.length === 0 && viewportSize === "Desktop") {
        await handleViewAllUsers();
      } else {

        let getRemovedChats = sortChats.filter(
          (chat) =>
            chat.remove === true || chat.removedByUserId !== currentUserId
        );

        if (getRemovedChats.length > 0) {
          setChats(getRemovedChats);
          handleViewRecentChats();
        } else {
          await handleViewAllUsers();
        }
      }
    }
  };

  function compareMessages(a, b) {
    const dateA = new Date(a.lastMessageDateTime);
    const dateB = new Date(b.lastMessageDateTime);
    return dateB - dateA;
  }

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

  const handleClickOutside = (event) => {
    if (cardRef.current && !cardRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    Mount();

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUserInformation = async () => {
    if (userActually === null) {
      const q = query(
        collection(database, "users"),
        where("userName", "==", location.state.userName)
      );

      const querySnapshot = await getDocs(q);

      let result = { userId: "" };
      let result2 = null;

      querySnapshot.forEach((doc) => {
        result2 = doc.data();
        result = { userId: doc.id };
      });

      let result3 = { ...result, ...result2 };
      setUserActually(result3);
    }
  };

  const Mount = async () => {
    let response = await handleLocationStateCheck(location.state);

    if (response) {
      try {
        if (getCookies.userId === undefined) {
          setAlreadyCookies(false);
          await getUserInformation();
          await getChatsOfUser();
        } else {
          setAlreadyCookies(getCookies);
          const userImageProfile = { imageProfile: imageProfile() };
          const user = { ...getCookies, ...userImageProfile };
          setUserActually(user);
          await getChatsOfUser();

        }
      } catch (error) {
        alert(error);
        await handleLogout();
      } finally {
        setLoading(false);
      }
    } else {
      try {
        if (getCookies.userId === undefined) {
          setAlreadyCookies(false);
          await getUserInformation();
          await getChatsOfUser();

        } else {
          setAlreadyCookies(getCookies);
          const userImageProfile = { imageProfile: imageProfile() };
          const user = { ...getCookies, ...userImageProfile };
          setUserActually(user);
          await getChatsOfUser();

        }
      } catch (error) {
        await handleLogout();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchName = debounce((search) => {
    setSearch(search);

    let arr = listUsers.filter((i) =>
      i.userName.toUpperCase().includes(search.toUpperCase())
    );
    setListUsersFiltered(arr);

  }, 300);

  const handleStartConversation = async (chat) => {
    try {

      let diffLastUpdated =
        parseInt(
          moment(datetimeLastUpdated)
            .diff(moment().format())
            .toString()
            .replace("-", "")
        ).toFixed() / 60000;

      if (diffLastUpdated > 2) {
        await uptimeCheckControl();
      }

      const chatsRef = doc(database, "chats", chat.chatId);
      await updateDoc(chatsRef, {
        modifiedAt: moment().format(),
        remove: false,
        removedByUserId: "",
        removedDateTime: "",
      });

      setChatToGo(chat);
      setRemoveListener(false);
      showModal();

    } catch (error) {
    }
  };

  const handleInitiateChat = async (information) => {
    if (chats.length >= maximumAmountOfChats) {
      let filteredChats = chats.filter(
        (item) => item.chatName === information.userName
      );

      if (filteredChats.length > 0) {
        await uptimeCheckControl();
        await handleStartConversation(filteredChats[0]);
      } else {
        setMaximumAmountOfChatsError(true);
      }

    } else {
      let itemToCompare = currentUser.uid;
      let creatorUserName = !!getCookies.userName
        ? getCookies.userName
        : currentUser.displayName;
      let userImageProfile =
        imageProfile() !== null || imageProfile() !== ""
          ? imageProfile()
          : userActually.imageProfile;

      let filteredChatsList = chats.filter(
        (item) => item.chatName === information.userName
      );

      if (filteredChatsList.length === 0) {
        /* ---------------------------------- add a new chat ----------------------------------------- */

        const newChatRef = await addDoc(collection(database, "chats"), {
          chatName: information.userName,
          createdAt: moment().format(),
          modifiedAt: moment().format(),
          imageProfile: userImageProfile,
          imageProfileReceiver: information.imageProfile,
          lastMessage: "",
          lastMessageDateTime: moment().format(),
          receiverName: information.userName,
          senderName: creatorUserName,
          receiverUserId: information.userId,
          userIdCreator: itemToCompare,
          remove: false,
          removedByUserId: "",
          removedDateTime: "",
        });

        await getChatsOfUser();

        const chat = {
          chatId: newChatRef.id,
          chatName: information.userName,
          createdAt: moment().format(),
          modifiedAt: moment().format(),
          imageProfile: userImageProfile,
          imageProfileReceiver: information.imageProfile,
          lastMessage: "",
          lastMessageDateTime: moment().format(),
          receiverName: information.userName,
          senderName: creatorUserName,
          receiverUserId: information.userId,
          userIdCreator: itemToCompare,
          remove: false,
          removedByUserId: "",
          removedDateTime: "",
          logged: information.logged,
        };

        await handleStartConversation(chat);

        /* ---------------------------------- add a new chat ----------------------------------------- */

        const userRef = doc(database, "users", itemToCompare);

        await updateDoc(userRef, {
          uptime: moment().format(),
          logged: true,
        });
      } else {
        handleStartConversation(filteredChatsList[0]);
      }
    }
  };

  const handleShowMenu = debounce(async () => {
    setShowMenu(!showMenu);
  }, 300);

  const uptimeCheckControl = async () => {
    let timeOutTest = null;

    if (getCookies.userId !== null) {
      const userRef = doc(database, "users", getCookies.userId);

      await updateDoc(userRef, {
        uptime: moment().format(),
        logged: true,
      });

      setDatetimeLastUpdated(moment().format());

      cookies.set("uptime", moment().format(), {
        path: "/",
        domain: Environment.PUBLIC_URL,
      });
    } else {
      const userRef = doc(database, "users", userActually.userId);

      await updateDoc(userRef, {
        uptime: moment().format(),
        logged: true,
      });

      cookies.set("uptime", moment().format(), {
        path: "/",
        domain: Environment.PUBLIC_URL,
      });
    }
  };

  const navigateToEditProfilePage = () => {
    if (alreadyCookies !== false && alreadyCookies !== undefined) {
      navigate("/edit-profile", {
        state: {
          userId: alreadyCookies.userId,
          userName: alreadyCookies.userName,
          imageProfile: imageProfile(),
        },
        replace: true,
      });
    } else {
      navigate("/edit-profile", {
        state: {
          userId: location.state.userId,
          userName: location.state.userName,
          imageProfile: location.state.imageProfile,
        },
        replace: true,
      });
    }
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

  const handleViewAllUsers = async () => {
    setViewAll(true);
    setViewRecent(false);

    await getAllUsers();
  };

  const handleViewRecentChats = () => {
    setViewAll(false);
    setViewRecent(true);
  };

  const showModal = async () => {
    await uptimeCheckControl();
    if (removeListener) {
      setRemoveListener(!removeListener);
    }

    let modal = document.getElementsByClassName("modal2")[0];
    modal.style.top = 0;
    modal.style.bottom = 0;

    modal.style.position = "absolute";

    const isMobile = /iPhone|Android|Mobile|Tablet/i.test(navigator.userAgent);

    if (viewportSize !== "Desktop") {
      document.body.style.backgroundColor = "#92B1D8";

      let containerToChange = document.getElementsByClassName(
        "large-desktop-chats-container"
      )[0];
      containerToChange.style.height = 0;
      containerToChange.style.border = "none";
    } else {
    }
  };

  const hideModal = async (getChats = false) => {
    setChatToGo(null);
    if (viewportSize !== "Desktop") {
      let containerToChange = document.getElementsByClassName(
        "large-desktop-chats-container"
      )[0];
      containerToChange.style.height = "-webkit-fill-available";
      document.body.style.backgroundColor = "#ffffff";
      containerToChange.style.borderLeft = "1px solid #000";
      containerToChange.style.borderRight = "1px solid #000";
      containerToChange.style.borderTop = "1px solid #000";
    }

    let modal = document.getElementsByClassName("modal2")[0];
    modal.style.position = "fixed";
    modal.style.top = "800px";

    modal.style.bottom = "-800px";

    setRemoveListener(true);

    if (getChats) {
      await getChatsOfUser();
    }
  };

  const handleFocusAllUsers = () => {
    setTransformAllUsers(true);

    const timeout = setTimeout(() => {
      setTransformAllUsers(false);
    }, 400);
  };

  const getUsersQuantity = async () => {
    let quantityArray = [];

    const q = query(collection(database, "users"));

    const querySnapshot = await getDocs(q);

    let result = null;

    querySnapshot.forEach((doc) => {
      result = doc.data();
      quantityArray.push(result);
    });

    setUsersQuantity(quantityArray.length - 1);
    setUsersPerPage(quantityArray.length + 5);

    return quantityArray.length - 1;
  };

  const handleRemoveChatComponent = async (chatToRemove) => {
    if (chatToRemove.remove === true) {
      const chatRef = doc(database, "chats", chatToRemove.chatId);
      await deleteDoc(chatRef);
    } else {
      const chatRef = doc(database, "chats", chatToRemove.chatId);
      await updateDoc(chatRef, {
        remove: true,
        removedDateTime: moment().format(),
        removedByUserId: userActually.userId,
      });
    }
  };

  useEffect(() => {
    const removeChat = async () => {
      if (toRemove) {
        await handleRemoveChatComponent(toRemove);
        alert("Chat deleted");
        setToRemove(null);
        setChatToGo(null);
        await getChatsOfUser();
      }
    };

    removeChat();
  }, [toRemove]);

  useEffect(() => {
    const { orientation } = viewportSize || {};
  
    if (['portrait', 'landscape'].includes(orientation)) {
      hideModal();
    }
  }, [viewportSize]);

  return (
    <AbstractBackground
      className="chat-container"
      removeRightTopAbstractForm={true}
      removeRightBottomAbstractForm={true}
      removeLeftBottomAbstractForm={true}
    >
      <Loading loading={loading} />
      <Warning
        setOpenWarning={setMaximumAmountOfChatsError}
        openWarning={maximumAmountOfChatsError}
        type="error"
      >
        Sorry, you have reached the maximum number of chats allowed. Please
        close an existing chat if you would like to start a new one.
      </Warning>

      <Warning
        setOpenWarning={setChatWarningRemoved}
        openWarning={chatWarningRemoved}
        type="simpleWarning"
      >
        <label style={{ margin: "1vh 3vw", textAlign: "left" }}>
          Oops! This chat is no longer available. The user you were chatting
          with has deleted their account. We apologize for any inconvenience
          this may have caused. Please continue exploring our platform and find
          new interesting people to chat with!
        </label>
      </Warning>

      {viewportSize === "Desktop" ? (
        <div className="chats-page-desktop">
          <div
            className="right-top-abstract-form-background"
            style={{ right: "50%", zIndex: 1 }}
          >
            <svg
              width="175"
              height="240"
              viewBox="0 0 175 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Group 184">
                <path
                  id="Vector"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M59.4488 -1.20617C82.1007 -22.8734 112.981 -29.413 142.265 -30.8204C170.814 -32.1925 203.164 -30.9163 218.252 -8.83809C232.494 12.0029 229.097 51.3421 226.994 78.3518C224.931 104.862 223.211 123.026 206.232 145.577C188.13 169.622 154.746 184.168 127.835 179.126C103.18 174.508 95.569 124.595 77.9929 108.1C63 90 59.4488 114 35.9999 78.3514C25.5 48.5 36.3355 20.9025 59.4488 -1.20617Z"
                  fill="#92CDC8"
                />
                <path
                  id="Vector_2"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M116.532 -48.8241C150.016 -53.6718 180.545 -31.3673 205.295 -8.38905C224.572 9.50777 229.828 35.5987 235.184 61.3324C240.103 84.9599 241.65 107.977 234.307 130.986C224.308 162.313 217.892 202.469 186.729 213.155C155.228 223.957 123.085 199.046 97.4081 177.928C76.1939 160.48 95.8816 138.604 86.0001 113C74.1043 82.1765 23.7248 47.3412 35.0155 16.263C47.3423 -17.667 80.7446 -43.6431 116.532 -48.8241Z"
                  stroke="black"
                />
              </g>
            </svg>
          </div>

          <section className="users-and-chats-section">
            {showMenu ? (
              <div ref={cardRef} className="card-navigation">
                <button
                  className="button-navigation"
                  onClick={navigateToEditProfilePage}
                >
                  <p>Settings</p>
                </button>
                <button className="button-navigation" onClick={handleLogout}>
                  <p>Logout</p>
                </button>
              </div>
            ) : null}

            <div className="profile-header">
              <div className="profile-header-image">
                <div className="profile-image-container">
                  {!!userActually ? (
                    <>
                      <img
                        src={
                          userActually.imageProfile === "/src/assets/person.svg"
                            ? Person
                            : userActually.imageProfile
                        }
                        className="profile-image"
                      ></img>
                      <div className="chat-item-body-status">
                        <div
                          className="chat-item-status"
                          style={{
                            backgroundColor: userActually.logged
                              ? "lightgreen"
                              : "#7a7a7a",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <Avatar
                      avatarBackgroundColor={"#92CDC8"}
                      frameBackgroundColor={"#fff"}
                    ></Avatar>
                  )}
                </div>

                <h2
                className="userName"
                  style={{
                    fontSize: "20px",
                  }}
                >
                  {!!getCookies.userId
                    ? getCookies.userName
                    : !!location.state
                    ? location.state.userName
                    : ""}
                </h2>
              </div>

              <button className="profile-header-menu">
                <img
                  src={More}
                  className="more-icon"
                  onClick={() => handleShowMenu()}
                ></img>
              </button>
            </div>

            <section id="chats" style={{ boxShadow: "none" }}>
              <div className="chats-container">
                <Input
                  id="search"
                  innerRef={searchUserNameRef}
                  autoComplete="off"
                  disabled={false}
                  inputType={"text"}
                  placeholder="Search users..."
                  icon={Search}
                  inputWidth={"32vw"}
                  containerPasswordIconWidth={"44vw"}
                  onClickIcon={() => {
                    handleSearchName(searchUserNameRef.current.value);
                  }}
                  onBlur={() => {
                    handleSearchName(searchUserNameRef.current.value);
                  }}
                  onKeyDown={() => {
                    handleSearchName(searchUserNameRef.current.value);
                  }}
                  useSearchClass={true}
                ></Input>

                <br />

                <div className="button-container">
                  <button
                    className="login-button"
                    disabled={chats.length > 0 ? false : true}
                    style={{
                      backgroundColor: viewRecent ? "#D88DB6" : "#ffffff",
                      color:
                        chats.length === 0
                          ? "#d9d9d9"
                          : viewRecent
                          ? "#ffffff"
                          : "#D88DB6",
                      width: "20vw",
                      cursor: chats.length > 0 ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      setViewRecent(true);
                      setViewAll(false);
                    }}
                    onTouchMove={() => {
                      listUsers.length > 0
                        ? handleViewAllUsers()
                        : handleViewRecentChats();
                    }}
                  >
                    Recent chats
                  </button>

                  <button
                    className="login-button"
                    style={{
                      backgroundColor: viewAll ? "#D88DB6" : "#ffffff",
                      color: viewAll ? "#ffffff" : "#D88DB6",
                      width: "20vw",
                    }}
                    onClick={() => {
                      handleViewAllUsers();
                    }}
                    onTouchMove={() => {
                      setViewRecent(true);
                      setViewAll(false);
                    }}
                  >
                    All users
                  </button>
                </div>

                <br />

                <>
                  {chats.length > 0 && viewRecent ? (
                    <ChatList
                      chats={chats}
                      alreadyCookies={alreadyCookies}
                      imageProfile={imageProfile()}
                      cookies={getCookies}
                      viewportSize={viewportSize}
                      startMessageRemoval={startMessageRemoval}
                      setStartMessageRemoval={setStartMessageRemoval}
                      toRemove={toRemove}
                      setToRemove={setToRemove}
                      viewAll={viewAll}
                      setViewAll={setViewAll}
                      viewRecent={viewRecent}
                      setViewRecent={setViewRecent}
                      handleStartConversation={handleStartConversation}
                      getAllUsers={getAllUsers}
                      chatWarningRemoved={chatWarningRemoved}
                      setChatWarningRemoved={setChatWarningRemoved}
                    ></ChatList>
                  ) : chats.length === 0 && viewRecent ? (
                    <div className="large-desktop-chats-container">
                      <h5 style={{ color: "#000" }}>Nothing here yet 🥴</h5>
                    </div>
                  ) : search === "" && viewAll ? (
                    <ChatList
                      usersPerPage={usersPerPage}
                      listUsers={listUsers}
                      alreadyCookies={alreadyCookies}
                      imageProfile={imageProfile()}
                      cookies={getCookies}
                      viewportSize={viewportSize}
                      startMessageRemoval={startMessageRemoval}
                      setStartMessageRemoval={setStartMessageRemoval}
                      toRemove={toRemove}
                      setToRemove={setToRemove}
                      viewAll={viewAll}
                      setViewAll={setViewAll}
                      viewRecent={viewRecent}
                      setViewRecent={setViewRecent}
                      handleStartConversation={handleStartConversation}
                      handleInitiateChat={handleInitiateChat}
                      usersQuantity={usersQuantity}
                      handleSeeMoreUsers={handleSeeMoreUsers}
                    ></ChatList>
                  ) : search !== "" &&
                    listUsersFiltered.length === 0 &&
                    viewAll ? (
                    <ChatList
                      search={search}
                      listUsersFiltered={listUsersFiltered}
                      alreadyCookies={alreadyCookies}
                      imageProfile={imageProfile()}
                      cookies={getCookies}
                      viewportSize={viewportSize}
                      startMessageRemoval={startMessageRemoval}
                      setStartMessageRemoval={setStartMessageRemoval}
                      toRemove={toRemove}
                      setToRemove={setToRemove}
                      viewAll={viewAll}
                      setViewAll={setViewAll}
                      viewRecent={viewRecent}
                      setViewRecent={setViewRecent}
                      handleStartConversation={handleStartConversation}
                      usersQuantity={usersQuantity}
                    ></ChatList>
                  ) : search !== "" &&
                    listUsersFiltered.length > 0 &&
                    viewAll ? (
                    <ChatList
                      search={search}
                      listUsersFiltered={listUsersFiltered}
                      alreadyCookies={alreadyCookies}
                      imageProfile={imageProfile()}
                      cookies={getCookies}
                      viewportSize={viewportSize}
                      startMessageRemoval={startMessageRemoval}
                      setStartMessageRemoval={setStartMessageRemoval}
                      toRemove={toRemove}
                      setToRemove={setToRemove}
                      viewAll={viewAll}
                      setViewAll={setViewAll}
                      viewRecent={viewRecent}
                      setViewRecent={setViewRecent}
                      handleStartConversation={handleStartConversation}
                      handleInitiateChat={handleInitiateChat}
                      usersQuantity={usersQuantity}
                    ></ChatList>
                  ) : (
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
                        There's no users...
                      </h3>

                      <br />

                      <br />

                      <div style={{ width: "45vw" }}>
                        <div
                          className="chat-item"
                          style={{ cursor: "not-allowed", opacity: 0.5 }}
                        >
                          <div className="chat-item-profile-image-container">
                            <img
                              src={Person}
                              className="chat-item-profile-image"
                            />
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
                            <img
                              src={Person}
                              className="chat-item-profile-image"
                            />
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
                            <img
                              src={Person}
                              className="chat-item-profile-image"
                            />
                          </div>
                        </div>
                      </div>

                      <br />
                    </div>
                  )}
                </>
              </div>
            </section>
          </section>

          {/* -------------------------------------------------------------------------------------------- */}

          <section
            className="channel-section"
            style={{
              backgroundColor: chatToGo === null ? "#f7f6f6" : "#ffffff",
            }}
          >
            {chats.length === 0 ? (
              <div className="welcome-container">
                <h4 className="welcome-container-title">
                  Welcome, {userActually.userName}!
                </h4>

                <h5 className="welcome-container-subtitle">
                  Choose a user on the side to start chatting
                </h5>

                <img src={ChatllaForum} className="chatlla-forum" />
              </div>
            ) : chats.length > 0 && chatToGo !== null ? (
              <Channel
                userId={userActually.userId}
                userImageProfileChatting={
                  userActually.imageProfile === chatToGo.imageProfile
                    ? chatToGo.imageProfileReceiver
                    : chatToGo.imageProfile
                }
                userName={userActually.userName}
                chatIdNow={chatToGo.chatId}
                userIdChatting={chatToGo.receiverUserId}
                userNameChatting={
                  userActually.userName === chatToGo.senderName
                    ? chatToGo.receiverName
                    : chatToGo.senderName
                }
                closeChannel={() => hideModal(true)}
                removeListener={removeListener}
                remove={chatToGo.remove}
                removedByUserId={chatToGo.removedByUserId}
                removedDateTime={chatToGo.removedDateTime}
                windowSize={viewportSize}
                online={chatToGo.logged}
                userActually={userActually}
              ></Channel>
            ) : null}
          </section>

          {/* -------------------------------------------------------------------------------------------- */}
        </div>
      ) : viewportSize !== "Desktop" ? (
        <div
          className="users-and-chats-section"
          onTouchMove={() => {
            setShowMenu(false);
          }}
        >
          {showMenu ? (
            <div ref={cardRef} className="card-navigation">
              <button
                className="button-navigation"
                onClick={navigateToEditProfilePage}
              >
                <p>Settings</p>
              </button>

              <button className="button-navigation" onClick={handleLogout}>
                <p>Logout</p>
              </button>
            </div>
          ) : null}

          <div className="profile-header">
            <div className="profile-header-image">
              <div className="profile-image-container">
                {!!userActually ? (
                  <>
                    <img
                      src={
                        userActually.imageProfile === "/src/assets/person.svg"
                          ? Person
                          : userActually.imageProfile
                      }
                      className="profile-image"
                    ></img>
                    <div
                      className="chat-item-body-status"
                      style={{ padding: "1px", height: "1.8vw" }}
                    >
                      <div
                        className="chat-item-status"
                        style={{
                          backgroundColor: userActually.logged
                            ? "lightgreen"
                            : "#7a7a7a",
                        }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <Avatar
                    avatarBackgroundColor={"#92CDC8"}
                    frameBackgroundColor={"#fff"}
                  ></Avatar>
                )}
              </div>
            </div>
            <h3
             className="userName"
            >
              {!!getCookies.userId
                ? getCookies.userName
                : !!location.state
                ? location.state.userName
                : ""}
            </h3>

            <button
              id="menu"
              className="profile-header-menu"
              onClick={handleShowMenu}
            >
              <img src={More} className="more-icon"></img>
            </button>
          </div>

          <div className="right-top-abstract-form-background">
            <svg
              width="175"
              height="240"
              viewBox="0 0 175 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Group 184">
                <path
                  id="Vector"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M59.4488 -1.20617C82.1007 -22.8734 112.981 -29.413 142.265 -30.8204C170.814 -32.1925 203.164 -30.9163 218.252 -8.83809C232.494 12.0029 229.097 51.3421 226.994 78.3518C224.931 104.862 223.211 123.026 206.232 145.577C188.13 169.622 154.746 184.168 127.835 179.126C103.18 174.508 95.569 124.595 77.9929 108.1C63 90 59.4488 114 35.9999 78.3514C25.5 48.5 36.3355 20.9025 59.4488 -1.20617Z"
                  fill="#92CDC8"
                />
                <path
                  id="Vector_2"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M116.532 -48.8241C150.016 -53.6718 180.545 -31.3673 205.295 -8.38905C224.572 9.50777 229.828 35.5987 235.184 61.3324C240.103 84.9599 241.65 107.977 234.307 130.986C224.308 162.313 217.892 202.469 186.729 213.155C155.228 223.957 123.085 199.046 97.4081 177.928C76.1939 160.48 95.8816 138.604 86.0001 113C74.1043 82.1765 23.7248 47.3412 35.0155 16.263C47.3423 -17.667 80.7446 -43.6431 116.532 -48.8241Z"
                  stroke="black"
                />
              </g>
            </svg>
          </div>

          <section id="chats" style={{ boxShadow: "none" }}>
            <div className="chats-container">
              <Input
                id="search"
                innerRef={searchUserNameRef}
                autoComplete="off"
                disabled={false}
                inputType={"text"}
                placeholder="Search users..."
                icon={Search}
                onClickIcon={() => {
                  handleSearchName(searchUserNameRef.current.value);
                }}
                onBlur={() => {
                  handleSearchName(searchUserNameRef.current.value);
                }}
                onKeyDown={() => {
                  handleSearchName(searchUserNameRef.current.value);
                }}
                inputWidth={"68vw"}
              ></Input>

              <br />

              <div className="button-container">
                <button
                  className="chats-button"
                  disabled={chats.length > 0 ? false : true}
                  style={{
                    backgroundColor: viewRecent ? "#D88DB6" : "#ffffff",
                    color:
                      chats.length === 0
                        ? "#d9d9d9"
                        : viewRecent
                        ? "#ffffff"
                        : "#D88DB6",
                    cursor: chats.length > 0 ? "pointer" : "not-allowed",
                  }}
                  onClick={() => {
                    setViewRecent(true);
                    setViewAll(false);
                  }}
                  onTouchMove={() => {
                    listUsers.length > 0
                      ? handleViewAllUsers()
                      : handleViewRecentChats();
                  }}
                >
                  Recent chats
                </button>
                <button
                  className="chats-button"
                  style={{
                    backgroundColor: viewAll ? "#D88DB6" : "#ffffff",
                    color: viewAll ? "#ffffff" : "#D88DB6",
                  }}
                  onClick={() => {
                    handleViewAllUsers();
                  }}
                  onTouchMove={() => {
                    setViewRecent(true);
                    setViewAll(false);
                  }}
                >
                  All users
                </button>
              </div>

              <br />
              <>
                {chats.length > 0 && viewRecent ? (
                  <>
                    <ChatList
                      chats={chats}
                      alreadyCookies={alreadyCookies}
                      imageProfile={imageProfile()}
                      cookies={getCookies}
                      viewportSize={viewportSize}
                      startMessageRemoval={startMessageRemoval}
                      setStartMessageRemoval={setStartMessageRemoval}
                      toRemove={toRemove}
                      setToRemove={setToRemove}
                      viewAll={viewAll}
                      setViewAll={setViewAll}
                      viewRecent={viewRecent}
                      setViewRecent={setViewRecent}
                      handleStartConversation={handleStartConversation}
                      getAllUsers={getAllUsers}
                      chatWarningRemoved={chatWarningRemoved}
                      setChatWarningRemoved={setChatWarningRemoved}
                    ></ChatList>
                    <div id="modal2" className="modal2">
                      {!!chatToGo && !!userActually ? (
                        <Channel
                          userId={userActually.userId}
                          userImageProfileChatting={
                            userActually.imageProfile === chatToGo.imageProfile
                              ? chatToGo.imageProfileReceiver
                              : chatToGo.imageProfile
                          }
                          userName={userActually.userName}
                          chatIdNow={chatToGo.chatId}
                          userIdChatting={chatToGo.receiverUserId}
                          userNameChatting={
                            userActually.userName === chatToGo.senderName
                              ? chatToGo.receiverName
                              : chatToGo.senderName
                          }
                          closeChannel={() => hideModal(true)}
                          removeListener={removeListener}
                          remove={chatToGo.remove}
                          removedByUserId={chatToGo.removedByUserId}
                          removedDateTime={chatToGo.removedDateTime}
                          windowSize={viewportSize}
                          online={chatToGo.logged}
                          userActually={userActually}
                        ></Channel>
                      ) : null}
                    </div>
                  </>
                ) : chats.length === 0 && viewRecent ? (
                  <div className="large-desktop-chats-container">
                    <h5 style={{ color: "#000" }}>Nothing here yet 🥴</h5>
                  </div>
                ) : search === "" && viewAll ? (
                  <>
                    <ChatList
                      usersPerPage={usersPerPage}
                      listUsers={listUsers}
                      alreadyCookies={alreadyCookies}
                      imageProfile={imageProfile()}
                      cookies={getCookies}
                      viewportSize={viewportSize}
                      startMessageRemoval={startMessageRemoval}
                      setStartMessageRemoval={setStartMessageRemoval}
                      toRemove={toRemove}
                      setToRemove={setToRemove}
                      viewAll={viewAll}
                      setViewAll={setViewAll}
                      viewRecent={viewRecent}
                      setViewRecent={setViewRecent}
                      handleStartConversation={handleStartConversation}
                      handleInitiateChat={handleInitiateChat}
                      usersQuantity={usersQuantity}
                      handleSeeMoreUsers={handleSeeMoreUsers}
                    ></ChatList>
                    <div id="modal2" className="modal2">
                      {!!chatToGo && !!userActually ? (
                        <Channel
                          userId={userActually.userId}
                          userImageProfileChatting={
                            userActually.imageProfile === chatToGo.imageProfile
                              ? chatToGo.imageProfileReceiver
                              : chatToGo.imageProfile
                          }
                          userName={userActually.userName}
                          chatIdNow={chatToGo.chatId}
                          userIdChatting={chatToGo.receiverUserId}
                          userNameChatting={
                            userActually.userName === chatToGo.senderName
                              ? chatToGo.receiverName
                              : chatToGo.senderName
                          }
                          closeChannel={() => hideModal(true)}
                          removeListener={removeListener}
                          remove={chatToGo.remove}
                          removedByUserId={chatToGo.removedByUserId}
                          removedDateTime={chatToGo.removedDateTime}
                          windowSize={viewportSize}
                          online={chatToGo.logged}
                          userActually={userActually}
                        ></Channel>
                      ) : null}
                    </div>
                  </>
                ) : search !== "" &&
                  listUsersFiltered.length === 0 &&
                  viewAll ? (
                  <ChatList
                    search={search}
                    listUsersFiltered={listUsersFiltered}
                    alreadyCookies={alreadyCookies}
                    imageProfile={imageProfile()}
                    cookies={getCookies}
                    viewportSize={viewportSize}
                    startMessageRemoval={startMessageRemoval}
                    setStartMessageRemoval={setStartMessageRemoval}
                    toRemove={toRemove}
                    setToRemove={setToRemove}
                    viewAll={viewAll}
                    setViewAll={setViewAll}
                    viewRecent={viewRecent}
                    setViewRecent={setViewRecent}
                    handleStartConversation={handleStartConversation}
                    usersQuantity={usersQuantity}
                  ></ChatList>
                ) : search !== "" && listUsersFiltered.length > 0 && viewAll ? (
                  <ChatList
                    search={search}
                    listUsersFiltered={listUsersFiltered}
                    alreadyCookies={alreadyCookies}
                    imageProfile={imageProfile()}
                    cookies={getCookies}
                    viewportSize={viewportSize}
                    startMessageRemoval={startMessageRemoval}
                    setStartMessageRemoval={setStartMessageRemoval}
                    toRemove={toRemove}
                    setToRemove={setToRemove}
                    viewAll={viewAll}
                    setViewAll={setViewAll}
                    viewRecent={viewRecent}
                    setViewRecent={setViewRecent}
                    handleStartConversation={handleStartConversation}
                    handleInitiateChat={handleInitiateChat}
                    usersQuantity={usersQuantity}
                  ></ChatList>
                ) : (
                  <div
                    className="chats-container"
                    style={{
                      borderTop: "1px solid #1b1b1b",
                      borderTopLeftRadius: "20px",
                      borderTopRightRadius: "20px",
                      paddingTop: "6vh",
                      backgroundColor: "#ffffff",
                      height: "60vh",
                    }}
                  >
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
                      There's no users...
                    </h3>

                    <br />

                    <div style={{ padding: "0 4vw", width: "90vw" }}>
                      <div className="chat-item" onClick={() => {}}>
                        <div className="chat-item-profile-image-container">
                          <Avatar
                            avatarBackgroundColor={"#ffffff"}
                            frameBackgroundColor={"#d9d9d9"}
                            frameBodyBackgroundColor={"#ffffff"}
                          ></Avatar>

                          <div className="chat-item-body-status ">
                            <div
                              className="chat-item-status"
                              style={{
                                backgroundColor: "#7a7a7a",
                              }}
                            ></div>
                          </div>
                        </div>
                        <br />
                      </div>
                      <br />
                    </div>

                    <div style={{ padding: "0 4vw", width: "90vw" }}>
                      <div className="chat-item">
                        <div className="chat-item-profile-image-container">
                          <Avatar
                            avatarBackgroundColor={"#ffffff"}
                            frameBackgroundColor={"#d9d9d9"}
                            frameBodyBackgroundColor={"#ffffff"}
                          ></Avatar>

                          <div className="chat-item-body-status ">
                            <div
                              className="chat-item-status"
                              style={{
                                backgroundColor: "#7a7a7a",
                              }}
                            ></div>
                          </div>
                        </div>

                        <br />
                      </div>
                      <br />
                    </div>

                    <div style={{ padding: "0 4vw", width: "90vw" }}>
                      <div className="chat-item">
                        <div className="chat-item-profile-image-container">
                          <Avatar
                            avatarBackgroundColor={"#ffffff"}
                            frameBackgroundColor={"#d9d9d9"}
                            frameBodyBackgroundColor={"#ffffff"}
                          ></Avatar>

                          <div className="chat-item-body-status ">
                            <div
                              className="chat-item-status"
                              style={{
                                backgroundColor: "#7a7a7a",
                              }}
                            ></div>
                          </div>
                        </div>
                        <br />
                      </div>
                      <br />
                    </div>
                  </div>
                )}
              </>
            </div>
          </section>
        </div>
      ) : null}
    </AbstractBackground>
  );
};

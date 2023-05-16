import "./ForgotPassword.css";

import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import moment from "moment";
import Cookies from "universal-cookie";
import ArrowBack from "../../assets/chevron-left.svg";
import VisibilityOff from "../../assets/visibility-off.svg";
import Visibility from "../../assets/visibility.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";
import { Input } from "../../components/Input/Input";
import { Loading } from "../../components/Loading/Loading";
import { Warning } from "../../components/Warning/Warning";
import { AuthContext } from "../../context/AuthContext";
import { auth, database } from "../../firebase/firebaseInitialize";
import ViewportListener from "../../utils/checkViewport";
import { removeUserImageProfile } from "../../utils/utils";

export const ForgotPassword = () => {
  const [userName, setUserName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [seeOldPassword, setSeeOldPassword] = useState(false);
  const [seeNewPassword, setSeeNewPassword] = useState(false);
  const [seeConfirmNewPassword, setSeeConfirmNewPassword] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [correctOldPassword, setCorrectOldPassword] = useState(null);
  const [correctSecurityQuestions, setCorrectSecurityQuestions] =
    useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [tooltip0, setTooltip0] = useState("");
  const [tooltip1, setTooltip1] = useState("");
  const [tooltip2, setTooltip2] = useState("");

  const [securityQuestionAnswer1, setSecurityQuestionAnswer1] = useState("");
  const [securityQuestionAnswer2, setSecurityQuestionAnswer2] = useState("");
  const [securityQuestionAnswer3, setSecurityQuestionAnswer3] = useState("");
  const informationOfUsingSecurityQuestions =
    "These security questions  will help us to indentify when you need to access your account or reset your password.";
  const [user, setUser] = useState(null);

  const securityQuestionRef1 = useRef("");
  const securityQuestionRef2 = useRef("");
  const securityQuestionRef3 = useRef("");

  const [securityQuestion0, setSecurityQuestion0] = useState("");
  const [securityQuestion1, setSecurityQuestion1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");

  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [arrAnswersDatabase, setArrAnswersDatabase] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const viewportSize = ViewportListener();

  const userNameRef = useRef("");

  const answer1Ref = useRef("");
  const answer2Ref = useRef("");
  const answer3Ref = useRef("");

  const oldPasswordRef = useRef("");
  const newPasswordRef = useRef("");
  const confirmNewPasswordRef = useRef("");

  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [requiresRecentLogin, setRequiresRecentLogin] = useState(false);
  const cookies = new Cookies();

  const getCookies = {
    userName: cookies.get("userName"),
    userId: cookies.get("userId"),
    uptime: cookies.get("uptime"),
  };

  const goBack = () => {
    navigate("/login");
  };

  const handleSearchUser = async () => {
    const currentUserName = userName;
    let same = false;
    const q = query(
      collection(database, "users"),
      where("userName", "==", currentUserName)
    );

    const querySnapshot = await getDocs(q);
    let result = { userId: "" };
    let result2 = null;

    querySnapshot.forEach((doc) => {
      result2 = doc.data();
      result = { userId: doc.id };
    });

    let result3 = { ...result, ...result2 };
    if (result3.userId !== "") {
      setUserExists(true);
      setUser(result3);
      await handleGetSecurityQuestions(result3);
    } else {
      setUserExists(false);
    }

    return same;
  };

  const handleGetSecurityQuestions = async (user) => {
    let arrSecurityQuestions = [];
    let arrSecurityQuestionsIds = [];
    let arrAnswers = [];
    const q = query(
      collection(database, "answerSecurityQuestion"),
      where("userId", "==", user.userId)
    );

    const querySnapshot = await getDocs(q);

    let result = null;
    let resultForOtherQuery = null;
    let resultForArrAnswers = null;

    querySnapshot.forEach((doc) => {
      result = doc.data();
      resultForOtherQuery = doc.data().securityQuestionId.toString();
      resultForArrAnswers = doc.data().answer;

      arrSecurityQuestions.push(result);
      arrSecurityQuestionsIds.push(resultForOtherQuery);
      arrAnswers.push(resultForArrAnswers);
    });
    setArrAnswersDatabase(arrAnswers);
    arrSecurityQuestionsIds.map(async (item, index) => {
      await getValueOfSecurityQuestions(item, index);
    });
  };

  const getValueOfSecurityQuestions = async (securityQuestionId, index) => {
    const q = doc(database, "securityQuestion", securityQuestionId);
    const querySnapshot = await getDoc(q);

    switch (index) {
      case 0:
        setSecurityQuestion0(querySnapshot.data().question);
        setTooltip0(querySnapshot.data().question);
        break;

      case 1:
        setSecurityQuestion1(querySnapshot.data().question);
        setTooltip1(querySnapshot.data().question);
        break;

      case 2:
        setSecurityQuestion2(querySnapshot.data().question);
        setTooltip2(querySnapshot.data().question);
        break;
    }

    let result = null;
    let resultForOtherQuery = null;

    return true;
  };

  const handleSendInputedAnswers = () => {
    let same0 = false;
    let same1 = false;
    let same2 = false;

    arrAnswersDatabase.map((item, index) => {
      if (item === answer1Ref.current.value) {
        same0 = true;
      }
      if (item === answer2Ref.current.value) {
        same1 = true;
      }
      if (item === answer3Ref.current.value) {
        same2 = true;
      }
    });

    if (same0 && same1 && same2) {
      setCorrectSecurityQuestions(true);
    } else {
      setCorrectSecurityQuestions(false);
    }
  };

  const handleComparePassword = async () => {
    let same = false;
    let userIndex = user.userId;
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

  const handlingOldVsNewPasswordComparison = () => {
    let samePassword = false;
    if (confirmNewPasswordRef.current.value === oldPasswordRef.current.value) {
      samePassword = true;
      return samePassword;
    } else {
      return samePassword;
    }
  };

  const handleChangePassword = async () => {
    if (
      answer1Ref.current.value !== "" &&
      answer2Ref.current.value !== "" &&
      answer3Ref.current.value !== ""
    ) {
      try {
        setLoading(true);
        let result = await handleComparePassword();
        let isPasswordSame = handlingOldVsNewPasswordComparison();

        if (!!result && isPasswordSame === false) {
          const passwordRef = doc(database, "userxPassword", result);
          await updateDoc(passwordRef, {
            password: confirmNewPasswordRef.current.value,
          });

          const dummyEmail = userName.replaceAll(" ", "") + "@email.com";
          await signInWithEmailAndPassword(
            auth,
            dummyEmail.toLowerCase(),
            oldPasswordRef.current.value
          );
          const user = auth.currentUser;
          const newPassword = confirmNewPasswordRef.current.value;
          await updatePassword(user, newPassword);
          navigate("/login");
        } else {
          setCorrectOldPassword(false);
        }
      } catch (e) {
        setRequiresRecentLogin(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelChange = () => {
    setUser(null);
    setUserName("");
    setUserExists(null);

    setSecurityQuestion0("");
    setSecurityQuestion1("");
    setSecurityQuestion2("");

    setCorrectSecurityQuestions(null);

    answer1Ref.current.value = "";
    answer2Ref.current.value = "";
    answer3Ref.current.value = "";

    oldPasswordRef.current.value = "";
    newPasswordRef.current.value = "";
    confirmNewPasswordRef.current.value = "";
    setCorrectOldPassword(null);
  };

  const handleLogout = async () => {
    try {
      const userRef = doc(database, "users", user.userId);
      await updateDoc(userRef, {
        uptime: moment().format(),
        logged: false,
      });
    } catch (error) {
      // console.log(error);
    }
    removeUserImageProfile();
    cookies.remove("uptime");
    cookies.remove("logged");
    cookies.remove("userName");
    cookies.remove("userId");

    signOut(auth);

    navigate("/login");
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
              For security purposes, please log in before changing your password
              as it has been a while since your last login.
            </Warning>

            <div className="profile-header">
              <button
                className="go-back-button-desktop"
                style={{ width: "2vw", height: "2vw" }}
              >
                <img
                  src={ArrowBack}
                  className="image-go-back-button-desktop"
                  onClick={goBack}
                ></img>
              </button>

              <h2 className="title-forgot-password">Reset Password</h2>
            </div>

            <label className="register-subtitle" style={{ width: "80vw" }}>
              Profile
            </label>

            <div className="line"></div>

            <br />

            <div
              className="instructions-container"
              style={{
                backgroundColor:
                  userExists !== null && userExists !== false
                    ? "#92CDC8"
                    : "#D9D9D9",
              }}
            >
              <label style={{ fontSize: "13px" }}>
                Enter the Username associated with your account and follow the
                instructions.
              </label>
            </div>

            <br />
            <br />

            <div className="container-with-instructions-to-send">
              <Input
                id="username"
                value={userName}
                autoComplete="off"
                required={true}
                inputType={"text"}
                label="Username"
                disabled={userExists ? true : false}
                styleContainerInput={{
                  paddingLeft: "5px",
                  height: "6vh",
                  maxHeight: "80px",
                  width: "22vw",
                }}
                inputWidth={"18vw"}
                onChange={(e) => setUserName(e)}
              ></Input>

              <button
                className="button-send"
                disabled={userExists ? true : false}
                onClick={async () => await handleSearchUser()}
              >
                Send Instructions
              </button>
            </div>

            <h4
              className="error-message"
              style={{
                color:
                  userExists === null
                    ? "#ffffff"
                    : userExists
                    ? "#ffffff"
                    : "#ff5555",
                width: "70vw",
                marginBlockStart: "8px",
                marginBlockEnd: 0,
              }}
            >
              This Username does not exist.
            </h4>
            <br />

            {userExists !== null && userExists !== false ? (
              <div style={{ transition: "all 400ms" }}>
                <label className="register-subtitle" style={{ width: "80vw" }}>
                  Security Questions
                </label>

                <div className="line"></div>

                <br />

                <div
                  className="instructions-container"
                  style={{
                    backgroundColor:
                      correctSecurityQuestions !== null &&
                      correctSecurityQuestions !== false
                        ? "#92CDC8"
                        : "#D9D9D9",
                  }}
                >
                  <label style={{ fontSize: "13px" }}>
                    Now you will need to answer all security questions correctly
                    to continue the password reset process.
                  </label>
                </div>

                <br />
                <br />

                <div className="container-with-instructions-to-send-2">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Input
                      id="securityQuestion1"
                      innerDefaultValue={securityQuestion0}
                      autoComplete="off"
                      inputType={"text"}
                      disabled={correctSecurityQuestions ? true : false}
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
                      disabled={correctSecurityQuestions ? true : false}
                      styleContainerInput={{
                        paddingLeft: "5px",
                        height: "6vh",
                        maxHeight: "80px",
                        width: "22vw",
                      }}
                      inputWidth={"18vw"}
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
                      disabled={correctSecurityQuestions ? true : false}
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
                      disabled={correctSecurityQuestions ? true : false}
                      styleContainerInput={{
                        paddingLeft: "5px",
                        height: "6vh",
                        maxHeight: "80px",
                        width: "22vw",
                      }}
                      inputWidth={"18vw"}
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
                      disabled={correctSecurityQuestions ? true : false}
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
                      disabled={correctSecurityQuestions ? true : false}
                      styleContainerInput={{
                        paddingLeft: "5px",
                        height: "6vh",
                        maxHeight: "80px",
                        width: "22vw",
                      }}
                      inputWidth={"18vw"}
                    ></Input>
                  </div>
                </div>

                <h4
                  className="error-message-for-security-questions"
                  style={{
                    color:
                      correctSecurityQuestions === null
                        ? "#ffffff"
                        : correctSecurityQuestions
                        ? "#ffffff"
                        : "#ff5555",
                  }}
                >
                  Please review your answers and try again.
                </h4>

                <br />

                <div className="container-button-send">
                  <button
                    className="button-send"
                    disabled={correctSecurityQuestions ? true : false}
                    onClick={() => handleSendInputedAnswers()}
                  >
                    Send Answers
                  </button>
                </div>

                <br />

                {correctSecurityQuestions !== null &&
                correctSecurityQuestions !== false ? (
                  <>
                    <label
                      className="register-subtitle"
                      style={{ width: "80vw" }}
                    >
                      Password
                    </label>

                    <div className="line"></div>

                    <br />

                    <div className="container-with-instructions-to-send-2">
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
                        pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{10,})$"
                        styleContainerInput={{
                          paddingLeft: "5px",
                          height: "6vh",
                          maxHeight: "80px",
                          width: "22vw",
                        }}
                        inputWidth={"15%"}
                        containerPasswordIconWidth={"20vw"}
                      ></Input>

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
                        pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{10,})$"
                        styleContainerInput={{
                          paddingLeft: "5px",
                          height: "6vh",
                          maxHeight: "80px",
                          width: "22vw",
                        }}
                        inputWidth={"15%"}
                        containerPasswordIconWidth={"20vw"}
                      ></Input>

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
                        pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{10,})$"
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

                    <h4
                      className="error-message-for-old-password"
                      style={{
                        color:
                          correctOldPassword === null
                            ? "#ffffff"
                            : correctOldPassword
                            ? "#ffffff"
                            : "#ff5555",
                      }}
                    >
                      Please check your old password and create a new one
                      following the pattern below. It cannot be the same as your
                      previous password.
                    </h4>
                    <br />

                    <div style={{ display: "flex", justifyContent: "center" }}>
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
                    </div>
                  </>
                ) : null}

                <br />
                <br />
                <br />

                <div className="container-button-send">
                  <button
                    className="button-send"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#D88DB6",
                    }}
                    onClick={handleCancelChange}
                  >
                    Cancel change
                  </button>

                  <button
                    className="button-send"
                    onClick={async () => {
                      await handleChangePassword();
                    }}
                  >
                    Change Password
                  </button>
                </div>

                <br />
                <br />
              </div>
            ) : null}
          </AbstractBackground>
        ) : (
          <AbstractBackground>
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
            <button onClick={goBack} className="go-back-button">
              <img src={ArrowBack} className="image-go-back-button"></img>
            </button>

            <div
              className="privacy-policy-container"
              style={{ minHeight: "100vh" }}
            >
              <br />

              <h2
                style={{
                  fontWeight: "500",
                  marginBottom: "1vh",
                  width: "-webkit-fill-available",
                }}
              >
                Reset Password
              </h2>

              <br />

              <label
                className="register-subtitle"
                style={{
                  width:
                    viewportSize?.orientation === "portrait"
                      ? viewportSize?.mediaType === "Mobile"? "-webkit-fill-available"
                      : "80vw" : "-webkit-fill-available",
                }}
              >
                Profile
              </label>
              <div className="line"></div>

              <br />
              <br />

              <div
                className="instructions-container"
                style={{
                  backgroundColor:
                    userExists !== null && userExists !== false
                      ? "#92CDC8"
                      : "#D9D9D9",
                }}
              >
                <label style={{ fontSize: "13px" }}>
                  Enter the Username associated with your account and follow the
                  instructions.
                </label>
              </div>

              <br />
              <br />

              <Input
                id="username"
                value={userName}
                disabled={userExists ? true : false}
                autoComplete="on"
                required={true}
                inputType={"text"}
                label="Username"
                onChange={(e) => setUserName(e)}
                inputWidth={
                  viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                }
              ></Input>
              <h4
                className="error-message"
                style={{
                  color:
                    userExists === null
                      ? "#ffffff"
                      : userExists
                      ? "#ffffff"
                      : "#ff5555",
                  width: "70vw",
                  marginBlockStart: "8px",
                  marginBlockEnd: 0,
                }}
              >
                This Username does not exist.
              </h4>

              <br />

              <button
                className="button-send"
                disabled={userExists ? true : false}
                onClick={async () => await handleSearchUser()}
              >
                Send Instructions
              </button>

              <br />
              <br />

              {userExists !== null && userExists !== false ? (
                <div style={{ transition: "all 400ms" }}>
                  <label
                    className="register-subtitle"
                    style={{ width: "80vw" }}
                  >
                    Security Questions
                  </label>

                  <div className="line"></div>

                  <br />
                  <br />

                  <div
                    className="instructions-container"
                    style={{
                      backgroundColor:
                        correctSecurityQuestions !== null &&
                        correctSecurityQuestions !== false
                          ? "#92CDC8"
                          : "#D9D9D9",
                    }}
                  >
                    <label style={{ fontSize: "13px" }}>
                      Now you will need to answer all security questions
                      correctly to continue the password reset process.
                    </label>
                  </div>

                  <br />
                  <br />

                  <div className="tooltip" style={{width: viewportSize?.orientation === "portrait"
                          ? "80vw"
                          : "70vw"}}>
                    {tooltip0 !== "" ? (
                      <span className="tooltiptext">{tooltip0}</span>
                    ) : null}
                    <Input
                      id="securityQuestion1"
                      innerDefaultValue={securityQuestion0}
                      autoComplete="off"
                      inputType={"text"}
                      disabled={correctSecurityQuestions ? true : false}
                      label=""
                      placeholder="Security Question 1"
                      readOnly={true}
                      title=" "
                      inputWidth={
                        viewportSize?.orientation === "portrait"
                          ? "74vw"
                          : "70vw"
                      }
                    ></Input>
                  </div>

                  <br />
                  <br />

                  <Input
                    id="answer1"
                    innerRef={answer1Ref}
                    autoComplete="off"
                    required={true}
                    inputType={"text"}
                    placeholder="Answer Security Question 1"
                    disabled={correctSecurityQuestions ? true : false}
                    inputWidth={
                      viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                    }
                  ></Input>
                  <br />
                  <br />
                  <div className="tooltip" style={{width: viewportSize?.orientation === "portrait"
                          ? "80vw"
                          : "70vw"}}>
                    {tooltip1 !== "" ? (
                      <span className="tooltiptext">{tooltip1}</span>
                    ) : null}

                    <Input
                      id="securityQuestion2"
                      innerDefaultValue={securityQuestion1}
                      autoComplete="off"
                      inputType={"text"}
                      disabled={correctSecurityQuestions ? true : false}
                      label=""
                      placeholder="Security Question 2"
                      readOnly={true}
                      title=" "
                      inputWidth={
                        viewportSize?.orientation === "portrait"
                          ? "74vw"
                          : "70vw"
                      }
                    ></Input>
                  </div>

                  <br />
                  <br />

                  <Input
                    id="answer2"
                    innerRef={answer2Ref}
                    autoComplete="off"
                    required={true}
                    inputType={"text"}
                    placeholder="Answer Security Question 2"
                    disabled={correctSecurityQuestions ? true : false}
                    inputWidth={
                      viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                    }
                  ></Input>
                  <br />
                  <br />

                  <div className="tooltip" style={{width: viewportSize?.orientation === "portrait"
                          ? "80vw"
                          : "70vw"}}>
                    {tooltip2 !== "" ? (
                      <span className="tooltiptext">{tooltip2}</span>
                    ) : null}
                    <Input
                      id="securityQuestion3"
                      innerDefaultValue={securityQuestion2}
                      autoComplete="off"
                      inputType={"text"}
                      disabled={correctSecurityQuestions ? true : false}
                      label=""
                      placeholder="Security Question 3"
                      readOnly={true}
                      title=" "
                      inputWidth={
                        viewportSize?.orientation === "portrait"
                          ? "74vw"
                          : "70vw"
                      }
                    ></Input>
                  </div>

                  <br />
                  <br />

                  <Input
                    id="answer3"
                    innerRef={answer3Ref}
                    autoComplete="off"
                    required={true}
                    inputType={"text"}
                    placeholder="Answer Security Question 3"
                    disabled={correctSecurityQuestions ? true : false}
                    inputWidth={
                      viewportSize?.orientation === "portrait" ? "77vw" : "70vw"
                    }
                  ></Input>
                  <br />

                  <h4
                    className="error-message-for-security-questions"
                    style={{
                      display:
                        correctSecurityQuestions === null
                          ? "none"
                          : correctSecurityQuestions
                          ? "none"
                          : "block",
                    }}
                  >
                    Please review your answers and try again.
                  </h4>

                  <br />

                  <div className="container-button-send">
                    <button
                      className="button-send-2"
                      disabled={correctSecurityQuestions ? true : false}
                      onClick={() => handleSendInputedAnswers()}
                    >
                      Send Answers
                    </button>
                  </div>

                  {correctSecurityQuestions !== null &&
                  correctSecurityQuestions !== false ? (
                    <>
                      <br />
                      <br />
                      <label
                        className="register-subtitle"
                        style={{ width: "80vw" }}
                      >
                        Password
                      </label>

                      <div className="line"></div>

                      <br />

                      <div className="container-with-instructions-to-send-2">
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
                          pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{10,})$"
                          inputWidth={"66vw"}
                          containerPasswordIconWidth={
                            viewportSize?.orientation === "portrait"
                              ? "86vw"
                              : "76vw"
                          }
                        ></Input>
                        <br />
                        <br />

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
                          pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{10,})$"
                          inputWidth={"66vw"}
                          containerPasswordIconWidth={
                            viewportSize?.orientation === "portrait"
                              ? "86vw"
                              : "76vw"
                          }
                        ></Input>
                        <br />
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
                          pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{10,})$"
                          inputWidth={"66vw"}
                          containerPasswordIconWidth={
                            viewportSize?.orientation === "portrait"
                              ? "86vw"
                              : "76vw"
                          }
                        ></Input>
                      </div>

                      <h4
                        className="error-message-for-old-password"
                        style={{
                          display:
                            correctOldPassword === null
                              ? "none"
                              : correctOldPassword
                              ? "none"
                              : "block",
                        }}
                      >
                        Please check your old password and create a new one
                        following the pattern below. It cannot be the same as
                        your previous password.
                      </h4>

                      <br />

                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
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
                      </div>
                    </>
                  ) : null}

                  <br />

                  <div className="container-button-send">
                    <button
                      className="button-send"
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#D88DB6",
                      }}
                      onClick={handleCancelChange}
                    >
                      Cancel change
                    </button>
                    <br />

                    <button
                      className="button-send"
                      onClick={async () => {
                        await handleChangePassword();
                      }}
                    >
                      Change Password
                    </button>
                  </div>

                  <br />
                  <br />
                </div>
              ) : null}
            </div>
          </AbstractBackground>
        )
      ) : null}
    </>
  );
};

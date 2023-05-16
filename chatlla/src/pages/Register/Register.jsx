import "./Register.css";

import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChevronLeft from "../../assets/chevron-left.svg";
import Avatar from "../../assets/person.svg";
import ExpandLess from "../../assets/pink-expand-less.svg";
import ExpandMore from "../../assets/pink-expand-more.svg";
import VisibilityOff from "../../assets/visibility-off.svg";
import Visibility from "../../assets/visibility.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";
import { Input } from "../../components/Input/Input";
import { Loading } from "../../components/Loading/Loading";
import { Warning } from "../../components/Warning/Warning";
import { auth, database } from "../../firebase/firebaseInitialize";
import ViewportListener from "../../utils/checkViewport";
import { handleImage } from "../../utils/utils";

export const Register = () => {
  const [securityQuestion1, setSecurityQuestion1] = useState({
    index: 0,
    question: "",
  });
  const [disableSecurityQuestion1, setDisableSecurityQuestion1] =
    useState(false);
  const [securityQuestion2, setSecurityQuestion2] = useState({
    index: 0,
    question: "",
  });
  const [disableSecurityQuestion2, setDisableSecurityQuestion2] =
    useState(false);
  const [securityQuestion3, setSecurityQuestion3] = useState({
    index: 0,
    question: "",
  });
  const [password, setPassword] = useState("");
  const [focusPassword, setFocusPassword] = useState(false);
  const parameterFirstRef = useRef(null);
  const parameterSecondRef = useRef(null);
  const parameterThirdRef = useRef(null);
  const parameterFourthRef = useRef(null);
  const parameterFifthRef = useRef(null);
  const [strength, setStrength] = useState(0);

  const [imageProfile, setImageProfile] = useState(Avatar);
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);
  const [showOptions1, setShowOptions1] = useState(false);
  const [showOptions2, setShowOptions2] = useState(false);
  const [showOptions3, setShowOptions3] = useState(false);
  const [disableSecurityQuestion3, setDisableSecurityQuestion3] =
    useState(false);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const informationOfUsingSecurityQuestions =
    "These security questions  will help us to indentify when you need to access your account or reset your password.";
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [filteredSecurityQuestions, setFilteredSecurityQuestions] = useState(
    []
  );
  const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] =
    useState(false);
  const [usersQuantity, setUsersQuantity] = useState(0);
  const [maximumAmountOfUser, setMaximumAmount] = useState(100);
  const [error, setError] = useState(false);
  const [emailAlreadyInUseError, setEmailAlreadyInUseError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

  const regularExpression =
    "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+.!])([a-zA-Z0-9@#$%^&+.!]{10,})$";

  const navigate = useNavigate();

  const usernameRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const answer1Ref = useRef("");
  const answer2Ref = useRef("");
  const answer3Ref = useRef("");

  const TEXT_SECURITY_QUESTION_1 = "Security Question 1";
  const TEXT_SECURITY_QUESTION_2 = "Security Question 2";
  const TEXT_SECURITY_QUESTION_3 = "Security Question 3";

  const viewportSize = ViewportListener();

  let arrSecurityQuestions = [];

  const verifyUserNames = async () => {
    const q = query(
      collection(database, "users"),
      where("userName", "==", usernameRef.current.value)
    );

    const querySnapshot = await getDocs(q);

    let result = { userId: "" };
    let result2 = null;

    querySnapshot.forEach((doc) => {
      result2 = doc.data();

      result2 = doc.data();
      result = { userId: doc.id };
    });

    let result3 = { ...result, ...result2 };

    if (result3.userId === "") {
      result3 = null;
    }

    return result3;
  };

  const getSecurityQuestions = async () => {
    let securityQuestions = [];
    let securityQuestionsToAdd = [];

    const q = query(collection(database, "securityQuestion"));

    const querySnapshot = await getDocs(q);

    let result2 = null;

    querySnapshot.forEach((doc) => {
      result2 = doc.data();

      securityQuestions.push(result2);
    });

    securityQuestions.forEach((securityQuestion, id) => {
      securityQuestionsToAdd.push({
        id: id,
        question: securityQuestion.question,
      });
    });

    return securityQuestionsToAdd;
  };

  const scrollToTop = () => {
    const c = document.documentElement.scrollTop || document.body.scrollTop;

    if (c > 0) {
      window.scrollTo(0, 0);
    }
  };

  const Mount = async () => {
    window.scrollTo(0, 0);
    const result = await getSecurityQuestions();
    setSecurityQuestions(result);
    setFilteredSecurityQuestions(result);
  };

  useEffect(() => {
    Mount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let maximumUserAmountArr = await getUsersQuantity();

    if (maximumUserAmountArr === maximumAmountOfUser) {
      alert("Maximum quantity exceeded");
    } else {
      let result = await verifyUserNames();

      if (result === null || result === undefined) {
        try {
          setLoading(true);
          // // ------------------------------ add user ----------------------------------------
          let trimmedUserName = usernameRef.current.value.trim();

          const dummyEmail = trimmedUserName.replaceAll(" ", "") + "@email.com";

          const responseToCreateUserAuth = await createUserWithEmailAndPassword(
            auth,
            dummyEmail,
            passwordRef.current.value
          );

          const userRef = await setDoc(
            doc(database, "users", responseToCreateUserAuth.user.uid),
            {
              createdAt: moment().format(),
              imageProfile: imageProfile,
              logged: false,
              modifiedAt: moment().format(),
              uptime: moment().format(),
              userName: trimmedUserName,
            }
          );
          // // ------------------------------- add password ----------------------------------------

          const userxPasswordRef = await addDoc(
            collection(database, "userxPassword"),
            {
              password: passwordRef.current.value,
              userId: responseToCreateUserAuth.user.uid,
            }
          );

          // // ------------------------------ Add security Question 1 --------------------------------

          const securityQuestionxUser1Ref = await addDoc(
            collection(database, "securityQuestionxUser"),
            {
              securityQuestionId: securityQuestion1.index,
              userId: responseToCreateUserAuth.user.uid,
            }
          );

          // // ------------------------------ Add security Question 2 --------------------------------

          const securityQuestionxUser2Ref = await addDoc(
            collection(database, "securityQuestionxUser"),
            {
              securityQuestionId: securityQuestion2.index,
              userId: responseToCreateUserAuth.user.uid,
            }
          );

          // // ------------------------------ Add security Question 3 --------------------------------

          const securityQuestionxUser3Ref = await addDoc(
            collection(database, "securityQuestionxUser"),
            {
              securityQuestionId: securityQuestion3.index,
              userId: responseToCreateUserAuth.user.uid,
            }
          );

          // // ------------------------------ Add answer security Question 1 --------------------------------

          const answerSecurityQuestion1Ref = await addDoc(
            collection(database, "answerSecurityQuestion"),
            {
              answer: answer1Ref.current.value,
              createdAt: moment().format(),
              modifiedAt: moment().format(),
              securityQuestionId: securityQuestion1.index,
              userId: responseToCreateUserAuth.user.uid,
            }
          );

          // // ------------------------------ Add answer security Question 2 --------------------------------

          const answerSecurityQuestion2Ref = await addDoc(
            collection(database, "answerSecurityQuestion"),
            {
              answer: answer2Ref.current.value,
              createdAt: moment().format(),
              modifiedAt: moment().format(),
              securityQuestionId: securityQuestion2.index,
              userId: responseToCreateUserAuth.user.uid,
            }
          );

          // // ------------------------------ Add answer security Question 3 --------------------------------

          const answerSecurityQuestion3Ref = await addDoc(
            collection(database, "answerSecurityQuestion"),
            {
              answer: answer3Ref.current.value,
              createdAt: moment().format(),
              modifiedAt: moment().format(),
              securityQuestionId: securityQuestion3.index,
              userId: responseToCreateUserAuth.user.uid,
            }
          );

          // // --------------------------------------- increase totalUsers  --------------------------------------------------------

          navigate("/login");
        } catch (error) {
          setEmailAlreadyInUseError(true);
        } finally {
          setLoading(false);
        }
      } else if (!!result) {
        setEmailAlreadyInUseError(true);
      }
    }
  };

  const handleEditSecurityQuestions = () => {
    const checkboxElement = document.getElementById(
      "CheckboxAcceptedTermsAndConditions"
    );

    checkboxElement.click();

    usernameRef.current.value = "";
    passwordRef.current.value = "";
    confirmPasswordRef.current.value = "";

    arrSecurityQuestions = [];

    setSecurityQuestion1({ index: 0, question: "" });
    setSecurityQuestion2({ index: 0, question: "" });
    setSecurityQuestion3({ index: 0, question: "" });

    answer1Ref.current.value = "";
    answer2Ref.current.value = "";
    answer3Ref.current.value = "";

    setShowOptions1(false);
    setShowOptions2(false);
    setShowOptions3(false);

    setDisableSecurityQuestion1(false);
    setDisableSecurityQuestion2(false);
    setDisableSecurityQuestion3(false);

    setFilteredSecurityQuestions([]);
    setSecurityQuestions([]);

    setImageProfile(Avatar);

    setAcceptedTermsAndConditions(false);

    setStrength(0);
    parameterFirstRef.current.style.textDecoration = "none";
    parameterSecondRef.current.style.textDecoration = "none";
    parameterThirdRef.current.style.textDecoration = "none";
    parameterFourthRef.current.style.textDecoration = "none";
    parameterFifthRef.current.style.textDecoration = "none";

    scrollToTop();

    Mount();
  };

  function remove(arrOriginal, elementToRemove) {
    return arrOriginal.filter(function (el) {
      return el !== elementToRemove;
    });
  }

  const getUsersQuantity = async () => {
    let quantityArray = [];

    const q = query(collection(database, "users"));

    const querySnapshot = await getDocs(q);

    let result = null;

    querySnapshot.forEach((doc) => {
      result = doc.data();

      quantityArray.push(result);
    });

    return quantityArray.length;
  };

  const handleVerifyPassword = () => {
    const passwordInput = passwordRef.current.value;
    const validPassword = new RegExp(regularExpression).test(passwordInput);

    if (validPassword === false) {
      setPasswordError(true);
      return false;
    } else {
      error !== false ? setError(false) : null;
    }
  };

  const calculateStrength = () => {
    const password = passwordRef.current.value;
    let score = 0;

    parameterFirstRef.current.style.textDecoration = "none";
    parameterSecondRef.current.style.textDecoration = "none";
    parameterThirdRef.current.style.textDecoration = "none";
    parameterFourthRef.current.style.textDecoration = "none";
    parameterFifthRef.current.style.textDecoration = "none";

    // Contains at least one capital letter?
    if (/[A-Z]/.test(password)) {
      score += 20;
      parameterFirstRef.current.style.textDecoration = "line-through";
    }

    // Contains at least one lowercase letter?
    if (/[a-z]/.test(password)) {
      score += 20;
      parameterSecondRef.current.style.textDecoration = "line-through";
    }

    // Contains at least one number?
    if (/\d/.test(password)) {
      score += 20;
      parameterThirdRef.current.style.textDecoration = "line-through";
    }

    // Password has at least 10 characters?
    if (password.length >= 10) {
      score += 20;
      parameterFourthRef.current.style.textDecoration = "line-through";
    }

    // Contains at least one special character?
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 20;
      parameterFifthRef.current.style.textDecoration = "line-through";
    }

    setStrength(score);
  };

  const handleSelect = (
    securityQuestionNumber,
    selectedOption,
    selectedOptionIndex
  ) => {
    const SECURITY_QUESTION_1 = 1;
    const SECURITY_QUESTION_2 = 2;
    const SECURITY_QUESTION_3 = 3;

    switch (securityQuestionNumber) {
      case SECURITY_QUESTION_1:
        arrSecurityQuestions = [];

        setSecurityQuestion1({
          index: selectedOption.id,
          question: selectedOption.question,
        });
        setDisableSecurityQuestion1(true);
        setShowOptions1(false);

        arrSecurityQuestions = remove(
          filteredSecurityQuestions,
          filteredSecurityQuestions[selectedOptionIndex]
        );

        setFilteredSecurityQuestions(arrSecurityQuestions);
        break;
      case SECURITY_QUESTION_2:
        arrSecurityQuestions = [];

        setSecurityQuestion2({
          index: selectedOption.id,
          question: selectedOption.question,
        });
        setDisableSecurityQuestion2(true);
        setShowOptions2(false);

        arrSecurityQuestions = remove(
          filteredSecurityQuestions,
          filteredSecurityQuestions[selectedOptionIndex]
        );

        setFilteredSecurityQuestions(arrSecurityQuestions);
        break;
      case SECURITY_QUESTION_3:
        arrSecurityQuestions = [];

        setSecurityQuestion3({
          index: selectedOption.id,
          question: selectedOption.question,
        });
        setDisableSecurityQuestion3(true);
        setShowOptions3(false);

        arrSecurityQuestions = remove(
          filteredSecurityQuestions,
          filteredSecurityQuestions[selectedOptionIndex]
        );

        setFilteredSecurityQuestions(arrSecurityQuestions);
        break;
      default:
        throw new Error(
          `Invalid security question number: ${securityQuestionNumber}`
        );
    }
  };

  return (
    <AbstractBackground className="login-main-abstract-background">
      <Loading loading={loading}></Loading>
      <Warning
        setOpenWarning={setEmailAlreadyInUseError}
        openWarning={emailAlreadyInUseError}
      >
        It looks like this <strong>username</strong> is{" "}
        <strong>already registered</strong> on our platform. Are you already a
        user here? If so, please log in and let's pick up where we left off. If
        not, try using a <strong>different username</strong> to sign up and join
        our community!
      </Warning>

      <Warning
        setOpenWarning={setPasswordError}
        openWarning={passwordError}
        type="error"
      >
        For security reasons, we require passwords to have at least 10
        characters, including one uppercase letter, one lowercase letter, and
        one number. Thanks for helping us keep your account safe!
      </Warning>
      <button onClick={() => navigate("/login")} className="go-back-button">
        <img src={ChevronLeft} className={"image-go-back-button"}></img>
      </button>
      <form
        onSubmit={(e) => handleSubmit(e)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="register-container"
      >
        <br />
        <br />

        <div className="title-login-container">
          <h1 className="register-title">Hi!</h1>
          <label className="register-subtitle">
            Create your user account and enjoy with us a simple and free way to
            connect with everyone, exchanging messages whenever you want.
          </label>
        </div>

        <br />
        <br />

        <label htmlFor="avatar" className="add-photo">
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/png, image/jpeg"
            onChange={async (e) => {
              let originalImage = document.querySelector("#img");
              e.preventDefault();
              let result = await handleImage(e);
              setImageProfile(result);
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
          src={imageProfile !== Avatar ? imageProfile : null}
          style={{
            display: "block",
            width: "30vw",
            height: "30vw",
            borderRadius: "15vw",
            maxWidth: "150px",
            maxHeight: "150px",
            objectFit: "cover",
            objectPosition: "50% 40%",
            zIndex: imageProfile !== Avatar ? 2 : null,
          }}
        ></img>
        <br />

        <label style={{ color: "#808080" }}>
          Insert a profile picture (optional)
        </label>

        <br />
        <br />

        <Input
          id="username"
          innerRef={usernameRef}
          autoComplete="on"
          required={true}
          inputType={"text"}
          label="Username"
          inputWidth="70vw"
        ></Input>

        <br />
        <br />

        <Input
          id="password"
          innerRef={passwordRef}
          onChange={calculateStrength}
          autoComplete="off"
          required={true}
          inputType={"password"}
          label="Password&nbsp;"
          icon={Visibility}
          iconToTurn={VisibilityOff}
          setSeePassword={setSeePassword}
          seePassword={seePassword}
          readOnly={focusPassword ? false : true}
          pattern={regularExpression}
          inputWidth="68vw"
          onTouchEnd={() => setFocusPassword(true)}
          onFocus={() => {
            setFocusPassword(true);
          }}
          onBlur={() => {
            setFocusPassword(false);
          }}
        ></Input>

        <section
          style={{
            display: "flex",
            width: "80vw",
            height: "1vh",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1vh",
          }}
        >
          <div
            style={{
              width: "15vw",
              height: viewportSize
                ? viewportSize === "Desktop"
                  ? ".5vw"
                  : "1vw"
                : ".5vw",
              backgroundColor:
                strength === 0
                  ? "#d9d9d9"
                  : strength >= 20 && strength < 40
                  ? "#ffc75f"
                  : strength >= 40 && strength < 60
                  ? "orange"
                  : strength >= 60 && strength < 80
                  ? "yellow"
                  : strength >= 80 && strength < 100
                  ? "#8bcf8b"
                  : "green",
            }}
          ></div>
          <div
            style={{
              width: "15vw",
              height: viewportSize
                ? viewportSize === "Desktop"
                  ? ".5vw"
                  : "1vw"
                : ".5vw",
              backgroundColor:
                strength === 0
                  ? "#d9d9d9"
                  : strength >= 20 && strength < 40
                  ? "#d9d9d9"
                  : strength >= 40 && strength < 60
                  ? "orange"
                  : strength >= 60 && strength < 80
                  ? "yellow"
                  : strength >= 80 && strength < 100
                  ? "#8bcf8b"
                  : "green",
            }}
          ></div>
          <div
            style={{
              width: "15vw",
              height: viewportSize
                ? viewportSize === "Desktop"
                  ? ".5vw"
                  : "1vw"
                : ".5vw",
              backgroundColor:
                strength === 0
                  ? "#d9d9d9"
                  : strength >= 20 && strength < 40
                  ? "#d9d9d9"
                  : strength >= 40 && strength < 60
                  ? "#d9d9d9"
                  : strength >= 60 && strength < 80
                  ? "yellow"
                  : strength >= 80 && strength < 100
                  ? "#8bcf8b"
                  : "green",
            }}
          ></div>
          <div
            style={{
              width: "15vw",
              height: viewportSize
                ? viewportSize === "Desktop"
                  ? ".5vw"
                  : "1vw"
                : ".5vw",
              backgroundColor:
                strength === 0
                  ? "#d9d9d9"
                  : strength >= 20 && strength < 40
                  ? "#d9d9d9"
                  : strength >= 40 && strength < 60
                  ? "#d9d9d9"
                  : strength >= 60 && strength < 80
                  ? "#d9d9d9"
                  : strength >= 80 && strength < 100
                  ? "#8bcf8b"
                  : "green",
            }}
          ></div>
          <div
            style={{
              width: "15vw",
              height: viewportSize
                ? viewportSize === "Desktop"
                  ? ".5vw"
                  : "1vw"
                : ".5vw",
              backgroundColor: strength === 100 ? "green" : "#d9d9d9",
            }}
          ></div>
        </section>

        <br />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ul
            className="password-condition-list"
            style={{
              background: error ? "#92cdc8" : "#d9d9d9",
              color: error ? "#fff" : "#000",
            }}
          >
            <li ref={parameterFirstRef} className="list-item-password">
              Contain at least 1 uppercase character (A-Z);
            </li>
            <li ref={parameterSecondRef} className="list-item-password">
              Contain at least 1 lowercase character (a-z);
            </li>
            <li
              ref={parameterThirdRef}
              id="parameter-third"
              className="list-item-password"
            >
              Contain at least 1 number;
            </li>
            <li
              ref={parameterFourthRef}
              id="parameter-fourth"
              className="list-item-password"
            >
              Contain at least 10 characters;
            </li>
            <li
              ref={parameterFifthRef}
              id="parameter-fourth"
              className="list-item-password"
            >
              Contain at least symbol (!?.@#$%&).
            </li>
          </ul>
        </div>
        <br />

        <Input
          id="confirmPassword"
          innerRef={confirmPasswordRef}
          autoComplete="off"
          required={true}
          inputType={"password"}
          label="Confirm Password"
          icon={Visibility}
          iconToTurn={VisibilityOff}
          setSeePassword={setSeeConfirmPassword}
          seePassword={seeConfirmPassword}
          pattern={regularExpression}
          inputWidth="68vw"
        ></Input>

        {passwordRef.current.value !== confirmPasswordRef.current.value ? (
          <label style={{ color: "#ff5555" }}>
            The passwords are different
          </label>
        ) : (
          <label></label>
        )}
        <br />

        <h4 className="security-questions">Security Questions</h4>

        <br />

        <div className="tooltip">
          {viewportSize &&
          viewportSize !== "Desktop" &&
          securityQuestion1.question !== "" ? (
            <span className="tooltiptext">{securityQuestion1.question}</span>
          ) : null}

          <Input
            id="securityQuestion1"
            required={true}
            inputType={"text"}
            placeholder={securityQuestion1.question || TEXT_SECURITY_QUESTION_1}
            icon={ExpandLess}
            iconToTurn={ExpandMore}
            disabled={disableSecurityQuestion1}
            onClickIcon={() => {
              setShowOptions1(!showOptions1);
            }}
            styleContainerInput={{
              width: viewportSize?.orientation === "portrait" ? "86vw" : "90vw",
            }}
            inputWidth={
              viewportSize?.orientation === "portrait" ? "58vw" : "80vw"
            }
            title={securityQuestion1.question || TEXT_SECURITY_QUESTION_1}
          ></Input>
        </div>

        {showOptions1 ? (
          <ul
            style={{
              listStyleType: "none",
              textAlign: "left",
              backgroundColor: "#ffffff",
              width: "75vw",
              paddingInlineStart: 0,
              margin: 0,
            }}
          >
            {filteredSecurityQuestions.map((item, index) => {
              return (
                <div key={index} style={{ borderBottom: "1px solid #d9d9d9" }}>
                  <br />
                  <li
                    style={{
                      cursor: "pointer",
                      padding: "1vw 0 4vw 0",
                      fontSize: "13px",
                    }}
                    onClick={() => handleSelect(1, item, index)}
                  >
                    {item.question}
                  </li>
                </div>
              );
            })}
          </ul>
        ) : null}

        <br />
        <br />

        <Input
          id="answer1"
          innerRef={answer1Ref}
          required={true}
          inputType={"text"}
          placeholder="Answer Security Question 1"
          disabled={answer1 !== "" ? true : false}
        ></Input>

        <br />
        <br />

        <div className="tooltip">
          {viewportSize &&
          viewportSize !== "Desktop" &&
          securityQuestion2.question !== "" ? (
            <span className="tooltiptext">{securityQuestion2.question}</span>
          ) : null}
          <Input
            id="securityQuestion2"
            required={true}
            inputType={"text"}
            placeholder={securityQuestion2.question || TEXT_SECURITY_QUESTION_2}
            icon={ExpandLess}
            iconToTurn={ExpandMore}
            disabled={disableSecurityQuestion2}
            onClickIcon={() => {
              setShowOptions2(!showOptions2);
            }}
            styleContainerInput={{
              width: viewportSize?.orientation === "portrait" ? "86vw" : "90vw",
            }}
            inputWidth={
              viewportSize?.orientation === "portrait" ? "58vw" : "80vw"
            }
            title={securityQuestion2.question || TEXT_SECURITY_QUESTION_2}
          ></Input>
        </div>

        {showOptions2 ? (
          <ul
            style={{
              listStyleType: "none",
              textAlign: "left",
              backgroundColor: "#ffffff",
              width: "75vw",
              paddingInlineStart: 0,
              margin: 0,
            }}
          >
            {filteredSecurityQuestions.map((item, index) => {
              return (
                <div key={index} style={{ borderBottom: "1px solid #d9d9d9" }}>
                  <br />
                  <li
                    style={{
                      cursor: "pointer",
                      padding: "1vw 0 4vw 0",
                      fontSize: "13px",
                    }}
                    onClick={() => handleSelect(2, item, index)}
                  >
                    {item.question}
                  </li>
                </div>
              );
            })}
          </ul>
        ) : null}

        <br />
        <br />

        <Input
          id="answer2"
          innerRef={answer2Ref}
          required={true}
          inputType={"text"}
          placeholder="Answer Security Question 2"
          disabled={answer2 !== "" ? true : false}
        ></Input>

        <br />
        <br />
        <div className="tooltip">
          {viewportSize &&
          viewportSize !== "Desktop" &&
          securityQuestion3.question !== "" ? (
            <span className="tooltiptext">{securityQuestion3.question}</span>
          ) : null}
          <Input
            id="securityQuestion3"
            required={true}
            inputType={"text"}
            placeholder={securityQuestion3.question || TEXT_SECURITY_QUESTION_3}
            icon={ExpandLess}
            iconToTurn={ExpandMore}
            disabled={disableSecurityQuestion3}
            onClickIcon={() => {
              setShowOptions3(!showOptions3);
            }}
            styleContainerInput={{
              width: viewportSize?.orientation === "portrait" ? "86vw" : "90vw",
            }}
            inputWidth={
              viewportSize?.orientation === "portrait" ? "58vw" : "80vw"
            }
            title={securityQuestion3.question || TEXT_SECURITY_QUESTION_3}
          ></Input>
        </div>
        {showOptions3 ? (
          <ul
            style={{
              listStyleType: "none",
              textAlign: "left",
              backgroundColor: "#ffffff",
              width: "75vw",
              paddingInlineStart: 0,
              margin: 0,
            }}
          >
            {filteredSecurityQuestions.map((item, index) => {
              return (
                <div key={index} style={{ borderBottom: "1px solid #d9d9d9" }}>
                  <br />
                  <li
                    style={{
                      cursor: "pointer",
                      padding: "1vw 0 4vw 0",
                      fontSize: "13px",
                    }}
                    onClick={() => handleSelect(3, item, index)}
                  >
                    {item.question}
                  </li>
                </div>
              );
            })}
          </ul>
        ) : null}

        <br />
        <br />

        <Input
          id="answer3"
          innerRef={answer3Ref}
          required={true}
          inputType={"text"}
          placeholder="Answer Security Question 3"
          disabled={answer3 !== "" ? true : false}
        ></Input>

        <br />

        <br />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "75vw",
            height: "10vh",
            backgroundColor: "#d9d9d9",
            borderRadius: "20px",
            padding: "4vw",
          }}
        >
          <p>{informationOfUsingSecurityQuestions}</p>
        </div>
        <br />
        <br />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            minHeight: "5vh",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "86vw",
          }}
        >
          <label className="form-control">
            <input
              id="CheckboxAcceptedTermsAndConditions"
              type="checkbox"
              value={acceptedTermsAndConditions}
              required
              onChange={() =>
                setAcceptedTermsAndConditions(!acceptedTermsAndConditions)
              }
            ></input>
          </label>

          <label className="checkbox-text">
            Accept the{" "}
            <a href="/register/terms-and-conditions-of-use">
              <strong
                style={{
                  color: "#D88DB6",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() =>
                  navigate("/register/terms-and-conditions-of-use")
                }
              >
                Terms and Conditions of Use
              </strong>
            </a>{" "}
            and{" "}
            <a href="/register/privacy-policy">
              <strong
                style={{
                  color: "#D88DB6",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/register/privacy-policy")}
              >
                Privacy Policy
              </strong>
            </a>
            .
          </label>
        </div>

        <br />
        <br />

        <button
          className="login-button"
          style={{ backgroundColor: "#92CDC8" }}
          onClick={handleEditSecurityQuestions}
        >
          Edit Fields
        </button>

        <br />
        <br />
        <input
          type="submit"
          value="Register Now"
          className="register-button"
          onClick={() => handleVerifyPassword()}
          disabled={
            answer1Ref.current.value === "" ||
            answer2Ref.current.value === "" ||
            answer3Ref.current.value === "" ||
            passwordRef.current.value !== confirmPasswordRef.current.value ||
            passwordRef.current.value === "" ||
            confirmPasswordRef.current.value === "" ||
            usernameRef.current.value === "" ||
            acceptedTermsAndConditions === false
              ? true
              : false
          }
        ></input>
        <br />
        <br />
      </form>
    </AbstractBackground>
  );
};

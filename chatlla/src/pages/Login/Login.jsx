import "./Login.css";

import {
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

import VisibilityOff from "../../assets/visibility-off.svg";
import Visibility from "../../assets/visibility.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";
import { CookiesContainer } from "../../components/CookiesContainer/CookiesContainer";
import { Input } from "../../components/Input/Input";
import { Loading } from "../../components/Loading/Loading";
import { Environment } from "../../environment/config";
import { auth, database } from "../../firebase/firebaseInitialize";
import ViewportListener from "../../utils/checkViewport";
import { handleAuthorizationCookies, imageProfile } from "../../utils/utils";
import { SplashScreen } from "../SplashScreen/SplashScreen";

export const Login = () => {
  const [alreadyCookies, setAlreadyCookies] = useState(null);
  const [showCookiesContainer, setShowCookiesContainer] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(
    handleAuthorizationCookies()
  );
  const [seePassword, setSeePassword] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [loading, setLoading] = useState(false);
  const userNameRef = useRef("");
  const passwordRef = useRef("");
  const cookies = new Cookies();
  const getCookies = {
    userName: cookies.get("userName"),
    userId: cookies.get("userId"),
    uptime: cookies.get("uptime"),
    logged: cookies.get("logged"),
  };
  const navigate = useNavigate();
  const viewportSize = ViewportListener();

  const Mount = () => {
    setAlreadyCookies(getCookies);

    if (getCookies.userName !== undefined || handleAuthorizationCookies()) {
      setCookiesAccepted(true);
    } else {
      setShowCookiesContainer(true);
    }
  };

  useEffect(() => {
    Mount();
  }, []);

  const getUserData = async () => {
    let test = null;

    const q = query(
      collection(database, "users"),
      where("userName", "==", userNameRef.current.value)
    );

    const querySnapshot = await getDocs(q);

    let result = { userId: "" };
    let result2 = null;

    querySnapshot.forEach((doc) => {
      result2 = doc.data();
      result = { userId: doc.id };
    });

    let result3 = { ...result, ...result2 };

    if (result.userId === "") {
      return (test = false);
    } else {
      cookies.set("userId", result3.userId, {
        path: "/",
        domain: Environment.PUBLIC_URL,
      });
      cookies.set("userName", result3.userName, {
        path: "/",
        domain: Environment.PUBLIC_URL,
      });

      setUserImageProfile(result3.imageProfile);

      cookies.set("uptime", moment().format(), {
        path: "/",
        domain: Environment.PUBLIC_URL,
      });

      return result3;
    }
  };

  const KEY = `imageProfile`;

  const setUserImageProfile = (image) => {
    localStorage.setItem(KEY, image);
  };

  const comparePasswords = async (userIndex, passwordToCompare) => {
    let same = false;
    const q = query(
      collection(database, "userxPassword"),
      where("userId", "==", userIndex)
    );

    const querySnapshot = await getDocs(q);
    let result = { userxPassword: "" };
    let result2 = null;
    querySnapshot.forEach((doc) => {
      result2 = doc.data();
      result = { userxPassword: doc.id };
    });

    let result3 = { ...result, ...result2 };
    if (result3.password === passwordToCompare) {
      same = true;
    } else {
      same = false;
    }

    return same;
  };

  const handleLogin = async () => {
    let authenticated = false;

    if (passwordRef.current.value !== "") {
      try {
        setLoading(true);

        const userDataFirebase = await getUserData();

        if (userDataFirebase === false) {
          throw "User not found";
        } else {
          let result = true;

          result ? (authenticated = true) : (authenticated = false);

          const dummyEmail =
            userNameRef.current.value.replaceAll(" ", "") + "@email.com";

          await signInWithEmailAndPassword(
            auth,
            dummyEmail.toLowerCase(),
            passwordRef.current.value
          );

          const user = auth.currentUser;

          await updateProfile(user, {
            displayName: userNameRef.current.value,
          });

          /* ----------------------------------------------------------------------------------------- */
          /* ----------------------------------------------------------------------------------------- */

          if (authenticated) {
            setIsWrong(false);

            const userRef = doc(database, "users", userDataFirebase.userId);

            await updateDoc(userRef, {
              uptime: moment().format(),
              logged: true,
            });

            cookies.set("uptime", moment().format(), {
              path: "/",
              domain: Environment.PUBLIC_URL,
            });

            cookies.set("logged", true, {
              path: "/",
              domain: Environment.PUBLIC_URL,
            });

            navigate("/chats", {
              state: {
                userId: getCookies.userId,
                userName: getCookies.userName,
                imageProfile: imageProfile(),
              },

              replace: true,
            });
          } else {
            setIsWrong(true);
          }
          setLoading(false);
        }
      } catch (error) {
        const user = auth.currentUser;
        const credential = passwordRef.current.value;

        reauthenticateWithCredential(user, credential)
          .then(() => {
            // User re-authenticated.
          })
          .catch((error) => {});

        setLoading(false);
        setIsWrong(true);
      }
    } else {
      setIsWrong(true);
    }
    return true;
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <AbstractBackground className="login-main-abstract-background">
      <Loading loading={loading}></Loading>

      {cookiesAccepted === false ? (
        <CookiesContainer
          setCookiesAccepted={setCookiesAccepted}
        ></CookiesContainer>
      ) : null}

      {viewportSize !== undefined ? (
        viewportSize === "Desktop" ? (
          <div
            style={{
              display: "flex",
              width: "100vw",
              height: "100vh",
              backgroundColor: "#ffffff",
            }}
          >
            <section
              style={{
                display: "flex",
                width: "50%",
                height: "100vh",
                backgroundColor: "#ffffff",
              }}
            >
              <SplashScreen width="50%" goToAnotherPage={false}></SplashScreen>
            </section>

            <section
              style={{
                display: "flex",
                width: "50%",
                height: "100vh",
                backgroundColor: "#ffffff",
              }}
            >
              <div className="login-container" style={{ textAlign: "left" }}>
                <br />
                <br />
                <div className="title-login-container">
                  <h1 className="register-title">Welcome!</h1>
                  <label className="register-subtitle">
                    Sign in to continue
                  </label>
                </div>
                <br />
                <br />

                <Input
                  id="username"
                  innerRef={userNameRef}
                  autoComplete="on"
                  required={true}
                  inputType={"text"}
                  label="Username"
                ></Input>

                <br />
                <br />

                <Input
                  id="password"
                  innerRef={passwordRef}
                  autoComplete="off"
                  required={true}
                  inputType={"password"}
                  label="Password"
                  icon={Visibility}
                  iconToTurn={VisibilityOff}
                  setSeePassword={setSeePassword}
                  seePassword={seePassword}
                  containerPasswordIconWidth={"44vw"}
                ></Input>

                <h4
                  className="error-message"
                  style={{ color: isWrong ? "#ff5555" : "#ffffff" }}
                >
                  Incorrect username or password
                </h4>
                <p
                  style={{
                    color: "#000000",
                    textDecoration: "underline",
                    cursor: "pointer",
                    marginTop: 0,
                  }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </p>

                <br />

                <button
                  className="login-button"
                  style={{
                    backgroundColor: cookiesAccepted ? "#D88DB6" : "#d9d9d9",
                  }}
                  disabled={cookiesAccepted ? false : true}
                  onClick={handleLogin}
                >
                  Sign in
                </button>

                <br />

                <div
                  className="login-button"
                  style={{
                    display: "flex",
                    width: "-webkit-fill-available",
                    backgroundColor: "#ffffff",
                    color: "rgb(27, 27, 27)",
                    padding: "2vw 6vw 0 6vw",
                    borderRadius: 0,
                    marginBottom: "5vh",
                  }}
                >
                  <p style={{ margin: 0 }}>Don't have an account?</p>
                  <strong
                    onClick={handleRegister}
                    style={{
                      paddingLeft: "1vw",
                      color: "#D88DB6",
                      cursor: "pointer",
                    }}
                  >
                    Sign Up
                  </strong>
                </div>
                <br />
              </div>
            </section>
          </div>
        ) : (
          <div
            className="login-container"
            style={{ textAlign: "left", minHeight: "100vh" }}
          >
            <br />
            <br />
            <div className="title-login-container">
              <h1 className="register-title">Welcome!</h1>
              <label className="register-subtitle">Sign in to continue</label>
            </div>
            <br />
            <br />
            <br />
            <Input
              id="username"
              innerRef={userNameRef}
              autoComplete="on"
              required={true}
              inputType={"text"}
              label="Username"
              inputWidth={"76vw"}
            ></Input>
            <br />

            <Input
              id="password"
              innerRef={passwordRef}
              autoComplete="off"
              required={true}
              inputType={"password"}
              label="Password"
              icon={Visibility}
              iconToTurn={VisibilityOff}
              setSeePassword={setSeePassword}
              seePassword={seePassword}
              inputWidth={"66vw"}
            ></Input>

            <h4
              className="error-message"
              style={{ color: isWrong ? "#ff5555" : "#ffffff" }}
            >
              Incorrect username or password
            </h4>
            <p
              style={{
                color: "#000000",
                textDecoration: "underline",
                cursor: "pointer",
                marginTop: 0,
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </p>
            <br />
            <button
              className="login-button"
              disabled={cookiesAccepted ? false : true}
              onClick={handleLogin}
            >
              Sign in
            </button>
            <br />
            <div
              className="login-button"
              style={{
                display: "flex",
                width: "-webkit-fill-available",
                backgroundColor: "#ffffff",
                color: "rgb(27, 27, 27)",
                padding: "2vw 6vw 0 6vw",
                borderRadius: 0,
                marginBottom: "5vh",
              }}
            >
              <p style={{ margin: 0 }}>Don't have an account?</p>
              <strong
                onClick={handleRegister}
                style={{ paddingLeft: "2vw", color: "#D88DB6" }}
              >
                Sign Up
              </strong>
            </div>
            <br />
          </div>
        )
      ) : null}
    </AbstractBackground>
  );
};

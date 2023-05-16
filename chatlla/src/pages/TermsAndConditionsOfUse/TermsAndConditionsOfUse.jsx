import "./TermsAndConditionsOfUse.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChevronLeft from "../../assets/chevron-left.svg";
import ExpandLess from "../../assets/pink-expand-less.svg";
import ExpandMore from "../../assets/pink-expand-more.svg";
import TermsAndConditionsOfUse1 from "../../assets/terms-and-conditions-of-use-1.svg";
import TermsAndConditionsOfUse2 from "../../assets/terms-and-conditions-of-use-2.svg";
import TermsAndConditionsOfUse3 from "../../assets/terms-and-conditions-of-use-3.svg";
import TermsAndConditionsOfUse4 from "../../assets/terms-and-conditions-of-use-4.svg";
import TermsAndConditionsOfUse5 from "../../assets/terms-and-conditions-of-use-5.svg";
import { AbstractBackground } from "../../components/AbstractBackground/AbstractBackground";
import { AuthContext } from "../../context/AuthContext";
import ViewportListener from "../../utils/checkViewport";

export const TermsAndConditionsOfUse = () => {
  const navigate = useNavigate();
  const [topic1ExpandMore, setTopic1ExpandMore] = useState(false);
  const [topic2ExpandMore, setTopic2ExpandMore] = useState(false);
  const [topic3ExpandMore, setTopic3ExpandMore] = useState(false);
  const [topic4ExpandMore, setTopic4ExpandMore] = useState(false);
  const [topic5ExpandMore, setTopic5ExpandMore] = useState(false);
  const [topic6ExpandMore, setTopic6ExpandMore] = useState(false);
  const [topic7ExpandMore, setTopic7ExpandMore] = useState(false);
  const URL = window.location.href;
  const [goTo, setGoTo] = useState("");
  const viewportSize = ViewportListener();
  const { currentUser } = useContext(AuthContext);
  const isiPhone = /iPhone/i.test(navigator.userAgent);

  const Mount = async () => {
    window.scrollTo(0, 0);

    if (URL.includes("register")) {
      setGoTo("/register");
    } else {
      setGoTo("/edit-profile");
    }
  };

  useEffect(() => {
    Mount();
  }, []);

  return (
    <AbstractBackground>
      <button onClick={() => navigate(goTo)} className="go-back-button">
        <img src={ChevronLeft} className={"image-go-back-button"}></img>
      </button>

      <div className="terms-and-conditions-container">
        <br />
        <h2
          style={{
            fontWeight: "500",
            marginBottom: "1vh",
            width: "100%",
            textAlign: "left",
          }}
        >
          Terms and Conditions of Use
        </h2>

        <p
          className={
            viewportSize
              ? viewportSize.orientation === "landscape" && isiPhone
                ? "iphone-terms-and-conditions-text"
                : "terms-and-conditions-text"
              : "terms-and-conditions-text"
          }
        >
          Update date: January 23, 2022.
        </p>

        <p
          className={
            viewportSize
              ? viewportSize.orientation === "landscape" && isiPhone
                ? "iphone-terms-and-conditions-text"
                : "terms-and-conditions-text"
              : "terms-and-conditions-text"
          }
        >
          ⏳ Reading time: 5 minutes.
        </p>
        <br />
        <br />

        <img src={TermsAndConditionsOfUse1}></img>

        <br />
        <br />

        <p className="terms-and-conditions-text">
          Hello friend, we are{" "}
          <strong
            className={
              viewportSize
                ? viewportSize.orientation === "landscape" && isiPhone
                  ? "iphone-terms-and-conditions-text"
                  : "terms-and-conditions-text"
                : "terms-and-conditions-text"
            }
            style={{ color: "#D88DB6" }}
          >
            {" "}
            Chatlla
          </strong>
          !
        </p>

        <p
          className={
            viewportSize
              ? viewportSize.orientation === "landscape" && isiPhone
                ? "iphone-terms-and-conditions-text"
                : "terms-and-conditions-text"
              : "terms-and-conditions-text"
          }
        >
          We are happy to hear that you are here!
        </p>

        <p className="terms-and-conditions-text">
          Know our terms and conditions of use.
        </p>

        <p className="terms-and-conditions-text">
          In order to help you in the reading, we wrote this document with a
          very clear and practical language. We separate each part of it by
          topics. Consult whenever necessary.
        </p>

        <div className="topics-container">
          <div className="topics">
            <p
              className={
                viewportSize
                  ? viewportSize.orientation === "landscape" && isiPhone
                    ? "iphone-terms-and-conditions-text"
                    : "terms-and-conditions-text"
                  : "terms-and-conditions-text"
              }
            >
              1. How does our platform work?{" "}
            </p>
            <button
              className="topics-button"
              onClick={() => setTopic1ExpandMore(!topic1ExpandMore)}
            >
              <img src={topic1ExpandMore ? ExpandLess : ExpandMore}></img>
            </button>
          </div>

          {topic1ExpandMore ? (
            <p className="terms-and-conditions-text">
              The platform is characterized by the provision of a communication
              service between users in their daily lives through text messages
              exchanged in real time.
            </p>
          ) : null}
        </div>

        <div className="topics-container">
          <div className="topics">
            <p
              className={
                viewportSize
                  ? viewportSize.orientation === "landscape" && isiPhone
                    ? "iphone-terms-and-conditions-text"
                    : "terms-and-conditions-text"
                  : "terms-and-conditions-text"
              }
            >
              2. Who can use{" "}
              <strong style={{ color: "#d88db6" }}>Chatlla</strong>?{" "}
            </p>
            <button
              className="topics-button"
              onClick={() => setTopic2ExpandMore(!topic2ExpandMore)}
            >
              <img src={topic2ExpandMore ? ExpandLess : ExpandMore}></img>
            </button>
          </div>

          {topic2ExpandMore ? (
            <>
              <p
                className={
                  viewportSize
                    ? viewportSize.orientation === "landscape" && isiPhone
                      ? "iphone-terms-and-conditions-text"
                      : "terms-and-conditions-text"
                    : "terms-and-conditions-text"
                }
              >
                The platform recommends using it only for people over 16 years
                old.
              </p>
              <br />
              <br />
              <img src={TermsAndConditionsOfUse2} className="img"></img>
              <br />
              <br />

              <p>2.1. User account registration</p>

              <p className="terms-and-conditions-text">
                When you create an account on{" "}
                <strong
                  style={{ color: "#d88db6" }}
                  className={
                    viewportSize
                      ? viewportSize.orientation === "landscape" && isiPhone
                        ? "iphone-terms-and-conditions-text"
                        : "terms-and-conditions-text"
                      : "terms-and-conditions-text"
                  }
                >
                  Chatlla
                </strong>
                , (your “User Account”), we may collect certain important
                information about You, such as your username and profile
                picture, with more details at this link{" "}
                <a
                  href={
                    !currentUser
                      ? "/register/terms-and-conditions-of-use/privacy-policy"
                      : "/privacy-policy"
                  }
                >
                  <strong
                    className={
                      viewportSize
                        ? viewportSize.orientation === "landscape" && isiPhone
                          ? "iphone-terms-and-conditions-text"
                          : "terms-and-conditions-text"
                        : "terms-and-conditions-text"
                    }
                    style={{
                      color: "#d88db6",
                      textDecoration: "underline",
                    }}
                  >
                    Privacy Policy
                  </strong>
                </a>
                . It is important to make it clear that: You can cancel your
                account at any time
              </p>
            </>
          ) : null}
        </div>

        <div className="topics-container">
          <div className="topics">
            <p
              className={
                viewportSize
                  ? viewportSize.orientation === "landscape" && isiPhone
                    ? "iphone-terms-and-conditions-text"
                    : "terms-and-conditions-text"
                  : "terms-and-conditions-text"
              }
            >
              3. What are your responsibilities when using{" "}
              <strong
                className={
                  viewportSize
                    ? viewportSize.orientation === "landscape" && isiPhone
                      ? "iphone-terms-and-conditions-text"
                      : "terms-and-conditions-text"
                    : "terms-and-conditions-text"
                }
                style={{ color: "#d88db6" }}
              >
                Chatlla
              </strong>
              ?
            </p>
            <button
              className="topics-button"
              onClick={() => setTopic3ExpandMore(!topic3ExpandMore)}
            >
              <img src={topic3ExpandMore ? ExpandLess : ExpandMore}></img>
            </button>
          </div>

          {topic3ExpandMore ? (
            <>
              <p className="terms-and-conditions-text">
                We expect a good coexistence from you, valuing the cordiality
                between users. We remind you that In{" "}
                <strong
                  className={
                    viewportSize
                      ? viewportSize.orientation === "landscape" && isiPhone
                        ? "iphone-terms-and-conditions-text"
                        : "terms-and-conditions-text"
                      : "terms-and-conditions-text"
                  }
                  style={{ color: "#d88db6" }}
                >
                  Chatlla
                </strong>{" "}
                we do not accept any form of prejudice, be it of any nature and
                incitement to anger/violence. Users with such conduct are
                subject to suspension or cancellation of their user account.
              </p>
              <br />
              <br />
              <img src={TermsAndConditionsOfUse3} className="img"></img>
              <br />
              <br />
            </>
          ) : null}
        </div>

        <div className="topics-container">
          <div className="topics">
            <p className="topic-title terms-and-conditions-text">
              4. What about copyright?
            </p>
            <button
              className="topics-button"
              onClick={() => setTopic4ExpandMore(!topic4ExpandMore)}
            >
              <img src={topic4ExpandMore ? ExpandLess : ExpandMore}></img>
            </button>
          </div>

          {topic4ExpandMore ? (
            <>
              <p className="terms-and-conditions-text">
                These Terms and Conditions of Use grant You, our user, a
                non-exclusive license to access and make use of the platform and
                the services it makes available. Everything that was produced
                within the{" "}
                <strong
                  className={
                    viewportSize
                      ? viewportSize.orientation === "landscape" && isiPhone
                        ? "iphone-terms-and-conditions-text"
                        : "terms-and-conditions-text"
                      : "terms-and-conditions-text"
                  }
                  style={{ color: "#d88db6" }}
                >
                  Chatlla
                </strong>{" "}
                platform, such as the structure of the site, layout, interface
                design, images, illustrations, database and any other content
                and intellectual property rights belong solely and exclusively
                to{" "}
                <strong
                  className={
                    viewportSize
                      ? viewportSize.orientation === "landscape" && isiPhone
                        ? "iphone-terms-and-conditions-text"
                        : "terms-and-conditions-text"
                      : "terms-and-conditions-text"
                  }
                  style={{ color: "#d88db6" }}
                >
                  Chatlla
                </strong>
                . Under no circumstances do these Terms and Conditions of Use
                assign or transfer, in part or in whole, any intellectual
                property rights to the user, in this case You.
              </p>
              <br />
              <br />

              <img src={TermsAndConditionsOfUse4} className="img"></img>

              <br />
              <br />
            </>
          ) : null}
        </div>

        <div className="topics-container">
          <div className="topics">
            <p className="topic-title terms-and-conditions-text">
              5. Can this document be changed?{" "}
            </p>
            <button
              className="topics-button"
              onClick={() => setTopic5ExpandMore(!topic5ExpandMore)}
            >
              <img src={topic5ExpandMore ? ExpandLess : ExpandMore}></img>
            </button>
          </div>

          {topic5ExpandMore ? (
            <p className="terms-and-conditions-text">
              The items described in this document may be changed, at any time,
              to adapt or modify the services, and/or meet new legal
              requirements. The changes will be presented by{" "}
              <strong
                className={
                  viewportSize
                    ? viewportSize.orientation === "landscape" && isiPhone
                      ? "iphone-terms-and-conditions-text"
                      : "terms-and-conditions-text"
                    : "terms-and-conditions-text"
                }
                style={{ color: "#d88db6" }}
              >
                Chatlla
              </strong>{" "}
              directly on the website, and You can choose to accept the new
              content or not
            </p>
          ) : null}
        </div>

        <div className="topics-container">
          <div className="topics">
            <p
              className="terms-and-conditions-text"
              style={{ lineHeight: "1.8em" }}
            >
              6. What happens when I accept the Terms and Conditions of use and
              Privacy Policies?
            </p>
            <button
              className="topics-button"
              onClick={() => setTopic6ExpandMore(!topic6ExpandMore)}
            >
              <img src={topic6ExpandMore ? ExpandLess : ExpandMore}></img>
            </button>
          </div>

          {topic6ExpandMore ? (
            <p className="terms-and-conditions-text">
              You expressly authorize the platform to collect, use and store
              information arising from the use of the website, including when
              your information is filled in when registering or updating your
              user account, as expressly described in the{" "}
              <a
                href={
                  !currentUser
                    ? "/register/terms-and-conditions-of-use/privacy-policy"
                    : "/privacy-policy"
                }
              >
                <strong
                  className={
                    viewportSize
                      ? viewportSize.orientation === "landscape" && isiPhone
                        ? "iphone-terms-and-conditions-text"
                        : "terms-and-conditions-text"
                      : "terms-and-conditions-text"
                  }
                  style={{
                    color: "#d88db6",
                    textDecoration: "underline",
                  }}
                >
                  Privacy Policy
                </strong>
              </a>
              .
            </p>
          ) : null}
        </div>

        <div className="topics-container" style={{ borderBottom: "none" }}>
          <div className="topics">
            <p
              className={
                viewportSize
                  ? viewportSize.orientation === "landscape" && isiPhone
                    ? "iphone-terms-and-conditions-text"
                    : "terms-and-conditions-text"
                  : "terms-and-conditions-text"
              }
            >
              7. What else do you need to know?{" "}
            </p>
            <button
              className="topics-button"
              onClick={() => setTopic7ExpandMore(!topic7ExpandMore)}
            >
              <img src={topic7ExpandMore ? ExpandLess : ExpandMore}></img>
            </button>
          </div>

          {topic7ExpandMore ? (
            <>
              <p className="terms-and-conditions-text">
                In case of any questions, suggestions or problems with the use
                of the platform, you can contact support via email:{" "}
                <a
                  className={
                    viewportSize
                      ? viewportSize.orientation === "landscape" && isiPhone
                        ? "iphone-terms-and-conditions-text"
                        : "terms-and-conditions-text"
                      : "terms-and-conditions-text"
                  }
                  href="mailto:guilhermeagostin@gmail.com"
                >
                  guilhermeagostin@gmail.com
                </a>
                . With customer service, available on the following days and
                times: Monday to Friday, from 8 am to 5 pm.
              </p>
              <br />
              <br />
              <img src={TermsAndConditionsOfUse5} className="img"></img>
              <br />
              <br />
            </>
          ) : null}
        </div>

        <br />
        <br />
        <br />
      </div>
    </AbstractBackground>
  );
};

import { useContext } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { Channel } from "../pages/Channel/Channel";
import { Chats } from "../pages/Chats/Chats";
import { EditProfile } from "../pages/EditProfile/EditProfile";
import { ForgotPassword } from "../pages/ForgotPassword/ForgotPassword";
import { Login } from "../pages/Login/Login";
import { PrivacyPolicy } from "../pages/PrivacyPolicy/PrivacyPolicy";
import { Register } from "../pages/Register/Register";
import { SplashScreen } from "../pages/SplashScreen/SplashScreen";
import { TermsAndConditionsOfUse } from "../pages/TermsAndConditionsOfUse/TermsAndConditionsOfUse";

function PrivateRoute({ children }) {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
}

const Router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route exact path="/login" element={<Login />} />
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/register/privacy-policy" element={<PrivacyPolicy />} />
      <Route
        path="/privacy-policy"
        element={
          <PrivateRoute>
            <PrivacyPolicy />
          </PrivateRoute>
        }
      />
      <Route
        path="/register/terms-and-conditions-of-use"
        element={<TermsAndConditionsOfUse />}
      />
      <Route
        path="/terms-and-conditions-of-use"
        element={
          <PrivateRoute>
            <TermsAndConditionsOfUse />
          </PrivateRoute>
        }
      />
      <Route
        path="/register/terms-and-conditions-of-use/privacy-policy"
        element={<PrivacyPolicy />}
      />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <PrivateRoute>
            <Chats />
          </PrivateRoute>
        }
      />
      <Route
        path="/chats/channel"
        element={
          <PrivateRoute>
            <Channel />
          </PrivateRoute>
        }
      />
    </>
  )
);

export default Router;

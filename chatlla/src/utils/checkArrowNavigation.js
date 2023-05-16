import { signOut } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase/firebaseInitialize";

export const CheckArrowNavigation = (path, historyData) => {
  const KEY = "imageProfile";

  const imageProfile = () => {
    if (localStorage) {
      return localStorage.getItem(KEY);
    }
    return null;
  };

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const onPopState = (event) => {
    let text =
      "Hey there! Just a heads up - if you leave this page, you'll need to log in again. Are you sure you want to go?";

    if (window.confirm(text)) {
      signOut(auth);
      navigate("/login");
    } else {
      window.history.pushState(null, "", path);
    }
  };

  useEffect(() => {
    if (!localStorage) {
      return;
    }

    const dataToPop = {
      imageProfile: imageProfile(),
      userId: currentUser?.uid ?? null,
      userName: currentUser?.displayName ?? null,
    };

    history.pushState(dataToPop, null, path);

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [currentUser?.uid, path, history]);
};

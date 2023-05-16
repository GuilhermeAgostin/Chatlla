import "./SplashScreen.css";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { BottomEye } from "../../components/SplashScreenComponents/BottomEye";
import { BottomRightAbstractForm } from "../../components/SplashScreenComponents/BottomRightAbstractForm";
import { BottomShine } from "../../components/SplashScreenComponents/BottomShine";
import { CenterShine } from "../../components/SplashScreenComponents/CenterShine";
import { CircleDoodle } from "../../components/SplashScreenComponents/CircleDoodle";
import { CloudClipart } from "../../components/SplashScreenComponents/CloudClipart";
import { Heart } from "../../components/SplashScreenComponents/Heart";
import { LeftAbstractForm } from "../../components/SplashScreenComponents/LeftAbstractForm";
import { PeaceSymbol } from "../../components/SplashScreenComponents/PeaceSymbol";
import { TopEye } from "../../components/SplashScreenComponents/TopEye";
import { TopLeftTrapezoid } from "../../components/SplashScreenComponents/TopLeftTrapezoid";
import { TopRightAbstractForm } from "../../components/SplashScreenComponents/TopRightAbstractForm";
import { TopShine } from "../../components/SplashScreenComponents/TopShine";
import { Trapezoid2 } from "../../components/SplashScreenComponents/Trapezoid2";
import { Waves1 } from "../../components/SplashScreenComponents/Waves1";
import { Waves2 } from "../../components/SplashScreenComponents/Waves2";
import { Waves3 } from "../../components/SplashScreenComponents/Waves3";

export const SplashScreen = ({ width = "100vw", goToAnotherPage = true }) => {
  const navigate = useNavigate();

  const Mount = () => {
    if (goToAnotherPage) {
      setTimeout(() => {
        navigate("./login");
      }, 3500);
    }
  };

  useEffect(() => {
    Mount();
  }, []);

  return (
    <div className="main-splash-screen" style={{ width: width }}>
      <h1 className="splash-screen-title notranslate">Chatlla</h1>

      <div className="trapezoid">
        <Trapezoid2></Trapezoid2>
      </div>

      <div className="waves-1">
        <Waves1></Waves1>
      </div>

      <div className="waves-2">
        <Waves2></Waves2>
      </div>

      <div className="cloud-clipart">
        <CloudClipart></CloudClipart>
      </div>

      <div className="waves-3">
        <Waves3></Waves3>
      </div>

      <div className="circle-doodle-line">
        <CircleDoodle></CircleDoodle>
      </div>

      <div className="bottom-eye">
        <BottomEye></BottomEye>
      </div>

      <div className="left-abstract-form">
        <LeftAbstractForm></LeftAbstractForm>
      </div>

      <div className="bottom-shine">
        <BottomShine></BottomShine>
      </div>

      <div className="bottom-right-abstract-form">
        <BottomRightAbstractForm></BottomRightAbstractForm>
      </div>

      <div className="top-right-abstract-form">
        <TopRightAbstractForm></TopRightAbstractForm>
      </div>

      <div className="heart">
        <Heart></Heart>
      </div>

      <div className="top-eye">
        <TopEye></TopEye>
      </div>

      <div className="top-shine">
        <TopShine></TopShine>
      </div>

      <div className="c-trapezoid-2">
        <TopLeftTrapezoid></TopLeftTrapezoid>
      </div>

      <div className="peace-symbol">
        <PeaceSymbol></PeaceSymbol>
      </div>

      <div className="center-shine">
        <CenterShine></CenterShine>
      </div>
    </div>
  );
};

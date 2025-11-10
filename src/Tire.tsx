import { ReactElement } from "react";
import "./Tire.css";

export type TireParam = {
  pos: string;
  brakeTemp: number;
  brakePsi: number;
  brakePercent: number;
  tireTempOuter: number;
  tireTempMid: number;
  tireTempInner: number;
  absActive: number;
};

function getTierColor(temperature: number) {
  let hexColor = "#000000";

  if (temperature < 60) {
    hexColor = "#0080ff";
  } else if (temperature < 75) {
    hexColor = "#00aa20";
  } else if (temperature < 90) {
    hexColor = "#ffdd00";
  } else {
    hexColor = "#ff0000";
  }

  return hexColor;
}

function getBrakeColor(temperature: number) {
  let hexColor = "#000000";

  if (temperature < 300) {
    hexColor = "#0080ff";
  } else if (temperature < 600) {
    hexColor = "#00aa20";
  } else if (temperature < 800) {
    hexColor = "#ffdd00";
  } else {
    hexColor = "#ff0000";
  }

  return hexColor;
}

function getAbsColor(active: number) {
  let hexColor = "#ffffff00";

  if (active > 0) {
    hexColor = "#ff0000";
  }

  return hexColor;
}

export function LeftTireInfo({ param }: { param: TireParam }): ReactElement {
  return (
    <div>
      <span className="tire-title">{param.pos}</span>
      <div className="tire">
        <div className="tire-info" style={{ marginRight: 4 }}>
          <span className="tire-abs" style={{ "--color": getAbsColor(param.absActive) }}>
            ABS
          </span>
          <span className="tire-brake-temp">{param.brakeTemp.toFixed(0)}℃</span>
          <span className="tire-brake-psi">{param.brakePsi.toFixed(0)}kPa</span>
          <span className="tire-brake-percent">{param.brakePercent.toFixed(0)}%</span>
        </div>
        <div className="tire-left" style={{ "--color": getTierColor(param.tireTempOuter) }}>
          {param.tireTempOuter.toFixed(0)}
        </div>
        <div className="tire-middle" style={{ "--color": getTierColor(param.tireTempMid) }}>
          {param.tireTempMid.toFixed(0)}
        </div>
        <div className="tire-right" style={{ "--color": getTierColor(param.tireTempInner) }}>
          {param.tireTempInner.toFixed(0)}
        </div>
        <div
          className="tire-brake"
          style={{
            "--color": getBrakeColor(param.brakeTemp),
            "--percent": `${param.brakePercent}%`,
          }}
        ></div>
      </div>
    </div>
  );
}

export function RightTireInfo({ param }: { param: TireParam }): ReactElement {
  return (
    <div>
      <span className="tire-title">{param.pos}</span>
      <div className="tire">
        <div
          className="tire-brake"
          style={{
            "--color": getBrakeColor(param.brakeTemp),
            "--percent": `${param.brakePercent}%`,
          }}
        ></div>
        <div className="tire-left" style={{ "--color": getTierColor(param.tireTempInner) }}>
          {param.tireTempInner.toFixed(0)}
        </div>
        <div className="tire-middle" style={{ "--color": getTierColor(param.tireTempMid) }}>
          {param.tireTempMid.toFixed(0)}
        </div>
        <div className="tire-right" style={{ "--color": getTierColor(param.tireTempOuter) }}>
          {param.tireTempOuter.toFixed(0)}
        </div>
        <div className="tire-info" style={{ marginLeft: 4 }}>
          <span className="tire-abs" style={{ "--color": getAbsColor(param.absActive) }}>
            ABS
          </span>
          <span className="tire-brake-temp">{param.brakeTemp.toFixed(0)}℃</span>
          <span className="tire-brake-psi">{param.brakePsi.toFixed(0)}kPa</span>
          <span className="tire-brake-percent">{param.brakePercent.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

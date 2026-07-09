import { ReactElement } from "react";
import SevenSegmentDisplay from "react-ts-seven-segment-display";

import "./Powertrain.css";

export type PowertrainParam = {
  rpm: number;
  speed: number;
  gear: number;
  downshift: number;
  p2p: number;
};

export type DbwParam = {
  clutch: number;
  brake: number;
  throttle: number;
  steering: number;
};

export function PowertrainInfo({ param }: { param: PowertrainParam }): ReactElement {
  return (
    <div className="powertrain-wrapper">
      <div className="powertrain-segment">
        <SevenSegmentDisplay
          value={param.rpm.toFixed(0)}
          height={20}
          segmentSize={5}
          bgColor="#222"
          color={param.rpm > 6000 ? "#f00" : "#fff"}
          spacing={4}
          startFromEnd
        />
      </div>
      <div className="powertrain-divider" />
      <span style={{ paddingLeft: 8, paddingTop: 8 }}>GEAR{param.downshift > 0 && "↓"}</span>
      <div className="powertrain-segment">
        <SevenSegmentDisplay
          value={param.gear.toFixed(0)}
          height={80}
          segmentSize={1}
          bgColor="#222"
          color="#fff"
        />
      </div>
      <div style={{ display: "flex", width: "100%", paddingLeft: 8, paddingRight: 8 }}>
        <span>KM/H</span>
        {param.p2p > 0 && <span style={{ marginLeft: "auto", fontWeight: "bold" }}>P2P</span>}
      </div>
      <div className="powertrain-segment">
        <SevenSegmentDisplay
          key={`speed-${param.p2p}`}
          value={param.speed.toFixed(0)}
          height={60}
          segmentSize={3}
          bgColor="#222"
          color={param.p2p > 0 ? "#ff8800" : "#fff"}
          startFromEnd
        />
      </div>
    </div>
  );
}

export function PowertrainPed({ param }: { param: DbwParam }): ReactElement {
  return (
    <div className="ped-wrapper">
      <span className="ped-title">PEDAL</span>
      <div style={{ display: "flex", height: 220 }}>
        <div
          className="ped-progress"
          style={{ "--color": "#00f", "--percent": `${param.clutch}%` }}
        />
        <div
          className="ped-progress"
          style={{ "--color": "#f00", "--percent": `${param.brake}%` }}
        />
        <div
          className={["ped-progress", "ped-progress-end"].join(" ")}
          style={{ "--color": "#0f0", "--percent": `${param.throttle}%` }}
        />
      </div>
    </div>
  );
}

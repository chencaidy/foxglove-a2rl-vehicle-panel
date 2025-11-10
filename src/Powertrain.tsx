import { ReactElement } from "react";
import SevenSegmentDisplay from "react-ts-seven-segment-display";

import "./Powertrain.css";

export type PowertrainParam = {
  rpm: number;
  speed: number;
  gear: number;
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
          color="#fff"
          spacing={4}
          startFromEnd
        />
      </div>
      <div className="powertrain-divider" />
      <span style={{ paddingLeft: 8, paddingTop: 8 }}>GEAR</span>
      <div className="powertrain-segment">
        <SevenSegmentDisplay
          value={param.gear.toFixed(0)}
          height={80}
          segmentSize={1}
          bgColor="#222"
          color="#fff"
        />
      </div>
      <span style={{ paddingLeft: 8 }}>KM/H</span>
      <div className="powertrain-segment">
        <SevenSegmentDisplay
          value={param.speed.toFixed(0)}
          height={60}
          segmentSize={3}
          bgColor="#222"
          color="#fff"
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

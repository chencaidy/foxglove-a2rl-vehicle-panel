import { PanelExtensionContext } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { PowertrainInfo, PowertrainPed } from "./Powertrain";
import type {
  Brake_Disk_Temp,
  CBA_Status_FL,
  CBA_Status_FR,
  CBA_Status_RL,
  CBA_Status_RR,
  ControllerBrake,
  ICE_Status_01,
  ICE_Status_02,
  Imu,
  Kistler,
  Tyre_Surface_Temp_Front,
  Tyre_Surface_Temp_Rear,
} from "./Protocol";
import { LeftTireInfo, RightTireInfo } from "./Tire";
import TrajectoryCanvas, { Point, TrajectoryCanvasRef } from "./TrajectoryCanvas";

import "./Tire.css";
import "./VehiclePanel.css";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

function VehiclePanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [brakeDiskTemp, setBrakeDiskTemp] = useState<undefined | Brake_Disk_Temp>();
  const [cbaStatusFL, setCbaStatusFL] = useState<undefined | CBA_Status_FL>();
  const [cbaStatusFR, setCbaStatusFR] = useState<undefined | CBA_Status_FR>();
  const [cbaStatusRL, setCbaStatusRL] = useState<undefined | CBA_Status_RL>();
  const [cbaStatusRR, setCbaStatusRR] = useState<undefined | CBA_Status_RR>();
  const [iceStatus1, setIceStatus1] = useState<undefined | ICE_Status_01>();
  const [iceStatus2, setIceStatus2] = useState<undefined | ICE_Status_02>();
  const [tireTempFront, setTireTempFront] = useState<undefined | Tyre_Surface_Temp_Front>();
  const [tireTempRear, setTireTempRear] = useState<undefined | Tyre_Surface_Temp_Rear>();
  const [kistlerMeas, setKistlerMeas] = useState<undefined | Kistler>();
  const [controlBrake, setControlBrake] = useState<undefined | ControllerBrake>();

  const trajectoryRef = useRef<TrajectoryCanvasRef>(null);
  const [points, setPoints] = useState<Point[]>([]);

  // We use a layout effect to setup render handling for our panel. We also setup some topic subscriptions.
  useLayoutEffect(() => {
    // The render handler is run by the broader Foxglove system during playback when your panel
    // needs to render because the fields it is watching have changed. How you handle rendering depends on your framework.
    // You can only setup one render handler - usually early on in setting up your panel.
    //
    // Without a render handler your panel will never receive updates.
    //
    // The render handler could be invoked as often as 60hz during playback if fields are changing often.
    context.onRender = (renderState, done) => {
      // render functions receive a _done_ callback. You MUST call this callback to indicate your panel has finished rendering.
      // Your panel will not receive another render callback until _done_ is called from a prior render. If your panel is not done
      // rendering before the next render call, Foxglove shows a notification to the user that your panel is delayed.
      //
      // Set the done callback into a state variable to trigger a re-render.
      setRenderDone(() => done);

      // currentFrame has messages on subscribed topics since the last render call
      if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        renderState.currentFrame.forEach((frame) => {
          if (frame.topic === "/flyeagle/a2rl/controller/brake") {
            setControlBrake(frame.message as ControllerBrake);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/brake_disk_temp") {
            setBrakeDiskTemp(frame.message as Brake_Disk_Temp);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/cba_status_fl") {
            setCbaStatusFL(frame.message as CBA_Status_FL);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/cba_status_fr") {
            setCbaStatusFR(frame.message as CBA_Status_FR);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/cba_status_rl") {
            setCbaStatusRL(frame.message as CBA_Status_RL);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/cba_status_rr") {
            setCbaStatusRR(frame.message as CBA_Status_RR);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/ice_status_01") {
            setIceStatus1(frame.message as ICE_Status_01);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/ice_status_02") {
            setIceStatus2(frame.message as ICE_Status_02);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/tyre_surface_temp_front") {
            setTireTempFront(frame.message as Tyre_Surface_Temp_Front);
          } else if (frame.topic === "/flyeagle/a2rl/eav25_bsu/tyre_surface_temp_rear") {
            setTireTempRear(frame.message as Tyre_Surface_Temp_Rear);
          } else if (frame.topic === "/sensor/kistler/measurement") {
            setKistlerMeas(frame.message as Kistler);
          } else if (frame.topic === "/sensor/bosch/imu") {
            const imu = frame.message as Imu;
            trajectoryRef.current?.addPoint(
              (imu.linear_acceleration.y / 9.8) * 25 + 100,
              (imu.linear_acceleration.x / 9.8) * 25 + 100,
            );
          }
        });
      }
    };

    // After adding a render handler, you must indicate which fields from RenderState will trigger updates.
    // If you do not watch any fields then your panel will never render since the panel context will assume you do not want any updates.

    // tell the panel context that we care about any update to the _topic_ field of RenderState
    // context.watch("topics");

    // tell the panel context we want messages for the current frame for topics we've subscribed to
    // This corresponds to the _currentFrame_ field of render state.
    context.watch("currentFrame");

    // subscribe to some topics, you could do this within other effects, based on input fields, etc
    // Once you subscribe to topics, currentFrame will contain message events from those topics (assuming there are messages).
    context.subscribe([
      { topic: "/flyeagle/a2rl/controller/brake" }, // (100Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/brake_disk_temp" }, // (20Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/cba_status_fl" }, // (100Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/cba_status_fr" }, // (100Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/cba_status_rl" }, // (100Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/cba_status_rr" }, // (100Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/ice_status_01" }, // Throttle and Gear (100Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/ice_status_02" }, // RPM (100Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/tyre_surface_temp_front" }, // (20Hz)
      { topic: "/flyeagle/a2rl/eav25_bsu/tyre_surface_temp_rear" }, // (20Hz)
      { topic: "/sensor/kistler/measurement" }, // (250Hz)
      { topic: "/sensor/bosch/imu" }, // (200Hz)
    ]);
  }, [context]);

  // invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <div className="panel-wrapper">
      <div className="tire-wrapper">
        <LeftTireInfo
          param={{
            pos: "FL",
            absActive: controlBrake ? controlBrake.wheel_latched_fl : 0,
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.brake_disk_temp_fl : -1,
            brakePsi: cbaStatusFL ? cbaStatusFL.cba_actual_pressure_fl_pa / 1000 : -1,
            brakePercent: cbaStatusFL ? cbaStatusFL.cba_actual_pressure_fl : -1,
            tireTempOuter: tireTempFront ? tireTempFront.outer_fl : -1,
            tireTempMid: tireTempFront ? tireTempFront.center_fl : -1,
            tireTempInner: tireTempFront ? tireTempFront.inner_fl : -1,
          }}
        />
        <RightTireInfo
          param={{
            pos: "FR",
            absActive: controlBrake ? controlBrake.wheel_latched_fr : 0,
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.brake_disk_temp_fr : -1,
            brakePsi: cbaStatusFR ? cbaStatusFR.cba_actual_pressure_fr_pa / 1000 : -1,
            brakePercent: cbaStatusFR ? cbaStatusFR.cba_actual_pressure_fr : -1,
            tireTempOuter: tireTempFront ? tireTempFront.outer_fr : -1,
            tireTempMid: tireTempFront ? tireTempFront.center_fr : -1,
            tireTempInner: tireTempFront ? tireTempFront.inner_fr : -1,
          }}
        />
        <LeftTireInfo
          param={{
            pos: "RL",
            absActive: controlBrake ? controlBrake.wheel_latched_rl : 0,
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.brake_disk_temp_rl : -1,
            brakePsi: cbaStatusRL ? cbaStatusRL.cba_actual_pressure_rl_pa / 1000 : -1,
            brakePercent: cbaStatusRL ? cbaStatusRL.cba_actual_pressure_rl : -1,
            tireTempOuter: tireTempRear ? tireTempRear.outer_rl : -1,
            tireTempMid: tireTempRear ? tireTempRear.center_rl : -1,
            tireTempInner: tireTempRear ? tireTempRear.inner_rl : -1,
          }}
        />
        <RightTireInfo
          param={{
            pos: "RR",
            absActive: controlBrake ? controlBrake.wheel_latched_rr : 0,
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.brake_disk_temp_rr : -1,
            brakePsi: cbaStatusRR ? cbaStatusRR.cba_actual_pressure_rr_pa / 1000 : -1,
            brakePercent: cbaStatusRR ? cbaStatusRR.cba_actual_pressure_rr : -1,
            tireTempOuter: tireTempRear ? tireTempRear.outer_rr : -1,
            tireTempMid: tireTempRear ? tireTempRear.center_rr : -1,
            tireTempInner: tireTempRear ? tireTempRear.inner_rr : -1,
          }}
        />
      </div>
      <PowertrainInfo
        param={{
          rpm: iceStatus2 ? iceStatus2.ice_engine_speed_rpm : -1,
          gear: iceStatus1 ? iceStatus1.ice_actual_gear : 0,
          speed: kistlerMeas ? kistlerMeas.resultant_velocity.x * 3.6 : -1,
        }}
      />
      <PowertrainPed
        param={{
          clutch: 0,
          brake: cbaStatusFL ? cbaStatusFL.cba_target_pressure_fl_ack : 0,
          throttle: iceStatus1 ? iceStatus1.ice_target_throttle_ack : 0,
          steering: 0,
        }}
      />
      <TrajectoryCanvas
        ref={trajectoryRef}
        points={points}
        size={200}
        duration={500}
        onPointsChange={setPoints}
        // onAddPoint={handleAddPoint}
        // onClearPoints={handleClearPoints}
        pointColor="#ff4400"
      />
    </div>
  );
}

export function initVehiclePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<VehiclePanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}

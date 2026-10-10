import { PanelExtensionContext } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { PowertrainInfo, PowertrainPed } from "./Powertrain";
import type {
  BrakeDiskTemp,
  CbaStatus,
  ControllerBrake,
  IceStatus,
  Imu,
  Kistler,
  MotecStatus,
  PsaStatus,
  TireSurfaceTemp,
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
  const [cbaStatus, setCbaStatus] = useState<undefined | CbaStatus>();
  const [iceStatus, setIceStatus] = useState<undefined | IceStatus>();
  const [motecStatus, setMotecStatus] = useState<undefined | MotecStatus>();
  const [psaStatus, setPsaStatus] = useState<undefined | PsaStatus>();
  const [brakeDiskTemp, setBrakeDiskTemp] = useState<undefined | BrakeDiskTemp>();
  const [tireSurfaceTemp, setTireSurfaceTemp] = useState<undefined | TireSurfaceTemp>();
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
          if (frame.topic === "/throttled/vehicle/eav26_bsu/cba_status") {
            setCbaStatus(frame.message as CbaStatus);
          } else if (frame.topic === "/throttled/vehicle/eav26_bsu/ice_status") {
            setIceStatus(frame.message as IceStatus);
          } else if (frame.topic === "/throttled/vehicle/eav26_bsu/motec_status") {
            setMotecStatus(frame.message as MotecStatus);
          } else if (frame.topic === "/throttled/vehicle/eav26_bsu/psa_status") {
            setPsaStatus(frame.message as PsaStatus);
          } else if (frame.topic === "/throttled/vehicle/eav26_bsu/brake_disk_temp") {
            setBrakeDiskTemp(frame.message as BrakeDiskTemp);
          } else if (frame.topic === "/throttled/vehicle/eav26_bsu/tire_surface_temp") {
            setTireSurfaceTemp(frame.message as TireSurfaceTemp);
          } else if (frame.topic === "/throttled/sensor/kistler/measurement") {
            setKistlerMeas(frame.message as Kistler);
          } else if (frame.topic === "/throttled/sensor/kistler/imu") {
            const imu = frame.message as Imu;
            trajectoryRef.current?.addPoint(
              (imu.linear_acceleration.y / 9.81) * 25 + 100,
              (imu.linear_acceleration.x / 9.81) * 25 + 100,
            );
          } else if (frame.topic === "/throttled/flyeagle/a2rl/controller/brake") {
            setControlBrake(frame.message as ControllerBrake);
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
      { topic: "/throttled/vehicle/eav26_bsu/cba_status" },
      { topic: "/throttled/vehicle/eav26_bsu/ice_status" },
      { topic: "/throttled/vehicle/eav26_bsu/motec_status" },
      { topic: "/throttled/vehicle/eav26_bsu/psa_status" },
      { topic: "/throttled/vehicle/eav26_bsu/brake_disk_temp" },
      { topic: "/throttled/vehicle/eav26_bsu/tire_surface_temp" },
      { topic: "/throttled/sensor/kistler/measurement" },
      { topic: "/throttled/sensor/kistler/imu" },
      { topic: "/throttled/flyeagle/a2rl/controller/brake" },
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
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.fl_degc : -1,
            brakePsi: cbaStatus ? cbaStatus.fl.actual_pressure_pa / 1000 : -1,
            brakePercent: cbaStatus ? cbaStatus.fl.actual_pressure_percent : -1,
            tireTempOuter: tireSurfaceTemp ? tireSurfaceTemp.fl_outer_degc : -1,
            tireTempMid: tireSurfaceTemp ? tireSurfaceTemp.fl_center_degc : -1,
            tireTempInner: tireSurfaceTemp ? tireSurfaceTemp.fl_inner_degc : -1,
          }}
        />
        <RightTireInfo
          param={{
            pos: "FR",
            absActive: controlBrake ? controlBrake.wheel_latched_fr : 0,
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.fr_degc : -1,
            brakePsi: cbaStatus ? cbaStatus.fr.actual_pressure_pa / 1000 : -1,
            brakePercent: cbaStatus ? cbaStatus.fr.actual_pressure_percent : -1,
            tireTempOuter: tireSurfaceTemp ? tireSurfaceTemp.fr_outer_degc : -1,
            tireTempMid: tireSurfaceTemp ? tireSurfaceTemp.fr_center_degc : -1,
            tireTempInner: tireSurfaceTemp ? tireSurfaceTemp.fr_inner_degc : -1,
          }}
        />
        <LeftTireInfo
          param={{
            pos: "RL",
            absActive: controlBrake ? controlBrake.wheel_latched_rl : 0,
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.rl_degc : -1,
            brakePsi: cbaStatus ? cbaStatus.rl.actual_pressure_pa / 1000 : -1,
            brakePercent: cbaStatus ? cbaStatus.rl.actual_pressure_percent : -1,
            tireTempOuter: tireSurfaceTemp ? tireSurfaceTemp.rl_outer_degc : -1,
            tireTempMid: tireSurfaceTemp ? tireSurfaceTemp.rl_center_degc : -1,
            tireTempInner: tireSurfaceTemp ? tireSurfaceTemp.rl_inner_degc : -1,
          }}
        />
        <RightTireInfo
          param={{
            pos: "RR",
            absActive: controlBrake ? controlBrake.wheel_latched_rr : 0,
            brakeTemp: brakeDiskTemp ? brakeDiskTemp.rr_degc : -1,
            brakePsi: cbaStatus ? cbaStatus.rr.actual_pressure_pa / 1000 : -1,
            brakePercent: cbaStatus ? cbaStatus.rr.actual_pressure_percent : -1,
            tireTempOuter: tireSurfaceTemp ? tireSurfaceTemp.rr_outer_degc : -1,
            tireTempMid: tireSurfaceTemp ? tireSurfaceTemp.rr_center_degc : -1,
            tireTempInner: tireSurfaceTemp ? tireSurfaceTemp.rr_inner_degc : -1,
          }}
        />
      </div>
      <PowertrainInfo
        param={{
          rpm: motecStatus ? motecStatus.motor_speed_rpm : -1,
          speed: kistlerMeas ? kistlerMeas.resultant_velocity.x * 3.6 : -1,
          gear: iceStatus ? iceStatus.actual_gear : 0,
          downshift: iceStatus ? iceStatus.downshift_available : 0,
          p2p: iceStatus ? iceStatus.push_to_pass_ack : 0,
        }}
      />
      <PowertrainPed
        param={{
          clutch: 0,
          brake: cbaStatus ? cbaStatus.fl.target_pressure_ack_percent : 0,
          throttle: iceStatus ? iceStatus.target_throttle_ack_percent : 0,
        }}
      />
      <TrajectoryCanvas
        ref={trajectoryRef}
        points={points}
        size={200}
        duration={500}
        onPointsChange={setPoints}
        steeringAngle={psaStatus ? -psaStatus.actual_pos_rad * 4 : 0}
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

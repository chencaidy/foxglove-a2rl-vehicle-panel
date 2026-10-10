export type Time = {
  sec: number;
  nanosec: number;
};

export type Header = {
  stamp: Time;
  frame_id: string;
};

export type CbaInfo = {
  actual_pressure_pa: number;
  actual_pressure_percent: number;
  target_pressure_ack_percent: number;
  current_a: number;
  voltage_v: number;
  stroke_mm: number;
};

export type CbaStatus = {
  header: Header;
  fl: CbaInfo;
  fr: CbaInfo;
  rl: CbaInfo;
  rr: CbaInfo;
};

export type IceStatus = {
  header: Header;
  actual_gear: number;
  target_gear_ack: number;
  actual_throttle_percent: number;
  target_throttle_ack_percent: number;
  push_to_pass_req: number;
  push_to_pass_ack: number;
  water_press_kpa: number;
  downshift_available: number;
};

export type MotecStatus = {
  header: Header;
  actual_gear: number;
  actual_throttle_percent: number;
  motor_speed_rpm: number;
  engine_switch_on: number;
  push_to_pass_state: number;
  maximum_downshift_rpm: number;
};

export type PsaStatus = {
  header: Header;
  actual_operation_mode: number;
  target_control_ack_percent: number;
  actual_pos_percent: number;
  actual_pos_rad: number;
  actual_speed_percent: number;
  actual_speed_rad_s: number;
  actual_torque_percent: number;
  actual_torque_m_nm: number;
  actual_current_a: number;
  actual_voltage_v: number;
  rack_angle_rad: number;
};

export type BrakeDiskTemp = {
  header: Header;
  fl_degc: number;
  fr_degc: number;
  rl_degc: number;
  rr_degc: number;
};

export type TireSurfaceTemp = {
  header: Header;
  fl_outer_degc: number;
  fl_center_degc: number;
  fl_inner_degc: number;
  fr_outer_degc: number;
  fr_center_degc: number;
  fr_inner_degc: number;
  rl_outer_degc: number;
  rl_center_degc: number;
  rl_inner_degc: number;
  rr_outer_degc: number;
  rr_center_degc: number;
  rr_inner_degc: number;
};

export type Kistler = {
  resultant_velocity: {
    x: number;
    y: number;
    z: number;
  };
};

export type Imu = {
  linear_acceleration: {
    x: number;
    y: number;
    z: number;
  };
};

export type ControllerBrake = {
  wheel_latched_fl: number;
  wheel_latched_fr: number;
  wheel_latched_rl: number;
  wheel_latched_rr: number;
};

export type Timestamp = {
  nanoseconds: number;
};

export type Brake_Disk_Temp = {
  timestamp: Timestamp;
  brake_disk_temp_fl: number;
  brake_disk_temp_fr: number;
  brake_disk_temp_rr: number;
  brake_disk_temp_rl: number;
};

export type CBA_Status_FL = {
  timestamp: Timestamp;
  cba_actual_pressure_fl_pa: number;
  cba_actual_pressure_fl: number;
  cba_target_pressure_fl_ack: number;
  cba_actual_current_fl_a: number;
  cba_voltage_fl_v: number;
};

export type CBA_Status_FR = {
  timestamp: Timestamp;
  cba_actual_pressure_fr_pa: number;
  cba_actual_pressure_fr: number;
  cba_target_pressure_fr_ack: number;
  cba_actual_current_fr_a: number;
  cba_voltage_fr_v: number;
};

export type CBA_Status_RL = {
  timestamp: Timestamp;
  cba_actual_pressure_rl_pa: number;
  cba_actual_pressure_rl: number;
  cba_target_pressure_rl_ack: number;
  cba_actual_current_rl_a: number;
  cba_voltage_rl_v: number;
};

export type CBA_Status_RR = {
  timestamp: Timestamp;
  cba_actual_pressure_rr_pa: number;
  cba_actual_pressure_rr: number;
  cba_target_pressure_rr_ack: number;
  cba_actual_current_rr_a: number;
  cba_voltage_rr_v: number;
};

export type ICE_Status_01 = {
  timestamp: Timestamp;
  ice_actual_gear: number;
  ice_target_gear_ack: number;
  ice_actual_throttle: number;
  ice_target_throttle_ack: number;
  ice_push_to_pass_req: number;
  ice_push_to_pass_ack: number;
  ice_water_press_k_pa: number;
  ice_available_fuel_l: number;
  ice_downshift_available: number;
};

export type ICE_Status_02 = {
  timestamp: Timestamp;
  ice_oil_temp_deg_c: number;
  ice_engine_speed_rpm: number;
  ice_fuel_press_k_pa: number;
  ice_water_temp_deg_c: number;
  ice_oil_press_k_pa: number;
};

export type Tyre_Surface_Temp_Front = {
  timestamp: Timestamp;
  outer_fl: number;
  center_fl: number;
  inner_fl: number;
  outer_fr: number;
  center_fr: number;
  inner_fr: number;
};

export type Tyre_Surface_Temp_Rear = {
  timestamp: Timestamp;
  outer_rl: number;
  center_rl: number;
  inner_rl: number;
  outer_rr: number;
  center_rr: number;
  inner_rr: number;
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

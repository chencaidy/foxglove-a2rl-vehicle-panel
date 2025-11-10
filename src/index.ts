import { ExtensionContext } from "@foxglove/extension";

import { initVehiclePanel } from "./VehiclePanel";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "A2RL-Vehicle", initPanel: initVehiclePanel });
}

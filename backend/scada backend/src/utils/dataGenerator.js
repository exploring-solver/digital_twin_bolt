const {
  simulateEngineSensors
} = require('./sensors/engine');

const {
  simulateFlightControlSensors
} = require('./sensors/flightControl');

const {
  simulateEnvironmentSensors
} = require('./sensors/environment');

const {
  simulateAvionicsSensors
} = require('./sensors/avionics');

const {
  simulateLandingGearSensors
} = require('./sensors/landingGear');

const {
  simulateElectricalSensors
} = require('./sensors/electrical');

const {
  simulateHydraulicsSensors
} = require('./sensors/hydraulics');

const {
  simulateStructureSensors
} = require('./sensors/structure');

const {
  simulateHUMSSensors
} = require('./sensors/hums');

const {
  simulateMiscSensors
} = require('./sensors/misc');

function runAllSimulators() {
  simulateEngineSensors();
  simulateFlightControlSensors();
  simulateEnvironmentSensors();
  simulateAvionicsSensors();
  simulateLandingGearSensors();
  simulateElectricalSensors();
  simulateHydraulicsSensors();
  simulateStructureSensors();
  simulateHUMSSensors();
  simulateMiscSensors();
}

module.exports = {
  runAllSimulators
};

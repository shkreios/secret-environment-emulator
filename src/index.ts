import { exportVariable, setFailed } from "@actions/core";

const setEnvironmentVariable = (key: string, value: string) => {
  exportVariable(key, value);
};

(() => {
  try {
  } catch (error) {
    setFailed((error as Error).message);
    process.exit(1);
  }
})();

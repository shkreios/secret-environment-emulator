import { getInput, setFailed, setOutput } from "@actions/core";

const main = () => {
  try {
    const data: Record<string, string> = JSON.parse(
      getInput("secrets", { required: true })
    );
    const environment =
      getInput("environment", {
        required: false,
        trimWhitespace: true,
      }).toLocaleUpperCase() + "_";
    const globalPrefix =
      getInput("globalPrefix", {
        required: false,
        trimWhitespace: true,
      }).toLocaleUpperCase() + "_";

    const output: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(environment)) {
        output[key.slice(environment.length)] = value;
      } else if (
        key.startsWith(globalPrefix) &&
        !(key.slice(globalPrefix.length) in output)
      ) {
        output[key.slice(globalPrefix.length)] = value;
      }
    }

    Object.entries(output).forEach(([key, value]) => setOutput(key, value));
  } catch (error) {
    setFailed((error as Error).message);
    process.exit(1);
  }
};

main();

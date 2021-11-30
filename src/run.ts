import { getInput, setFailed, setOutput } from "@actions/core";

export const run = () => {
  try {
    // Parse secrets json string
    const data: Record<string, string> = JSON.parse(
      getInput("secrets", { required: true })
    );

    const environment =
      getInput("environment", {
        required: true,
        trimWhitespace: true,
      }).toLocaleUpperCase() + "_";

    const globalPrefix =
      getInput("globalPrefix", {
        required: false,
        trimWhitespace: true,
      }).toLocaleUpperCase() + "_";

    // Map to allow for overlaying keys
    const output: Record<string, string> = {};

    // Github runner node v12.13.1 => Loop over Object.keys faster than Object.entries or for in
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (key.startsWith(environment)) {
        output[key.slice(environment.length)] = value;
      } else if (
        key.startsWith(globalPrefix) &&
        !(key.slice(globalPrefix.length) in output)
      ) {
        output[key.slice(globalPrefix.length)] = value;
      }
    });

    // Github runner node v12.13.1 => Loop over Object.keys faster than Object.entries or for in
    Object.keys(output).forEach((key) => setOutput(key, output[key]));
  } catch (err) {
    // transform error if not of type Error
    const error = err instanceof Error ? err : new Error(`${err}`);

    if (error instanceof SyntaxError)
      setFailed(
        new Error(
          `Please check if you pass a correct json string into secrets.`
        )
      );
    else setFailed(error);
    process.exit(1);
  }
};

import { getInput, setFailed, setOutput } from "@actions/core";

const setOutputWhenPrefixed = (
  env: string,
  key: string,
  value: string
): boolean => {
  const prefix = `${env}_`;
  if (key.startsWith(prefix)) {
    setOutput(key.slice(prefix.length), value);
    return true;
  }
  return false;
};

const main = () => {
  try {
    const data: Record<string, string> = JSON.parse(
      getInput("secrets", { required: true })
    );
    const environment = getInput("environment", {
      required: false,
      trimWhitespace: true,
    }).toLocaleUpperCase();
    const globalPrefix = getInput("globalPrefix", {
      required: false,
      trimWhitespace: true,
    }).toLocaleUpperCase();

    Object.entries(data).forEach(
      ([key, value]) =>
        setOutputWhenPrefixed(environment, key, value) ||
        setOutputWhenPrefixed(globalPrefix, key, value)
    );
  } catch (error) {
    setFailed((error as Error).message);
    process.exit(1);
  }
};

main();

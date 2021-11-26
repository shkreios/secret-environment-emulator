import core from "@actions/core";
const mockedCore = core as jest.Mocked<typeof core>;
jest.mock("@actions/core", () => ({
  setOutput: jest.fn(),
  getInput: jest.fn(),
  setFailed: jest.fn(),
}));

jest.spyOn(process, "exit").mockImplementation((code?: number): never => {
  throw new Error(`${code}`);
});

const createMockedgetInput =
  (secrets: string, environment: string, globalPrefix = "all") =>
  (key: string) => {
    if (key == "secrets") return secrets;
    if (key == "environment") return environment;
    if (key == "globalPrefix") return globalPrefix;
  };
const secrets = JSON.stringify({
  github_token: "***",
  ALL_REACT_APP_AWS_COGNITO_REGION: "eu-west-1",
  STAGING_S3_BUCKET_NAME: "example-staging",
  PRODUCTION_S3_BUCKET_NAME: "example-production",
});

const overlayingSecrets = JSON.stringify({
  ALL_AWS_ACCESS_KEY_ID: "keyid-all",
  ALL_AWS_SECRET_ACCESS_KEY: "secretkey-all",
  BUILD_AWS_ACCESS_KEY_ID: "keyid-build",
  BUILD_AWS_SECRET_ACCESS_KEY: "secretkey-build",
});

describe("set-env", () => {
  it("set output for staging secrets", () => {
    (<jest.Mock>core.getInput).mockImplementation(
      createMockedgetInput(secrets, "staging")
    );

    jest.isolateModules(() => require("./index"));

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(2);
    expect(core.setOutput).toHaveBeenCalledWith(
      "REACT_APP_AWS_COGNITO_REGION",
      "eu-west-1"
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      "S3_BUCKET_NAME",
      "example-staging"
    );
  });

  it("set output for production secrets", () => {
    (<jest.Mock>core.getInput).mockImplementation(
      createMockedgetInput(secrets, "production")
    );

    jest.isolateModules(() => require("./index"));

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(2);
    expect(core.setOutput).toHaveBeenCalledWith(
      "REACT_APP_AWS_COGNITO_REGION",
      "eu-west-1"
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      "S3_BUCKET_NAME",
      "example-production"
    );
  });

  it("set output for qa secrets", () => {
    (<jest.Mock>core.getInput).mockImplementation(
      createMockedgetInput(secrets, "qa")
    );

    jest.isolateModules(() => require("./index"));

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith(
      "REACT_APP_AWS_COGNITO_REGION",
      "eu-west-1"
    );
  });

  it("set output for globalPrefix test secrets", () => {
    (<jest.Mock>core.getInput).mockImplementation(
      createMockedgetInput(secrets, "qa", "test")
    );

    jest.isolateModules(() => require("./index"));

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(0);
  });

  it("malformed json exception", () => {
    (<jest.Mock>core.getInput).mockImplementation(
      createMockedgetInput("{", "staging")
    );

    jest.isolateModules(() => require("./index"));

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith("Unexpected end of JSON input");
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("set output for overlaying secrets", () => {
    (<jest.Mock>core.getInput).mockImplementation(
      createMockedgetInput(overlayingSecrets, "build")
    );

    jest.isolateModules(() => require("./index"));

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(2);
    expect(core.setOutput).toHaveBeenCalledWith(
      "AWS_ACCESS_KEY_ID",
      "keyid-build"
    );
    expect(core.setOutput).toHaveBeenCalledWith(
      "AWS_SECRET_ACCESS_KEY",
      "secretkey-build"
    );
  });
});

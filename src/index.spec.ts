import core from "@actions/core";
import { run } from "./run";

import { mocked } from "ts-jest/utils";
jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
}));

jest
  .spyOn(process, "exit")
  .mockImplementation((code?: number) => undefined as never);

interface Input {
  secrets?: string;
  environment?: string;
  globalPrefix?: string;
}

const isKey = <T extends object>(
  key: string | symbol | number,
  obj: T
): key is keyof T => key in obj;

const createMockedgetInput = (inputs: Input): typeof core.getInput => {
  const mergedInputs: Input = { globalPrefix: "all", ...inputs };
  return (key, options) => {
    if (isKey(key, mergedInputs)) {
      return mergedInputs[key] || "";
    } else {
      if (options?.required)
        throw new Error(`Input required and not supplied: ${key}`);
      return "";
    }
  };
};

const mockgetInput = (inputs: Input) =>
  mocked(core.getInput).mockImplementation(createMockedgetInput(inputs));

const prepareTest = (inputs: Input) =>
  beforeEach(() => {
    mockgetInput(inputs);
    run();
  });

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

describe("Tests for secret-environment-emulator action", () => {
  describe("Environment is set to staging and globalPrefix is the default", () => {
    prepareTest({ secrets, environment: "staging" });

    it("Should not fail", () =>
      expect(core.setFailed).toHaveBeenCalledTimes(0));

    it("2 outputs should be generated", () =>
      expect(core.setOutput).toHaveBeenCalledTimes(2));

    it("REACT_APP_AWS_COGNITO_REGION should be set eu-west-1", () =>
      expect(core.setOutput).toHaveBeenCalledWith(
        "REACT_APP_AWS_COGNITO_REGION",
        "eu-west-1"
      ));

    it("S3_BUCKET_NAME should be set example-staging", () =>
      expect(core.setOutput).toHaveBeenCalledWith(
        "S3_BUCKET_NAME",
        "example-staging"
      ));
  });

  describe("Environment is set to qa and globalPrefix is set to test", () => {
    prepareTest({
      secrets,
      environment: "qa",
      globalPrefix: "test",
    });

    it("Should not fail", () =>
      expect(core.setFailed).toHaveBeenCalledTimes(0));

    it("Ouput should be empty", () =>
      expect(core.setOutput).toHaveBeenCalledTimes(0));
  });

  describe("Secrets are set to malformed json", () => {
    prepareTest({ secrets: "{", environment: "staging" });

    it("Action should alert the user", () => {
      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        new Error(
          `Please check if you pass a correct json string into secrets.`
        )
      );
    });

    it("Action should exit with 1", () =>
      expect(process.exit).toHaveBeenCalledTimes(1));
  });

  describe("Environment is not set", () => {
    prepareTest({ secrets });

    it("Action should alert the user", () => {
      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        new Error(`Input required and not supplied: environment`)
      );
    });

    it("Action should exit with 1", () => {
      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Secrets have overlaying keys", () => {
    prepareTest({
      secrets: overlayingSecrets,
      environment: "build",
    });

    it("set output for overlaying secrets", () => {
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
});

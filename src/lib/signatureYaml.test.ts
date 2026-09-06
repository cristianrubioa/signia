import { describe, expect, it } from "vitest";
import { DEFAULT_SIGNATURE_STATE } from "./signature";
import { fromYamlDocument, toYamlDocument, YamlValidationError } from "./signatureYaml";

describe("signatureYaml", () => {
  it("round-trips the default state", () => {
    const yaml = toYamlDocument(DEFAULT_SIGNATURE_STATE);
    expect(fromYamlDocument(yaml)).toEqual(DEFAULT_SIGNATURE_STATE);
  });

  it("rejects a document missing a top-level section", () => {
    const yaml = toYamlDocument(DEFAULT_SIGNATURE_STATE).replace(/^font:[\s\S]*?(?=\nbranding:)/m, "");
    expect(() => fromYamlDocument(yaml)).toThrow(YamlValidationError);
  });

  it("rejects an invalid template value", () => {
    const yaml = toYamlDocument(DEFAULT_SIGNATURE_STATE).replace("template: horizontal", "template: diagonal");
    expect(() => fromYamlDocument(yaml)).toThrow(YamlValidationError);
  });

  it("rejects a non-string field value", () => {
    const yaml = toYamlDocument(DEFAULT_SIGNATURE_STATE).replace(/phone: .*/, "phone: 5551234567");
    expect(() => fromYamlDocument(yaml)).toThrow(YamlValidationError);
  });

  it("rejects malformed YAML", () => {
    expect(() => fromYamlDocument("not: valid: yaml: [")).toThrow(YamlValidationError);
  });
});

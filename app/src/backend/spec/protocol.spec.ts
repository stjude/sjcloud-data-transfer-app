const protocol = require("../../../app/bin/backend/protocol");

describe("Handling incoming URI", () => {
  const sampleDxProject = "project-XXXXXXXXXXX";
  const validInput = `sjcloud://${sampleDxProject}`
  const validInputWithSlash = `sjcloud://${sampleDxProject}/`

  it("should return null when the URI doesn't contain 'sjcloud://'", () => {
    expect(protocol.handleURI("")).toBeNull();
    expect(protocol.handleURI(null)).toBeNull();
  });

  it(`should return return the proper JS command with valid input '${validInput}'`, () => {
    expect(protocol.handleURI(validInput)).toBe(`window.uriProject = '${sampleDxProject}';`);
  });

  it(`should return return the proper JS command with valid input '${validInputWithSlash}'`, () => {
    expect(protocol.handleURI(validInput)).toBe(`window.uriProject = '${sampleDxProject}';`);
  });
});
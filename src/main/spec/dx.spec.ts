const dx = require('../../../app/bin/backend/dx');
const config = require('../../../app/bin/backend/config').default;

const sampleToken = 'XXXXXXXXXXX';
const sampleDxFile = 'file-XXXXXXXXXXX';
const sampleDxProject = 'project-XXXXXXXXXXX';

/**
 * dx.loggedIn
 */

describe('DNAnexus loggedIn check', () => {
  it('should run the following command.', () => {
    const result = dx.loggedIn(null, true);
    expect(result).toBe('dx whoami');
  });
});

/**
 * dx.login
 */

describe('DNAnexus login', () => {
  it('should fail if the token is null.', done => {
    dx.login(null, (error: any, result: any) => {
      expect(error.message).toBe('Token cannot be null/empty!');
      done();
    });
  });

  it('should fail if the token is empty.', done => {
    dx.login('', (error: any, result: any) => {
      expect(error.message).toBe('Token cannot be null/empty!');
      done();
    });
  });

  it(`should run the following command with token '${sampleToken}'.`, () => {
    let output = dx.login(sampleToken, null, true);
    expect(output).toBe(`dx login --token ${sampleToken} --noprojects`);
  });
});

/**
 * dx.logout
 */

describe('DNAnexus logout', () => {
  it('should run the following command', () => {
    let output = dx.logout(null, true);
    expect(output).toBe('dx logout');
  });
});

/**
 * dx.describeDXItem
 */

describe('Describing a DX Item', () => {
  it('should fail if the dx-identifier is null.', done => {
    dx.describeDXItem(null, (error: any, result: any) => {
      expect(error.message).toBe('Dx-identifier cannot be null/empty!');
      done();
    });
  });

  it('should fail if the dx-identifier is empty.', done => {
    dx.describeDXItem('', (error: any, result: any) => {
      expect(error.message).toBe('Dx-identifier cannot be null/empty!');
      done();
    });
  });

  it(`should run the following command with dx-identifier '${
    sampleDxFile
  }'`, () => {
    let output = dx.describeDXItem(sampleDxFile, null, true);
    expect(output).toBe(`dx describe ${sampleDxFile} --json`);
  });
});

/**
 * dx.checkProjectAccess
 */

describe('Checking DNAnexus project access', () => {
  it("should return this command with platform 'linux'", () => {
    const result = dx.checkProjectAccess(null, true, 'linux');
    expect(result).toBe("echo '0' | dx select --level UPLOAD");
  });

  it("should return this command with platform 'darwin'", () => {
    const result = dx.checkProjectAccess(null, true, 'darwin');
    expect(result).toBe("echo '0' | dx select --level UPLOAD");
  });

  it("should return this command with platform 'win32'", () => {
    const result = dx.checkProjectAccess(null, true, 'win32');
    expect(result).toBe('"echo 0 | dx select --level UPLOAD"');
  });

  it("should error when platform is 'bleep'", () => {
    expect(() => {
      dx.checkProjectAccess(null, true, 'bleep');
    }).toThrow(new Error("Unrecognized platform: 'bleep'."));
  });
});

/**
 * dx.listDownloadableFiles
 */

describe('Listing DX files', () => {
  it('should fail if the dx-project is null.', done => {
    dx.listDownloadableFiles(null, false, (error: any, result: any) => {
      expect(error.message).toBe('Dx-project cannot be null/empty!');
      done();
    });
  });

  it('should fail if the dx-project is empty.', done => {
    dx.listDownloadableFiles('', false, (error: any, result: any) => {
      expect(error.message).toBe('Dx-project cannot be null/empty!');
      done();
    });
  });

  it(`should run the following command with args (${
    sampleDxProject
  }, false).`, () => {
    let output = dx.listDownloadableFiles(sampleDxProject, false, null, true);
    expect(output).toBe(
      `dx find data ` +
        `--path ${sampleDxProject}:/ ` +
        `--json ` +
        `--state closed ` +
        `--class file ` +
        `--tag ${config.DOWNLOADABLE_TAG}`
    );
  });

  it(`should run the following command with args (${
    sampleDxProject
  }, true).`, () => {
    let output = dx.listDownloadableFiles(sampleDxProject, true, null, true);
    expect(output).toBe(
      `dx find data ` +
        `--path ${sampleDxProject}:/ ` +
        `--json ` +
        `--state closed ` +
        `--class file`
    );
  });
});

/**
 * dx.parseDxProjects
 *
 * TODO(clay)
 */

/**
 * dx.listProjects
 */

describe('Listing DX projects', () => {
  it('should return the following commands for allProjects = false', done => {
    dx.listProjects(
      false,
      (error: any, result: any) => {
        expect(result.length).toEqual(2);
        expect(result[0]).toMatch(
          new RegExp(
            `dx find projects --level UPLOAD --delim .* --tag ${
              config.TOOL_PROJECT_TAG
            }`
          )
        );
        expect(result[1]).toMatch(
          new RegExp(
            `dx find projects --level UPLOAD --delim .* --tag ${
              config.DATA_PROJECT_TAG
            }`
          )
        );
        done();
      },
      true
    );
  });

  it('should return the following commands for allProjects = true', done => {
    dx.listProjects(
      true,
      (error: any, result: any) => {
        expect(result.length).toEqual(1);
        expect(result[0]).toMatch(
          new RegExp(`dx find projects --level UPLOAD --delim .*`)
        );
        done();
      },
      true
    );
  });
});

/**
 * dx.installDxToolkit
 *
 * TODO(clay)
 */

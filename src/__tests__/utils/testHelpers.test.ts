/**
 * This file exists to prevent Jest from trying to run testHelpers.ts as a test file.
 * The actual testHelpers.ts has been moved to src/testUtils/testHelpers.ts.
 */

describe('testHelpers', () => {
  it('should be skipped', () => {
    // This test is just a placeholder to prevent Jest from complaining
    // about no tests in the file.
    expect(true).toBe(true);
  });
}); 
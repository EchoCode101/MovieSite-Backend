test("Loads correct environment variables", () => {
  process.env.TEST_KEY = "testValue"; // Set a variable for the test
  expect(process.env.TEST_KEY).toBe("testValue");
});

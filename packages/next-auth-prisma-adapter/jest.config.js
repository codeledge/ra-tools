const base = require("config/jest-server");

module.exports = {
  ...base,
  //setupFilesAfterEnv: ["./test/jest.setup.ts"],
  moduleDirectories: ["node_modules", "src"],
};

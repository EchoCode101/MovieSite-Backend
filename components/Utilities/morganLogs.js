import fs from "fs";
import path from "path";

// Ensure correct __dirname in ES modules
const __dirname = path.resolve();

const logsDir = path.join(__dirname, "logs"); // Properly join the logs directory

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a",
});

export default logStream;

import config from "./config.js";
import moment from "moment-timezone";

const { colors } = config;

function getTime() {
  return moment().tz("Asia/Jakarta").format("HH:mm:ss DD/MM/YY");
}

const logger = {
  info: (msg) =>
    console.log(`${colors.primary}[${getTime()}] [INFO]${colors.reset} ${msg}`),
  success: (msg) =>
    console.log(`${colors.success}[${getTime()}] [OK]${colors.reset} ${msg}`),
  warn: (msg) =>
    console.log(`${colors.warning}[${getTime()}] [WARN]${colors.reset} ${msg}`),
  error: (msg) =>
    console.log(`${colors.error}[${getTime()}] [ERROR]${colors.reset} ${msg}`),
  cmd: (user, cmd) =>
    console.log(`${colors.primary}[${getTime()}] [CMD]${colors.reset} ${user} => ${cmd}`),
};

export default logger;

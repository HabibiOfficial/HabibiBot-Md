const config = {
  botName: "HabibiBot",
  prefix: ".",
  ownerNumber: process.env.OWNER_NUMBER || "628xxxxxxxxxx",
  ownerName: process.env.OWNER_NAME || "Owner",
  sessionPath: "./sessions",
  timezone: "Asia/Jakarta",

  colors: {
    primary: "\x1b[36m",
    success: "\x1b[32m",
    warning: "\x1b[33m",
    error: "\x1b[31m",
    reset: "\x1b[0m",
  },
};

export default config;

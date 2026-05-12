import config from "../lib/config.js";
import { runtime, formatBytes } from "../lib/utils.js";
import os from "os";

const { botName, ownerName, ownerNumber, prefix } = config;

export default {
  name: "info",
  alias: ["botinfo", "about"],
  desc: "Info lengkap bot",
  category: "general",
  async run({ sock, m }) {
    const uptime = process.uptime();
    const memUsed = process.memoryUsage().heapUsed;
    const memTotal = os.totalmem();
    const platform = os.platform();
    const cpuModel = os.cpus()[0]?.model || "Unknown";

    const text = `╔══════════════════╗
║   *${botName} INFO*
╚══════════════════╝

🤖 *Nama Bot* : ${botName}
👑 *Owner*    : ${ownerName}
📱 *Nomor*    : ${ownerNumber}
🔖 *Prefix*   : ${prefix}

💻 *SISTEM*
├ Platform : ${platform}
├ CPU      : ${cpuModel.split(" ").slice(0, 3).join(" ")}
├ RAM Used : ${formatBytes(memUsed)}
├ RAM Total: ${formatBytes(memTotal)}
└ Uptime   : ${runtime(uptime)}

📦 *Library* : habibi-baileys
⚙️ *Runtime* : Node.js ${process.version}`;

    await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
  },
};

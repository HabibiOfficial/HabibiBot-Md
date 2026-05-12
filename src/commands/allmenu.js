import config from "../lib/config.js";
import { commands } from "../lib/loadCommands.js";

const { prefix } = config;

function getGreet() {
  const hour = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta", hour: "numeric", hour12: false
  }) * 1;
  if (hour >= 4 && hour < 12) return "pagi";
  if (hour >= 12 && hour < 15) return "siang";
  if (hour >= 15 && hour < 18) return "sore";
  return "malam";
}

export default {
  name: "allmenu",
  alias: ["listcmd", "allcmd"],
  desc: "Tampilkan semua command lengkap",
  category: "main",

  async run({ sock, m, from, sender }) {
    const map = {};
    const seen = new Set();

    for (const [, cmd] of commands) {
      if (seen.has(cmd.name)) continue;
      seen.add(cmd.name);
      const cat = (cmd.category || "general").toLowerCase();
      if (!map[cat]) map[cat] = [];
      map[cat].push({ name: cmd.name, desc: cmd.desc || "" });
    }

    const categories = Object.keys(map).sort();
    const totalCmd = Object.values(map).reduce((a, v) => a + v.length, 0);
    const lastCat = categories[categories.length - 1];
    const userName = m.pushName || sender.split("@")[0];
    const greet = getGreet();

    let text = `halo *${userName}*, selamat ${greet} 👋\n\n`;
    text += `Total command: *${totalCmd}*\n\n`;

    for (const cat of categories) {
      const cmds = map[cat].sort((a, b) => a.name.localeCompare(b.name));
      const isLast = cat === lastCat;
      const pfx = isLast ? "└─" : "├─";
      const bar = isLast ? "   " : "│  ";
      const last = cmds.length - 1;

      text += `${pfx} 🔖 ⌞ ${cat.toUpperCase()} ⌝\n`;
      for (let i = 0; i < cmds.length; i++) {
        const { name, desc } = cmds[i];
        const tree = `${bar}${i === last ? "└─" : "├─"}`;
        text += desc
          ? `${tree} ${prefix}${name}  —  ${desc}\n`
          : `${tree} ${prefix}${name}\n`;
      }
      text += isLast ? "" : `${bar}\n`;
    }

    text += `\n> ketik *${prefix}menu <kategori>* untuk detail`;

    await sock.sendMessage(from, { text }, { quoted: m });
  },
};

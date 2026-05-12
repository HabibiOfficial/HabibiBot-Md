import config from "../lib/config.js";
import { runtime } from "../lib/utils.js";
import { commands } from "../lib/loadCommands.js";
import moment from "moment-timezone";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { botName, ownerName, prefix } = config;

function getGreet() {
  const hour = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta", hour: "numeric", hour12: false,
  }) * 1;
  if (hour >= 4 && hour < 12) return "pagi";
  if (hour >= 12 && hour < 15) return "siang";
  if (hour >= 15 && hour < 18) return "sore";
  return "malam";
}

function buildCategoryMap() {
  const map = {};
  const seen = new Set();
  for (const [, cmd] of commands) {
    if (seen.has(cmd.name)) continue;
    seen.add(cmd.name);
    const cat = (cmd.category || "general").toLowerCase();
    if (!map[cat]) map[cat] = [];
    map[cat].push({ cmd: cmd.name, desc: cmd.desc || "" });
  }
  return map;
}

function getMenuThumb() {
  try { return readFileSync(path.join(__dirname, "../assets/menu.jpg")); }
  catch { return null; }
}

const ICON = { fun: "🎮", general: "⚙️", main: "🏠", tool: "🔧" };

export default {
  name: "menu",
  alias: ["help", "start"],
  desc: "Tampilkan menu utama bot",
  category: "main",

  async run({ sock, m, args, from, sender }) {
    const map = buildCategoryMap();
    const categories = Object.keys(map).sort();
    const userName = m.pushName || sender.split("@")[0];
    const greet = getGreet();
    const thumb = getMenuThumb();

    // ── .menu all ─────────────────────────────────────
    if (args[0]?.toLowerCase() === "all") {
      const lastCat = categories[categories.length - 1];
      let text = `halo *${userName}*, selamat ${greet} 👋\n\n`;
      for (const cat of categories) {
        const cmds = map[cat].sort((a, b) => a.cmd.localeCompare(b.cmd));
        const isLast = cat === lastCat;
        const pfx = isLast ? "└─" : "├─";
        const bar = isLast ? "   " : "│  ";
        text += `${pfx} 🔖 ⌞ ${cat.toUpperCase()} ⌝\n`;
        text += cmds.map(({ cmd }, i) =>
          `${bar}${i === cmds.length - 1 ? "└─" : "├─"} ${prefix}${cmd}`
        ).join("\n");
        text += `\n${isLast ? "" : "│  \n"}`;
      }
      text += `\n> ketik *${prefix}menu <kategori>* untuk detail`;
      return sock.sendMessage(from, { text }, { quoted: m });
    }

    // ── .menu <kategori> ──────────────────────────────
    if (args[0]) {
      const target = args[0].toLowerCase();
      if (!map[target]) {
        return sock.sendMessage(from, {
          text:
            `Kategori *${target}* tidak ditemukan.\n\n` +
            `Kategori yang tersedia:\n` +
            categories.map(c => `🔖 ⌞ ${c.toUpperCase()} ⌝`).join("\n") +
            `\n\nKetik *${prefix}menu* untuk melihat semua kategori.`,
        }, { quoted: m });
      }
      const cmds = map[target].sort((a, b) => a.cmd.localeCompare(b.cmd));
      const text =
        `*🔖  ${target.toUpperCase()}*\n\n` +
        cmds.map(({ cmd, desc }, i) => {
          const tree = i === cmds.length - 1 ? "└─" : "├─";
          return desc ? `${tree} ${prefix}${cmd}  —  ${desc}` : `${tree} ${prefix}${cmd}`;
        }).join("\n") +
        `\n\n> ketik *${prefix}menu all* untuk semua command`;
      return sock.sendMessage(from, { text }, { quoted: m });
    }

    // ── .menu (home) — interactiveButtons via dugong ──
    const time = moment().tz("Asia/Jakarta").format("HH:mm:ss");
    const date = moment().tz("Asia/Jakarta").format("DD/MM/YYYY");
    const uptime = process.uptime();
    const totalCmd = Object.values(map).reduce((a, v) => a + v.length, 0);

    const bodyText =
      `👋 Halo, *${userName}*! Selamat ${greet}\n\n` +
      `⏱ *Uptime*  : ${runtime(uptime)}\n` +
      `🕐 *Waktu*   : ${time}\n` +
      `📅 *Tanggal* : ${date}\n` +
      `👑 *Owner*   : ${ownerName}\n` +
      `🤖 *Total*   : ${totalCmd} command\n\n` +
      `Ketuk tombol di bawah untuk pilih kategori 👇\n` +
      categories.map(c => `🔖 ⌞ ${c.toUpperCase()} ⌝`).join("\n") +
      `\n\n| ketik *${prefix}menu <kategori>* untuk list command\n` +
      `| atau *${prefix}menu all* untuk semua command`;

    // Buat tombol quick_reply untuk tiap kategori
    const catButtons = categories.map(cat => ({
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: `${ICON[cat] || "📋"} ${cat.toUpperCase()}`,
        id: `${prefix}menu ${cat}`,
      }),
    }));

    // Tambah tombol "Semua Command" dan "Allmenu"
    const extraButtons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "📜 Semua Command",
          id: `${prefix}menu all`,
        }),
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "📊 Detail Lengkap",
          id: `${prefix}allmenu`,
        }),
      },
    ];

    // interactiveMessage → handleInteractive di dugong.js
    // Tidak pakai viewOnceMessage wrapper, jadi semua button muncul dalam 1 pesan
    return sock.sendMessage(from, {
      interactiveMessage: {
        title: bodyText,
        footer: `© ${botName} | Prefix: ${prefix}`,
        header: `✨ ${botName}`,
        ...(thumb ? { image: thumb } : {}),
        buttons: [...catButtons, ...extraButtons],
      },
    }, { quoted: m });
  },
};

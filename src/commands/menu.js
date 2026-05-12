import config from "../lib/config.js";
import { runtime } from "../lib/utils.js";
import moment from "moment-timezone";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { botName, ownerName, prefix } = config;

export default {
  name: "menu",
  alias: ["help", "start"],
  desc: "Tampilkan menu utama bot",
  category: "main",
  async run({ sock, m }) {
    const uptime = process.uptime();
    const time = moment().tz("Asia/Jakarta").format("HH:mm:ss");
    const date = moment().tz("Asia/Jakarta").format("DD/MM/YYYY");

    const caption = `╔════════════════════╗
║   *${botName}*   
╚════════════════════╝

┌─「 *INFO BOT* 」
│ ⏱ Uptime  : ${runtime(uptime)}
│ 🕐 Waktu   : ${time}
│ 📅 Tanggal : ${date}
│ 👑 Owner   : ${ownerName}
└────────────────────

┌─「 *MENU UTAMA* 」
│
│ 📌 *GENERAL*
│ ${prefix}menu - Tampilkan menu
│ ${prefix}ping - Cek respon bot
│ ${prefix}info - Info bot
│ ${prefix}sticker - Buat sticker
│ ${prefix}echo - Echo pesan
│
│ 📌 *FUN*
│ ${prefix}dice - Lempar dadu
│ ${prefix}flip - Lempar koin
│ ${prefix}quote - Quote random
│
│ 📌 *TOOL*
│ ${prefix}calc - Kalkulator
│ ${prefix}weather - Info cuaca
│ ${prefix}uptime - Uptime bot
│
└────────────────────

_Ketik ${prefix}<command> untuk mulai_`;

    let menuImg;
    try {
      const imgPath = path.join(__dirname, "../assets/menu.jpg");
      menuImg = readFileSync(imgPath);
    } catch (_) {
      menuImg = null;
    }

    if (menuImg) {
      await sock.sendMessage(m.key.remoteJid, {
        image: menuImg,
        caption,
        mimetype: "image/jpeg"
      }, { quoted: m });
    } else {
      await sock.sendMessage(m.key.remoteJid, { text: caption }, { quoted: m });
    }
  },
};

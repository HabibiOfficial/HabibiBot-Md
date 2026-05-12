import config from "../lib/config.js";
import { runtime } from "../lib/utils.js";
import moment from "moment-timezone";

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

    const text = `╔════════════════════╗
║   *${botName}*   
╚════════════════════╝

┌─「 *INFO BOT* 」
│ ⏱ Uptime : ${runtime(uptime)}
│ 🕐 Waktu  : ${time}
│ 📅 Tanggal: ${date}
│ 👑 Owner  : ${ownerName}
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

    await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m });
  },
};

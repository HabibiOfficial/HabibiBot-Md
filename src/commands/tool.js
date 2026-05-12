import { runtime } from "../lib/utils.js";
import axios from "axios";

const calcCmd = {
  name: "calc",
  alias: ["kalkulator", "hitung"],
  desc: "Kalkulator sederhana",
  category: "tool",
  async run({ sock, m, args }) {
    if (!args.length) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Contoh: .calc 2+2 atau .calc 10*5" },
        { quoted: m }
      );
    }
    const expr = args.join("").replace(/[^0-9+\-*/().% ]/g, "");
    try {
      const result = Function('"use strict"; return (' + expr + ")")();
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `🧮 *Kalkulator*\n\nEkspresi: \`${expr}\`\nHasil: *${result}*` },
        { quoted: m }
      );
    } catch {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Ekspresi tidak valid!" },
        { quoted: m }
      );
    }
  },
};

const uptimeCmd = {
  name: "uptime",
  alias: ["up"],
  desc: "Cek uptime bot",
  category: "tool",
  async run({ sock, m }) {
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `⏱ *Uptime Bot*\n\n${runtime(process.uptime())}` },
      { quoted: m }
    );
  },
};

const echoCmd = {
  name: "echo",
  alias: ["say"],
  desc: "Echo pesan balik",
  category: "tool",
  async run({ sock, m, args }) {
    if (!args.length) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Ketik pesan setelah .echo" },
        { quoted: m }
      );
    }
    await sock.sendMessage(
      m.key.remoteJid,
      { text: args.join(" ") },
      { quoted: m }
    );
  },
};

const weatherCmd = {
  name: "weather",
  alias: ["cuaca"],
  desc: "Info cuaca kota",
  category: "tool",
  async run({ sock, m, args }) {
    if (!args.length) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Contoh: .weather Jakarta" },
        { quoted: m }
      );
    }
    const city = args.join(" ");
    try {
      const { data } = await axios.get(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`
      );
      const cur = data.current_condition[0];
      const area = data.nearest_area[0];
      const areaName = area.areaName[0].value;
      const country = area.country[0].value;
      const tempC = cur.temp_C;
      const feelsLike = cur.FeelsLikeC;
      const humidity = cur.humidity;
      const desc = cur.weatherDesc[0].value;
      const windKm = cur.windspeedKmph;

      await sock.sendMessage(
        m.key.remoteJid,
        {
          text: `🌤 *Cuaca ${areaName}, ${country}*\n\n🌡 Suhu: *${tempC}°C* (Terasa: ${feelsLike}°C)\n💧 Kelembapan: *${humidity}%*\n💨 Angin: *${windKm} km/h*\n☁️ Kondisi: *${desc}*`,
        },
        { quoted: m }
      );
    } catch {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Tidak dapat menemukan cuaca untuk: *${city}*` },
        { quoted: m }
      );
    }
  },
};

export default [calcCmd, uptimeCmd, echoCmd, weatherCmd];

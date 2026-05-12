export default {
  name: "ping",
  alias: ["speed", "latency"],
  desc: "Cek respon bot",
  category: "general",
  async run({ sock, m }) {
    const start = Date.now();
    await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong!" }, { quoted: m });
    const latency = Date.now() - start;
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `🏓 *Pong!*\n⚡ Latency: *${latency}ms*` },
      { quoted: m }
    );
  },
};

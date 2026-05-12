import config from "../lib/config.js";

const { botName, ownerName } = config;

export default {
  name: "sticker",
  alias: ["s", "stiker"],
  desc: "Buat sticker dari gambar/video",
  category: "tool",
  async run({ sock, m }) {
    const msg = m.message;
    const quoted =
      msg?.imageMessage ||
      msg?.videoMessage ||
      msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      msg?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

    if (!quoted) {
      return sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Kirim/reply gambar atau video dengan caption *.sticker*" },
        { quoted: m }
      );
    }

    await sock.sendMessage(
      m.key.remoteJid,
      { text: "⏳ Sedang membuat sticker..." },
      { quoted: m }
    );

    try {
      const media = await sock.downloadMediaMessage(m);
      await sock.sendMessage(m.key.remoteJid, {
        sticker: media,
        stickerMetadata: {
          packname: botName,
          author: ownerName,
        },
      });
    } catch (e) {
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Gagal membuat sticker: ${e.message}` },
        { quoted: m }
      );
    }
  },
};

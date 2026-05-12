const quotes = [
  "Hidup bukan tentang menunggu badai berlalu, tapi belajar menari di tengah hujan.",
  "Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.",
  "Jangan pernah menyerah, karena hal besar membutuhkan waktu yang besar.",
  "Impian tanpa tindakan hanyalah khayalan. Tindakan tanpa impian adalah sia-sia.",
  "Setiap hari adalah kesempatan baru untuk menjadi lebih baik dari kemarin.",
  "Orang yang tidak pernah membuat kesalahan tidak pernah mencoba hal baru.",
  "Jika kamu tidak bisa terbang, berlari. Jika tidak bisa berlari, berjalan.",
  "Sukses tidak datang dari apa yang kamu lakukan sesekali, tapi dari apa yang kamu lakukan secara konsisten.",
];

const diceCmd = {
  name: "dice",
  alias: ["dadu"],
  desc: "Lempar dadu",
  category: "fun",
  async run({ sock, m }) {
    const result = Math.floor(Math.random() * 6) + 1;
    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `🎲 Hasil dadu: ${faces[result - 1]} *(${result})*` },
      { quoted: m }
    );
  },
};

const flipCmd = {
  name: "flip",
  alias: ["coin", "koin"],
  desc: "Lempar koin",
  category: "fun",
  async run({ sock, m }) {
    const result = Math.random() < 0.5 ? "🟡 *Heads (Angka)*" : "⚪ *Tails (Gambar)*";
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `🪙 Hasil koin: ${result}` },
      { quoted: m }
    );
  },
};

const quoteCmd = {
  name: "quote",
  alias: ["motivasi", "qotd"],
  desc: "Quote motivasi random",
  category: "fun",
  async run({ sock, m }) {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    await sock.sendMessage(
      m.key.remoteJid,
      { text: `💬 _"${q}"_` },
      { quoted: m }
    );
  },
};

export default [diceCmd, flipCmd, quoteCmd];

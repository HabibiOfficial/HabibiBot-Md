import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
} from "habibi-baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import path from "path";
import { existsSync, rmSync } from "fs";
import { fileURLToPath } from "url";
import figlet from "figlet";
import { loadCommands, commands } from "./lib/loadCommands.js";
import { parseMessage } from "./lib/utils.js";
import logger from "./lib/logger.js";
import config from "./lib/config.js";
import { showLoginMenu, c, W, nl, sep, row, hdr } from "./lib/loginMenu.js";
import { injectBizContext } from "./lib/patcher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.resolve(__dirname, "../sessions");
const CREDS_FILE = path.join(SESSION_PATH, "creds.json");

async function startBot() {
  console.log("\n" + figlet.textSync(config.botName, { font: "Small" }));
  console.log(`  Prefix: ${config.prefix} | Owner: ${config.ownerName}\n`);

  await loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
  const { version } = await fetchLatestBaileysVersion();

  logger.info(`Menggunakan WA v${version.join(".")}`);

  const isAlreadyLoggedIn = existsSync(CREDS_FILE);
  let usePairingCode = false;
  let phoneNumber = null;

  if (!isAlreadyLoggedIn) {
    const loginChoice = await showLoginMenu();
    usePairingCode = loginChoice.usePairingCode;
    phoneNumber = loginChoice.phoneNumber;
  } else {
    logger.info("Sesi ditemukan, menghubungkan...");
  }

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    printQRInTerminal: !usePairingCode,
    browser: Browsers.ubuntu("Chrome"),
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
  });

  if (usePairingCode && phoneNumber && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        const display = code.match(/.{1,4}/g)?.join("-") ?? code;

        console.clear();
        hdr(config.botName, "pairing code");
        nl();
        W(`  ${c.bold}code${c.reset}\n`);
        W(`  ${c.bold}${c.cyan}  ${display}${c.reset}\n`);
        nl();
        W(`  ${c.bold}instruksi${c.reset}\n`);
        W(`  ${c.dim}  1. buka whatsapp di hp kamu${c.reset}\n`);
        W(`  ${c.dim}  2. masuk ke Perangkat Tertaut${c.reset}\n`);
        W(`  ${c.dim}  3. pilih Tautkan dengan nomor telepon${c.reset}\n`);
        W(`  ${c.dim}  4. masukkan kode di atas${c.reset}\n`);
        nl();
        W(`  ${c.yellow}  catatan: kode berlaku beberapa menit${c.reset}\n`);
        sep();
        nl();
      } catch (e) {
        logger.error(`Gagal membuat pairing code: ${e.message}`);
      }
    }, 3000);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      const now = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      console.clear();
      hdr(config.botName);
      row("status", "connected ✓", c.green);
      row("session", sock.user?.id || "-", c.white);
      row("waktu", now, c.dim);
      nl();
      W(`  ${c.bold}prefix${c.reset}\n`);
      W(`  ${c.dim}  gunakan ${c.white}${config.prefix}menu${c.reset}${c.dim} untuk melihat semua command\n${c.reset}`);
      nl();
      W(`  ${c.bold}owner${c.reset}\n`);
      W(`  ${c.dim}  ${config.ownerName} · ${config.ownerNumber}${c.reset}\n`);
      sep();
      nl();
    }

    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;

      if (!shouldReconnect) {
        rmSync(SESSION_PATH, { recursive: true, force: true });
        nl();
        row("auth", "sesi berakhir · file sesi dihapus · restart untuk login ulang", c.red);
        nl();
        process.exit(0);
      }

      row("status", "koneksi terputus · reconnect dalam 3 detik...", c.yellow);
      nl();
      setTimeout(startBot, 3000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    logger.info(`[MSG] type=${type} count=${messages.length}`);
    if (type !== "notify") return;

    for (const m of messages) {
      if (!m.message) { logger.info("[MSG] skip: no message"); continue; }
      if (m.key.fromMe) { logger.info("[MSG] skip: fromMe"); continue; }

      const from = m.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const sender = isGroup
        ? m.key.participant || m.key.remoteJid
        : m.key.remoteJid;

      const msgType = Object.keys(m.message || {})[0];
      const body =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        m.message?.buttonsResponseMessage?.selectedButtonId ||
        m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        m.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
        m.message?.ephemeralMessage?.message?.conversation ||
        m.message?.viewOnceMessage?.message?.extendedTextMessage?.text ||
        "";

      logger.info(`[MSG] from=${from.split("@")[0]} type=${msgType} body="${body}"`);

      const { isCmd, command, args, text } = parseMessage(body);
      if (!isCmd) continue;

      const cmd = commands.get(command);
      if (!cmd) continue;

      logger.cmd(sender.split("@")[0], `${config.prefix}${command}`);

      const bizSock = new Proxy(sock, {
        get(target, prop) {
          if (prop === 'sendMessage') {
            return (jid, content, opts) => {
              try {
                content = injectBizContext(content);
              } catch (_) {}
              return target.sendMessage(jid, content, opts);
            };
          }
          return target[prop];
        }
      });

      try {
        await cmd.run({ sock: bizSock, m, args, text, from, sender, isGroup });
      } catch (e) {
        logger.error(`Error di command ${command}: ${e.message}`);
        try {
          await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: m });
        } catch (_) {}
      }
    }
  });
}

startBot().catch((e) => {
  logger.error(`Fatal: ${e.message}`);
  process.exit(1);
});

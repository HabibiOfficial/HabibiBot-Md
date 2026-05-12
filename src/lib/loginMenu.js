import config from "./config.js";

export const c = {
  reset : "\x1b[0m",
  dim   : "\x1b[90m",
  white : "\x1b[97m",
  bold  : "\x1b[1m",
  green : "\x1b[32m",
  cyan  : "\x1b[36m",
  yellow: "\x1b[33m",
  red   : "\x1b[31m",
  blue  : "\x1b[34m",
};

export const W   = (...args) => process.stdout.write(args.join(""));
export const nl  = ()        => W("\n");
export const sep = ()        => W(`${c.dim}  ─────────────────────────────${c.reset}\n`);

export const row = (k, v, col = c.white) =>
  W(`  ${c.bold}${k.padEnd(12)}${c.reset}${col}${v}${c.reset}\n`);

export const hdr = (title, sub = "") => {
  nl();
  sep();
  W(`  ${c.bold}${c.white}${title}${c.reset}`);
  if (sub) W(`  ${c.dim}${sub}${c.reset}`);
  W("\n");
  sep();
  nl();
};

function ask(prompt) {
  return new Promise((resolve) => {
    W(`  ${c.dim}${prompt}${c.reset}  `);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (data) => {
      process.stdin.pause();
      resolve(data.replace(/\r?\n$/, "").trim());
    });
  });
}

export async function showLoginMenu() {
  console.clear();
  hdr(config.botName, "login");

  W(`  ${c.bold}metode${c.reset}\n`);
  W(`  ${c.dim}  1${c.reset}  ${c.white}pairing code${c.reset}  ${c.dim}masukkan kode di whatsapp${c.reset}\n`);
  W(`  ${c.dim}  2${c.reset}  ${c.white}scan qr${c.reset}      ${c.dim}scan qr code seperti wa web${c.reset}\n`);
  W(`  ${c.dim}  3${c.reset}  ${c.white}exit${c.reset}         ${c.dim}keluar dari bot${c.reset}\n`);
  nl();
  sep();
  nl();

  let choice = "";
  while (!["1", "2", "3"].includes(choice)) {
    choice = await ask("pilih  >");
    if (!["1", "2", "3"].includes(choice)) {
      W(`  ${c.yellow}  pilihan tidak valid, coba lagi${c.reset}\n`);
      nl();
    }
  }

  if (choice === "3") {
    nl();
    row("exit", "sampai jumpa!", c.dim);
    nl();
    process.exit(0);
  }

  let phoneNumber = null;

  if (choice === "1") {
    nl();
    W(`  ${c.bold}nomor whatsapp${c.reset}\n`);
    W(`  ${c.dim}  gunakan format 628xxx (tanpa + atau spasi)${c.reset}\n`);
    nl();

    let rawPhone = "";
    while (!rawPhone.match(/^\d{9,15}$/)) {
      rawPhone = (await ask("nomor  >")).replace(/\D/g, "");
      if (!rawPhone.match(/^\d{9,15}$/)) {
        W(`  ${c.yellow}  nomor tidak valid, coba lagi${c.reset}\n`);
        nl();
      }
    }

    phoneNumber = rawPhone;
    nl();
    W(`  ${c.dim}  nomor: ${c.white}+${phoneNumber}${c.reset}\n`);
    W(`  ${c.dim}  membuat pairing code...${c.reset}\n`);
    nl();
  } else {
    nl();
    W(`  ${c.dim}  menunggu qr code...\n${c.reset}`);
    nl();
  }

  return {
    usePairingCode: choice === "1",
    phoneNumber,
  };
}

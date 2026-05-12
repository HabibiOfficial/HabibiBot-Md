import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import logger from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const commands = new Map();

export async function loadCommands() {
  const cmdDir = join(__dirname, "../commands");
  const files = readdirSync(cmdDir).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    try {
      const mod = await import(pathToFileURL(join(cmdDir, file)).href);
      const exported = mod.default;
      const list = Array.isArray(exported) ? exported : [exported];
      for (const cmd of list) {
        commands.set(cmd.name, cmd);
        if (cmd.alias) {
          for (const a of cmd.alias) {
            commands.set(a, cmd);
          }
        }
      }
      logger.success(`Command loaded: ${file}`);
    } catch (e) {
      logger.error(`Failed to load command ${file}: ${e.message}`);
    }
  }

  logger.info(`Total commands: ${new Set([...commands.values()]).size}`);
  return commands;
}

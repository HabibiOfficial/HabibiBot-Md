// Implementasi "fakeq" seperti wesker-bot (feb-patch)
// Membuat pesan bot terlihat dari WhatsApp Business verified

const WA_PARTICIPANT = '0@s.whatsapp.net'

function buildDefaultCtx(m) {
  return {
    participant: WA_PARTICIPANT,
    quotedMessage: { conversation: m?.body || m?.text || '' },
    mentionedJid: m?.sender ? [m.sender] : []
  }
}

function normalizeCtx(ctx, defaultCtx) {
  if (!ctx) return defaultCtx
  if (ctx.participant === WA_PARTICIPANT || ctx.__skipPatch) return ctx
  const { stanzaId, participant, ...rest } = ctx
  return {
    ...rest,
    participant: WA_PARTICIPANT,
    quotedMessage: ctx.quotedMessage || defaultCtx.quotedMessage,
    mentionedJid: ctx.mentionedJid?.length ? ctx.mentionedJid : defaultCtx.mentionedJid
  }
}

function processSendMessage(content, defaultCtx) {
  if (!content || typeof content !== 'object') return content
  if (content.delete || content.edit || content.react) return content

  // interactiveMessage: contextInfo masuk DALAM, bukan di luar
  if (content.interactiveMessage) {
    return {
      ...content,
      interactiveMessage: {
        ...content.interactiveMessage,
        contextInfo: normalizeCtx(content.interactiveMessage.contextInfo, defaultCtx)
      }
    }
  }

  // listMessage: contextInfo masuk DALAM listMessage
  if (content.listMessage) {
    return {
      ...content,
      listMessage: {
        ...content.listMessage,
        contextInfo: normalizeCtx(content.listMessage.contextInfo, defaultCtx)
      }
    }
  }

  // Pesan teks/media biasa: contextInfo di level atas
  return {
    ...content,
    contextInfo: normalizeCtx(content.contextInfo, defaultCtx)
  }
}

function processRelayMessage(content, defaultCtx) {
  if (!content || typeof content !== 'object') return content
  const inner =
    content.viewOnceMessage?.message ||
    content.ephemeralMessage?.message ||
    content

  const typesWithCtx = [
    'extendedTextMessage', 'imageMessage', 'videoMessage', 'audioMessage',
    'stickerMessage', 'documentMessage', 'locationMessage', 'contactMessage',
    'interactiveMessage', 'listMessage'
  ]

  for (const type of typesWithCtx) {
    if (!inner[type]) continue
    inner[type] = {
      ...inner[type],
      contextInfo: normalizeCtx(inner[type].contextInfo, defaultCtx)
    }
    return content
  }

  if (inner.text !== undefined) {
    inner.contextInfo = normalizeCtx(inner.contextInfo, defaultCtx)
  }
  return content
}

// Strip quoted dari opts — kunci badge muncul
function stripQuotedOpts(opts) {
  if (!opts) return opts
  const { quoted, ...rest } = opts
  return rest
}

export function patchSock(sock, m) {
  const defaultCtx = buildDefaultCtx(m)
  return new Proxy(sock, {
    get(target, prop) {
      if (prop === 'sendMessage') {
        return async (jid, content, opts) => {
          content = processSendMessage(content, defaultCtx)
          opts = stripQuotedOpts(opts)
          return target.sendMessage(jid, content, opts)
        }
      }
      if (prop === 'relayMessage') {
        return async (jid, content, opts) => {
          content = processRelayMessage(content, defaultCtx)
          return target.relayMessage(jid, content, opts)
        }
      }
      return target[prop]
    }
  })
}

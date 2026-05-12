const WA_BUSINESS_JID = '0@s.whatsapp.net'

export function buildContextInfo(mentions = []) {
  return {
    participant: WA_BUSINESS_JID,
    quotedMessage: {
      contactMessage: {
        displayName: '🔖 HabibiBot',
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          'N:XL;HabibiBot,;;;\n' +
          'FN:HabibiBot\n' +
          'item1.TEL;waid=13135550002:+1 (313) 555-0002\n' +
          'item1.X-ABLabel:Ponsel\n' +
          'END:VCARD'
      }
    },
    mentionedJid: Array.isArray(mentions) ? mentions.filter(Boolean) : []
  }
}

const MSG_TYPES_WITH_CTX = [
  'extendedTextMessage', 'imageMessage', 'videoMessage', 'audioMessage',
  'stickerMessage', 'documentMessage', 'locationMessage', 'contactMessage',
  'interactiveMessage'
]

function injectCtx(content) {
  if (!content || typeof content !== 'object') return content
  if (content.delete || content.edit || content.react) return content

  const ctx = buildContextInfo()

  const inner =
    content.viewOnceMessage?.message ||
    content.ephemeralMessage?.message ||
    content

  for (const type of MSG_TYPES_WITH_CTX) {
    if (!inner[type]) continue
    inner[type] = { ...inner[type], contextInfo: { ...ctx, ...inner[type].contextInfo } }
    return content
  }

  if (inner.text !== undefined) {
    inner.contextInfo = { ...ctx, ...inner.contextInfo }
  }

  return content
}

export function patchSock(sock) {
  return new Proxy(sock, {
    get(target, prop) {
      if (prop === 'sendMessage') {
        return (jid, content, opts) => {
          content = injectCtx(content)
          const { quoted, ...restOpts } = opts || {}
          return target.sendMessage(jid, content, restOpts)
        }
      }
      return target[prop]
    }
  })
}

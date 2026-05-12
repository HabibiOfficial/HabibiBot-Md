export function injectBizContext(content) {
  if (!content || typeof content !== 'object') return content
  if (content.delete || content.edit || content.react) return content

  const ctx = {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast'
  }

  const hasPayload =
    content.text !== undefined ||
    content.image !== undefined ||
    content.video !== undefined ||
    content.audio !== undefined ||
    content.document !== undefined ||
    content.sticker !== undefined

  if (!hasPayload) return content

  return {
    ...content,
    contextInfo: { ...ctx, ...(content.contextInfo || {}) }
  }
}

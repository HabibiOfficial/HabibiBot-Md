// WhatsApp Business badge injection
// Membuat pesan terlihat seperti dari akun WhatsApp Business verified

export function injectBizContext(content) {
  if (!content || typeof content !== 'object') return content
  if (content.delete || content.edit || content.react) return content

  const ctx = {
    participant: '0@s.whatsapp.net',
    forwardingScore: 999,
    isForwarded: true
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
    contextInfo: {
      ...ctx,
      ...(content.contextInfo || {})
    }
  }
}

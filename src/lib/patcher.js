const WA_BUSINESS_JID = '0@s.whatsapp.net'

function buildContextInfo() {
  return {
    participant: WA_BUSINESS_JID,
    quotedMessage: {
      contactMessage: {
        displayName: '🔖 HabibiBot',
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          'FN:HabibiBot\n' +
          'item1.TEL;waid=13135550002:+1 (313) 555-0002\n' +
          'END:VCARD'
      }
    }
  }
}

export function injectBizContext(content) {
  if (!content || typeof content !== 'object') return content
  if (content.delete || content.edit || content.react || content.sticker) return content

  const ctx = buildContextInfo()

  if (content.text !== undefined) {
    return {
      ...content,
      contextInfo: { ...ctx, ...(content.contextInfo || {}) }
    }
  }

  const mediaTypes = ['image', 'video', 'audio', 'document']
  for (const type of mediaTypes) {
    if (content[type] !== undefined) {
      return {
        ...content,
        contextInfo: { ...ctx, ...(content.contextInfo || {}) }
      }
    }
  }

  return content
}

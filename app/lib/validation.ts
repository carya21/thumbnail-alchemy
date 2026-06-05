const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function isDataImage(value?: string): value is string {
  if (!value) return false;
  const comma = value.indexOf(',');
  if (comma < 0) return false;
  const mimeType = value.slice(5, value.indexOf(';'));
  return value.startsWith('data:image/') && allowedMimeTypes.includes(mimeType);
}

export function validateInput(request: { topic?: string; copyImage?: string; mainCopy?: string }) {
  if (!request.topic?.trim()) return '새 영상 주제를 입력해줘.';
  if (!isDataImage(request.copyImage) && !request.mainCopy?.trim()) return '카피 구조 이미지나 메인카피 중 하나는 넣어줘.';
  return '';
}

export function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const fenceStart = trimmed.indexOf('```');
  if (fenceStart >= 0) {
    const bodyStart = trimmed.indexOf('\n', fenceStart);
    const bodyEnd = trimmed.lastIndexOf('```');
    if (bodyStart >= 0 && bodyEnd > bodyStart) return trimmed.slice(bodyStart, bodyEnd).trim();
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  throw new Error('AI 분석 결과를 JSON으로 읽지 못했어.');
}

export function dataUrlToParts(dataUrl: string) {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) throw new Error('지원하는 이미지 형식은 PNG, JPG, WEBP야.');
  const header = dataUrl.slice(0, comma);
  const base64 = dataUrl.slice(comma + 1);
  const mimeType = header.slice(5, header.indexOf(';'));
  if (!allowedMimeTypes.includes(mimeType)) throw new Error('지원하는 이미지 형식은 PNG, JPG, WEBP야.');
  const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  return { mimeType, extension, buffer: Buffer.from(base64, 'base64') };
}

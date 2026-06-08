import OpenAI, { toFile } from 'openai';
import { dataUrlToParts } from './validation';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY가 아직 설정되지 않았습니다.');
  return new OpenAI({ apiKey });
}

export function getAnalysisModel() {
  return process.env.ANALYSIS_MODEL || 'gpt-5.5';
}

export function getImageModel() {
  return process.env.IMAGE_MODEL || 'gpt-image-2';
}

export function getThumbnailImageSize() {
  return getImageModel().includes('gpt-image-2') ? '1536x864' : '1536x1024';
}

export function imageBase64ToDataUrl(base64: string, mimeType = 'image/png') {
  return 'data:' + mimeType + ';base64,' + base64;
}

export async function dataUrlToOpenAIFile(dataUrl: string, name: string) {
  const { buffer, extension, mimeType } = dataUrlToParts(dataUrl);
  return toFile(buffer, name + '.' + extension, { type: mimeType });
}

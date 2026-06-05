import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataUrlToOpenAIFile, getImageModel, getOpenAIClient, getThumbnailImageSize, imageBase64ToDataUrl } from '../../lib/openai';
import { buildRevisionPrompt } from '../../lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 120;

const schema = z.object({
  revisionRequest: z.string().min(1),
  selected: z.object({
    label: z.enum(['A', 'B', 'C']),
    name: z.string(),
    headline: z.string(),
    subline: z.string(),
    designDirection: z.string(),
    prompt: z.string(),
    imageUrl: z.string()
  })
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const image = await dataUrlToOpenAIFile(body.selected.imageUrl, 'thumbnail-' + body.selected.label.toLowerCase());
    const response = await getOpenAIClient().images.edit({
      model: getImageModel(),
      image,
      prompt: buildRevisionPrompt(body.selected.label, body.revisionRequest, body.selected.prompt),
      n: 1,
      size: getThumbnailImageSize() as any,
      quality: 'high',
      output_format: 'png',
      background: 'opaque',
      input_fidelity: 'high'
    } as any);
    const base64 = response.data?.[0]?.b64_json;
    if (!base64) throw new Error('수정 이미지 데이터가 비어 있어.');
    return NextResponse.json({ revised: { ...body.selected, imageUrl: imageBase64ToDataUrl(base64) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message.includes('OPENAI_API_KEY') ? message : '수정 중 문제가 생겼어: ' + message }, { status: 500 });
  }
}

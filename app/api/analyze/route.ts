import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnalysisModel, getOpenAIClient } from '../../lib/openai';
import { buildAnalysisPrompt, normalizeAnalysisReport } from '../../lib/prompts';
import { extractJsonObject, validateInput } from '../../lib/validation';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  topic: z.string(),
  tone: z.string().optional(),
  copyImage: z.string(),
  designImage: z.string()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const validationError = validateInput(body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const response = await getOpenAIClient().responses.create({
      model: getAnalysisModel(),
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: buildAnalysisPrompt(body.topic, body.tone) },
            { type: 'input_text', text: '1번 이미지: 카피 구조만 분석할 썸네일' },
            { type: 'input_image', image_url: body.copyImage, detail: 'high' },
            { type: 'input_text', text: '2번 이미지: 디자인 스타일만 분석할 썸네일' },
            { type: 'input_image', image_url: body.designImage, detail: 'high' }
          ]
        }
      ]
    });

    const report = normalizeAnalysisReport(JSON.parse(extractJsonObject(response.output_text)));
    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message.includes('OPENAI_API_KEY') ? message : '분석 중 문제가 생겼어: ' + message }, { status: 500 });
  }
}

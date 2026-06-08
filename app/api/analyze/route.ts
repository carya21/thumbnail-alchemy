import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnalysisModel, getOpenAIClient } from '../../lib/openai';
import { applyDirectCopy, buildAnalysisPrompt, normalizeAnalysisReport } from '../../lib/prompts';
import { extractJsonObject, isDataImage, validateInput } from '../../lib/validation';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  topic: z.string(),
  tone: z.string().optional(),
  copyImage: z.string().optional(),
  designImage: z.string().optional(),
  mainCopy: z.string().optional(),
  subCopy: z.string().optional(),
  designPrompt: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const validationError = validateInput(body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const content: Array<Record<string, unknown>> = [
      {
        type: 'input_text',
        text: buildAnalysisPrompt(body.topic, body.tone, {
          copyImage: body.copyImage,
          designImage: body.designImage,
          mainCopy: body.mainCopy,
          subCopy: body.subCopy,
          designPrompt: body.designPrompt
        })
      }
    ];

    if (isDataImage(body.copyImage)) {
      content.push(
        { type: 'input_text', text: '1번 이미지: 카피 구조만 분석할 썸네일' },
        { type: 'input_image', image_url: body.copyImage, detail: 'high' }
      );
    }

    if (isDataImage(body.designImage)) {
      content.push(
        { type: 'input_text', text: '2번 이미지: 디자인 스타일과 클릭 의도를 분석할 썸네일' },
        { type: 'input_image', image_url: body.designImage, detail: 'high' }
      );
    }

    const response = await getOpenAIClient().responses.create({
      model: getAnalysisModel(),
      input: [
        {
          role: 'user',
          content: content as never
        }
      ]
    });

    const report = applyDirectCopy(
      normalizeAnalysisReport(JSON.parse(extractJsonObject(response.output_text))),
      body.mainCopy,
      body.subCopy
    );
    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorMessage = message.includes('OPENAI_API_KEY') ? message : '분석 중 문제가 생겼습니다: ' + message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

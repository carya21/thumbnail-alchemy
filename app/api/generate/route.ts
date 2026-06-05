import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getImageModel, getOpenAIClient, getThumbnailImageSize, imageBase64ToDataUrl } from '../../lib/openai';
import { buildImagePrompt } from '../../lib/prompts';
import type { AnalysisReport, GeneratedOption } from '../../types';

export const runtime = 'nodejs';
export const maxDuration = 180;

const optionSchema = z.object({
  label: z.enum(['A', 'B', 'C']),
  name: z.string(),
  headline: z.string(),
  subline: z.string(),
  designDirection: z.string(),
  prompt: z.string()
});

const copyBreakdownSchema = z.object({
  mainCopy: z.string(),
  subCopy: z.string(),
  mainPattern: z.string(),
  subPattern: z.string(),
  variableMap: z.array(z.string()),
  adaptationGuide: z.array(z.string())
});

const designIntentSchema = z.object({
  copyEmphasis: z.array(z.string()),
  clickIntent: z.array(z.string()),
  visualHierarchy: z.array(z.string())
});

const schema = z.object({
  topic: z.string().min(1),
  tone: z.string().optional(),
  analysis: z.object({
    copyBreakdown: copyBreakdownSchema,
    designIntent: designIntentSchema,
    copyStructure: z.array(z.string()),
    designStyle: z.array(z.string()),
    transferRules: z.array(z.string()),
    cautionNotes: z.array(z.string()),
    summary: z.string(),
    options: z.array(optionSchema).length(3)
  })
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const client = getOpenAIClient();
    const imageModel = getImageModel();
    const size = getThumbnailImageSize() as any;

    const options = await Promise.all(body.analysis.options.map(async (option) => {
      const prompt = buildImagePrompt(option, body.analysis as AnalysisReport);
      const response = await client.images.generate({
        model: imageModel,
        prompt,
        n: 1,
        size,
        quality: 'high',
        output_format: 'png',
        background: 'opaque',
        moderation: 'auto'
      } as any);
      const base64 = response.data?.[0]?.b64_json;
      if (!base64) throw new Error(option.label + '안 이미지 데이터가 비어 있어.');
      return { ...option, prompt, imageUrl: imageBase64ToDataUrl(base64) } satisfies GeneratedOption;
    }));

    return NextResponse.json({ options });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message.includes('OPENAI_API_KEY') ? message : 'ABC 이미지 생성 중 문제가 생겼어: ' + message }, { status: 500 });
  }
}

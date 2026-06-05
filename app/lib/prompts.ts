import type { AnalysisReport, OptionLabel, ThumbnailOption } from '../types';

const labels: OptionLabel[] = ['A', 'B', 'C'];
const fallbackHeadlines = ['이거 모르면 손해', '조회수 차이 나는 이유', '오늘 바로 써먹기'];

export function buildAnalysisPrompt(topic: string, tone?: string) {
  return [
    '너는 유튜브 썸네일 전문 크리에이티브 디렉터야.',
    '',
    '입력 이미지는 두 장이야.',
    '1번 이미지는 카피 구조만 분석해. 문구를 그대로 베끼지 말고 후킹 방식과 문장 구조만 추출해.',
    '2번 이미지는 디자인 스타일만 분석해. 로고, 캐릭터, 인물, 브랜드 고유 요소를 복제하지 말고 레이아웃 원리만 추출해.',
    '',
    '새 영상 주제: ' + topic,
    '원하는 톤: ' + (tone?.trim() || '똑사장 수강생이 바로 이해하는 실전형'),
    '',
    '반드시 한국어 JSON만 반환해. 마크다운 설명은 쓰지 마.',
    '{',
    '  "copyStructure": ["카피 구조 분석 1", "카피 구조 분석 2", "카피 구조 분석 3"],',
    '  "designStyle": ["디자인 스타일 분석 1", "디자인 스타일 분석 2", "디자인 스타일 분석 3"],',
    '  "transferRules": ["새 썸네일에 적용할 규칙 1", "규칙 2", "규칙 3"],',
    '  "cautionNotes": ["그대로 베끼지 않기 위한 주의점 1", "주의점 2"],',
    '  "summary": "분석 요약",',
    '  "options": [',
    '    { "label": "A", "name": "후킹형", "headline": "메인 문구", "subline": "보조 문구", "designDirection": "디자인 방향", "prompt": "이미지 생성 프롬프트" },',
    '    { "label": "B", "name": "반전형", "headline": "메인 문구", "subline": "보조 문구", "designDirection": "디자인 방향", "prompt": "이미지 생성 프롬프트" },',
    '    { "label": "C", "name": "실전형", "headline": "메인 문구", "subline": "보조 문구", "designDirection": "디자인 방향", "prompt": "이미지 생성 프롬프트" }',
    '  ]',
    '}',
    '',
    '모든 프롬프트는 1280x720 유튜브 썸네일 구도, 큰 한국어 타이포, 모바일 가독성, 강한 대비를 기준으로 작성해.'
  ].join('\n');
}

export function buildImagePrompt(option: ThumbnailOption, report: AnalysisReport) {
  return [
    'Create an original Korean YouTube thumbnail in 16:9 composition.',
    'Target presentation: 1280x720. Make text crisp, bold, and readable on mobile.',
    'Use exact Korean text only. Do not add extra words.',
    '',
    'Main text: ' + option.headline,
    'Sub text: ' + option.subline,
    'Creative direction: ' + option.designDirection,
    '',
    'Copy structure to transfer:',
    report.copyStructure.map((item) => '- ' + item).join('\n'),
    '',
    'Design style to benchmark:',
    report.designStyle.map((item) => '- ' + item).join('\n'),
    '',
    'Originality rules: do not copy logos, watermarks, exact characters, exact people, or brand identity from references.',
    '',
    option.prompt
  ].join('\n');
}

export function buildRevisionPrompt(selectedLabel: string, revisionRequest: string, originalPrompt: string) {
  return [
    '선택된 1장 ' + selectedLabel + '안을 수정해.',
    '기존 프롬프트: ' + originalPrompt,
    '수정 요청: ' + revisionRequest,
    '기존 콘셉트와 카피 방향은 유지하고, 한국어 텍스트는 더 또렷하고 크게 보여줘.',
    '새 로고, 워터마크, 불필요한 문구는 추가하지 마.'
  ].join('\n');
}

export function normalizeAnalysisReport(report: Partial<AnalysisReport>): AnalysisReport {
  const options = labels.map((label, index) => {
    const option = report.options?.find((item) => item.label === label);
    return {
      label,
      name: option?.name || label + '안',
      headline: option?.headline || fallbackHeadlines[index],
      subline: option?.subline || '지금 바로 써먹는 실전 팁',
      designDirection: option?.designDirection || '강한 대비, 큰 한글 타이포그래피, 명확한 오브젝트 중심 구성',
      prompt: option?.prompt || label + '안 유튜브 썸네일. 큰 한글 제목, 강한 대비, 모바일에서 읽기 쉬운 구성.'
    };
  });
  return {
    copyStructure: list(report.copyStructure, ['짧은 문제 제기 문장으로 시선을 끈다.', '핵심 키워드를 크게 분리한다.', '결과 기대감을 보조 문구로 만든다.']),
    designStyle: list(report.designStyle, ['고대비 배경과 큰 타이포그래피를 사용한다.', '메인 문구와 보조 오브젝트를 명확히 분리한다.', '모바일에서도 읽히는 단순한 레이아웃을 유지한다.']),
    transferRules: list(report.transferRules, ['문구 구조만 참고하고 원문은 복제하지 않는다.', '색상 대비와 배치 원리만 참고한다.', '새 주제에 맞는 독립적인 썸네일로 만든다.']),
    cautionNotes: list(report.cautionNotes, ['참조 이미지의 로고, 워터마크, 고유 캐릭터는 사용하지 않는다.', '문구를 그대로 베끼지 않는다.']),
    summary: report.summary || '참조 썸네일의 후킹 구조와 디자인 원리를 새 영상 주제에 맞게 재조합한다.',
    options
  };
}

function list(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return cleaned.length > 0 ? cleaned : fallback;
}

import type { AnalysisReport, OptionLabel, ThumbnailOption } from '../types';

const labels: OptionLabel[] = ['A', 'B', 'C'];
const fallbackHeadlines = ['이거 모르면 손해', '조회수 차이 나는 이유', '오늘 바로 써먹기'];

export function buildAnalysisPrompt(topic: string, tone?: string) {
  return [
    '너는 유튜브 썸네일 전문 크리에이티브 디렉터야.',
    '',
    '입력 이미지는 두 장이야.',
    '1번 이미지는 카피 구조만 분석해. 큰 글씨는 메인카피, 작은 보조 글씨는 서브카피로 분리해.',
    '문구를 그대로 베끼지 말고 문장의 뼈대와 A/B/C/D 변수 관계만 추출해.',
    '2번 이미지는 디자인 스타일과 클릭 의도를 분석해. 로고, 캐릭터, 인물, 브랜드 고유 요소는 복제하지 마.',
    '',
    '새 영상 주제: ' + topic,
    '원하는 톤: ' + (tone?.trim() || '똑사장 수강생이 바로 이해하는 실전형'),
    '',
    '구조 분석 예시:',
    '서브카피 원문: 운동하다 빨리 죽습니다!',
    '서브 뼈대: A 하다가 빨리 B 합니다. A=일반적으로 좋은 결과를 위해 열심히 하는 행동, B=피하고 싶은 나쁜 결과.',
    '메인카피 원문: 70대 이상은 절대 하면 안되는 치명적 운동 6가지',
    '메인 뼈대: C는 절대 하면 안 되는 치명적인 D. C=타겟 시청자, D=타겟이 목표를 위해 하려고 하는 행동/방법.',
    '',
    '반드시 한국어 JSON만 반환해. 마크다운 설명은 쓰지 마.',
    '{',
    '  "copyBreakdown": {',
    '    "mainCopy": "1번 이미지에서 가장 큰 글씨",',
    '    "subCopy": "1번 이미지에서 작은 보조 글씨. 없으면 빈 문자열",',
    '    "mainPattern": "메인카피의 문장 뼈대",',
    '    "subPattern": "서브카피의 문장 뼈대. 없으면 빈 문자열",',
    '    "variableMap": ["A=...", "B=...", "C=...", "D=..."],',
    '    "adaptationGuide": ["새 주제에서 A/B/C/D를 무엇으로 바꿀지", "메인/서브카피 치환 논리"]',
    '  },',
    '  "designIntent": {',
    '    "copyEmphasis": ["2번 이미지가 문구를 부각시키는 방식 1", "방식 2"],',
    '    "clickIntent": ["시청자가 디자인에서 눈에 띄어 클릭할 것 같은 이유 1", "이유 2"],',
    '    "visualHierarchy": ["가장 먼저 보이는 요소 → 두 번째 요소 → 마지막 요소"]',
    '  },',
    '  "copyStructure": ["문장 뼈대 분석 1", "문장 뼈대 분석 2", "문장 뼈대 분석 3"],',
    '  "designStyle": ["디자인 스타일 분석 1", "디자인 스타일 분석 2", "디자인 스타일 분석 3"],',
    '  "transferRules": ["새 썸네일에 적용할 규칙 1", "규칙 2", "규칙 3"],',
    '  "cautionNotes": ["그대로 베끼지 않기 위한 주의점 1", "주의점 2"],',
    '  "summary": "분석 요약",',
    '  "options": [',
    '    { "label": "A", "name": "후킹형", "headline": "메인카피", "subline": "서브카피", "designDirection": "디자인 방향", "prompt": "이미지 생성 프롬프트" },',
    '    { "label": "B", "name": "반전형", "headline": "메인카피", "subline": "서브카피", "designDirection": "디자인 방향", "prompt": "이미지 생성 프롬프트" },',
    '    { "label": "C", "name": "실전형", "headline": "메인카피", "subline": "서브카피", "designDirection": "디자인 방향", "prompt": "이미지 생성 프롬프트" }',
    '  ]',
    '}',
    '',
    '프롬프트 작성 규칙:',
    '- 각 옵션의 headline은 메인카피 1개만. 짧고 굵게.',
    '- subline은 최대 1개만. 없으면 빈 문자열로 둬도 돼.',
    '- 이미지 안에는 메인카피와 서브카피 외 작은 설명문, 말풍선, 배경 글자, 경고 라벨, UI 텍스트를 절대 넣지 마.',
    '- 디자인 분석은 문구를 어떻게 부각하는지, 어떤 시각 요소 때문에 클릭하고 싶어지는지까지 설명해.',
    '- 난해해서 의도 파악이 어려운 디자인이면 clickIntent에는 의도 파악 어려움이라고 짧게 써.'
  ].join('\n');
}

export function buildImagePrompt(option: ThumbnailOption, report: AnalysisReport) {
  return [
    'Create an original Korean YouTube thumbnail in 16:9 composition.',
    'Target presentation: 1280x720. Make text crisp, bold, and readable on mobile.',
    '',
    'Main text: ' + option.headline,
    'Sub text: ' + option.subline,
    '',
    'Text discipline, highest priority:',
    '- Render only the exact main text and exact sub text above.',
    '- Do not render any other Korean or English letters anywhere in the image.',
    '- No speech bubbles, no small captions, no UI labels, no warning badges, no background text.',
    '- The main text must be the dominant readable element.',
    '- The sub text is optional and must stay short. If it hurts readability, make it visually secondary or omit it.',
    '',
    'Creative direction: ' + option.designDirection,
    '',
    'Reference copy structure:',
    'Main copy from reference: ' + report.copyBreakdown.mainCopy,
    'Sub copy from reference: ' + (report.copyBreakdown.subCopy || 'none'),
    'Main pattern: ' + report.copyBreakdown.mainPattern,
    'Sub pattern: ' + (report.copyBreakdown.subPattern || 'none'),
    report.copyStructure.map((item) => '- ' + item).join('\n'),
    '',
    'Variable relationship and adaptation:',
    report.copyBreakdown.variableMap.map((item) => '- ' + item).join('\n'),
    report.copyBreakdown.adaptationGuide.map((item) => '- ' + item).join('\n'),
    '',
    'Design style and intent:',
    report.designStyle.map((item) => '- style: ' + item).join('\n'),
    report.designIntent.copyEmphasis.map((item) => '- copy emphasis: ' + item).join('\n'),
    report.designIntent.clickIntent.map((item) => '- click intent: ' + item).join('\n'),
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
    '메인카피와 서브카피 외 새 로고, 워터마크, 작은 설명문, 말풍선 문구는 추가하지 마.'
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
      prompt: option?.prompt || label + '안 유튜브 썸네일. 메인카피 1개와 서브카피 최대 1개만 보이게 구성.'
    };
  });

  return {
    copyBreakdown: {
      mainCopy: text(report.copyBreakdown?.mainCopy, '분석된 메인카피 없음'),
      subCopy: text(report.copyBreakdown?.subCopy, ''),
      mainPattern: text(report.copyBreakdown?.mainPattern, 'C가 반드시 알아야 할 D'),
      subPattern: text(report.copyBreakdown?.subPattern, ''),
      variableMap: list(report.copyBreakdown?.variableMap, ['C=새 영상의 핵심 타겟 시청자', 'D=타겟이 궁금해하거나 피하고 싶은 핵심 행동/결과']),
      adaptationGuide: list(report.copyBreakdown?.adaptationGuide, ['원문 단어는 복제하지 않고 문장 뼈대만 새 주제에 맞게 치환한다.', '메인카피는 짧고 굵게, 서브카피는 한 줄로 제한한다.'])
    },
    designIntent: {
      copyEmphasis: list(report.designIntent?.copyEmphasis, ['문구가 가장 먼저 보이도록 배경과 인물/오브젝트 대비를 만든다.']),
      clickIntent: list(report.designIntent?.clickIntent, ['타겟이 자기 이야기처럼 느끼는 강한 시각 단서를 만든다.']),
      visualHierarchy: list(report.designIntent?.visualHierarchy, ['메인카피 → 핵심 인물/오브젝트 → 서브카피 순서로 보이게 한다.'])
    },
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

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

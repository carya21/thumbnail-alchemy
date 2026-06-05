# 썸네일 알케미

카피 구조용 썸네일 1장과 디자인 스타일용 썸네일 1장을 분석해서 새 유튜브 썸네일 ABC안 3개를 생성하는 웹앱입니다. 선택한 1개 안은 한 번 더 수정할 수 있습니다.

## 실행

```bash
npm install --cache .npm-cache
npm run build
npm run start -- --port 3000
```

## 환경변수

```bash
OPENAI_API_KEY=카리아_OpenAI_API_키
ANALYSIS_MODEL=gpt-5.5
IMAGE_MODEL=gpt-image-2
```

## 배포

Vercel 배포 환경변수에 `OPENAI_API_KEY`를 추가하면 수강생들이 바로 사용할 수 있습니다.

```bash
vercel env add OPENAI_API_KEY production
vercel --prod
```

## MVP 범위

- 단계형 마법사 UI
- 썸네일 2장 업로드
- 카피 구조 분석
- 디자인 스타일 분석
- 새 영상 주제 기반 ABC 썸네일 생성
- 선택안 1회 수정
- 결과 이미지 다운로드

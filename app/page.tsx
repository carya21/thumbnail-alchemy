'use client';

import { useMemo, useState } from 'react';
import type { AnalysisReport, GeneratedOption, OptionLabel } from './types';

type Busy = 'idle' | 'analyzing' | 'generating' | 'revising';

const stepNames = ['입력', '분석', 'ABC안', '수정'];

export default function Home() {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState('');
  const [mainCopy, setMainCopy] = useState('');
  const [subCopy, setSubCopy] = useState('');
  const [designPrompt, setDesignPrompt] = useState('');
  const [copyImage, setCopyImage] = useState('');
  const [designImage, setDesignImage] = useState('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [options, setOptions] = useState<GeneratedOption[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<OptionLabel>('A');
  const [revisionRequest, setRevisionRequest] = useState('글자를 더 크게, 배경은 더 단순하게 수정해 주세요.');
  const [revised, setRevised] = useState<GeneratedOption | null>(null);
  const [busy, setBusy] = useState<Busy>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selected = useMemo(
    () => options.find((item) => item.label === selectedLabel) || options[0],
    [options, selectedLabel]
  );

  const isBusy = busy !== 'idle';

  async function analyze() {
    await run('analyzing', async () => {
      const data = await postJson<{ report: AnalysisReport }>('/api/analyze', {
        topic,
        mainCopy,
        subCopy,
        designPrompt,
        copyImage,
        designImage
      });
      setReport(data.report);
      setOptions([]);
      setRevised(null);
      setStep(1);
      setMessage('분석이 완료되었습니다. 이제 ABC안을 생성하실 수 있습니다.');
    });
  }

  async function generate() {
    if (!report) return;
    await run('generating', async () => {
      const data = await postJson<{ options: GeneratedOption[] }>('/api/generate', { topic, analysis: report });
      setOptions(data.options);
      setSelectedLabel(data.options[0]?.label || 'A');
      setRevised(null);
      setStep(2);
      setMessage('ABC안 생성이 완료되었습니다. 마음에 드는 안을 선택해 주세요.');
    });
  }

  async function revise() {
    if (!selected) return;
    await run('revising', async () => {
      const data = await postJson<{ revised: GeneratedOption }>('/api/revise', { selected, revisionRequest });
      setRevised(data.revised);
      setStep(3);
      setMessage('수정본이 완성되었습니다. 다운로드해서 바로 사용하실 수 있습니다.');
    });
  }

  async function run(nextBusy: Busy, job: () => Promise<void>) {
    setBusy(nextBusy);
    setError('');
    setMessage('');
    try {
      await job();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy('idle');
    }
  }

  const readyToAnalyze = Boolean(topic.trim() && (copyImage || mainCopy.trim()));

  return (
    <main className='shell'>
      <header className='hero'>
        <div>
          <p className='eyebrow'>똑사장 썸네일 제작실</p>
          <h1>썸네일 알케미</h1>
          <p className='lead'>카피 구조와 디자인 스타일을 분리 분석해서 새 썸네일 ABC안을 만들어 드립니다.</p>
        </div>
        <div className='now'>현재 단계<br /><strong>{stepNames[step]}</strong></div>
      </header>

      <section className='workspace'>
        <aside className='rail'>
          {stepNames.map((name, index) => (
            <button key={name} className={step === index ? 'active' : ''} onClick={() => setStep(index)} disabled={isBusy || (index > 1 && options.length === 0)}>
              <span>{index + 1}</span>{name}
            </button>
          ))}
        </aside>

        <div className='panel'>
          {message && <p className='notice'>{message}</p>}
          {error && <p className='error'>{error}</p>}

          {step === 0 && (
            <div className='stack'>
              <div className='field'>
                <label>새 영상 주제</label>
                <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder='만들고 싶은 영상 주제를 입력해 주세요.' />
              </div>

              <section className='inputPanel'>
                <h2>카피 입력</h2>
                <p>카피 구조 이미지를 넣거나, 이미 정해둔 썸네일 문구를 직접 입력하실 수 있습니다.</p>
                <div className='field'>
                  <label>메인카피</label>
                  <em>이미 썸네일로 만들고 싶은 문구를 정하셨다면 이 부분에 적어주세요. 썸네일 분석을 따로 마친 경우라면 아래에 사진을 입력하지 않아도 됩니다.</em>
                  <input value={mainCopy} onChange={(event) => setMainCopy(event.target.value)} placeholder='썸네일에서 가장 크게 보일 문구를 입력해 주세요.' />
                </div>
                <div className='field'>
                  <label>서브카피 (선택)</label>
                  <input value={subCopy} onChange={(event) => setSubCopy(event.target.value)} placeholder='보조 문구가 있다면 입력해 주세요.' />
                </div>
                <Upload title='카피 구조 이미지 (선택)' value={copyImage} onChange={setCopyImage} />
              </section>

              <section className='inputPanel'>
                <h2>디자인 참고</h2>
                <p>참고 이미지를 넣거나 디자인 방향을 글로 설명하실 수 있습니다. 비워두면 주제와 카피에 맞춰 자동으로 구성합니다.</p>
                <div className='field'>
                  <label>디자인 설명 / 이미지 프롬프트 (선택)</label>
                  <textarea value={designPrompt} onChange={(event) => setDesignPrompt(event.target.value)} placeholder='원하시는 분위기, 색감, 인물 배치 등을 자유롭게 적어 주세요.' />
                </div>
                <Upload title='디자인 참고 이미지 (선택)' value={designImage} onChange={setDesignImage} />
              </section>

              <button className='primary' onClick={analyze} disabled={!readyToAnalyze || isBusy}>{isBusy ? '분석 중...' : '분석 시작'}</button>
            </div>
          )}

          {step === 1 && report && (
            <div className='stack'>
              <CopyBreakdown report={report} />
              <DesignIntent report={report} />
              <Report title='카피 구조 요약' items={report.copyStructure} />
              <Report title='디자인 스타일' items={report.designStyle} />
              <Report title='적용 규칙' items={report.transferRules} />
              <Report title='주의점' items={report.cautionNotes} />
              <p className='summary'>{report.summary}</p>
              <button className='primary' onClick={generate} disabled={isBusy}>{isBusy ? '생성 중...' : 'ABC 썸네일 3개 만들기'}</button>
            </div>
          )}

          {step === 2 && options.length > 0 && (
            <div className='stack'>
              <div className='cards'>
                {options.map((option) => (
                  <article key={option.label} className={selectedLabel === option.label ? 'card selected' : 'card'}>
                    <img src={option.imageUrl} alt={option.name} />
                    <h3>{option.label}안 · {option.name}</h3>
                    <p><strong>{option.headline}</strong><br />{option.subline}</p>
                    <button onClick={() => setSelectedLabel(option.label)}>선택</button>
                    <button onClick={() => download(option.imageUrl, 'thumbnail-' + option.label + '.png')}>다운로드</button>
                  </article>
                ))}
              </div>
              <div className='field'>
                <label>선택안 수정 요청</label>
                <textarea value={revisionRequest} onChange={(event) => setRevisionRequest(event.target.value)} />
              </div>
              <button className='primary' onClick={revise} disabled={!selected || isBusy}>{isBusy ? '수정 중...' : selectedLabel + '안 1회 수정'}</button>
            </div>
          )}

          {step === 3 && revised && (
            <div className='stack result'>
              <img src={revised.imageUrl} alt='수정본' />
              <button className='primary' onClick={() => download(revised.imageUrl, 'thumbnail-revised.png')}>수정본 다운로드</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Upload({ title, value, onChange }: { title: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className='upload'>
      <h2>{title}</h2>
      <input type='file' accept='image/png,image/jpeg,image/webp' onChange={(event) => readFile(event.target.files?.[0], onChange)} />
      <div className='preview'>{value ? <img src={value} alt={title} /> : <span>이미지 업로드</span>}</div>
    </div>
  );
}

function CopyBreakdown({ report }: { report: AnalysisReport }) {
  return (
    <section className='insight'>
      <h2>메인/서브카피 구조 해체</h2>
      <div className='copyPair'>
        <div><span>메인카피</span><strong>{report.copyBreakdown.mainCopy}</strong></div>
        <div><span>서브카피</span><strong>{report.copyBreakdown.subCopy || '없음'}</strong></div>
      </div>
      <div className='miniBlock'><span>메인 뼈대</span><p>{report.copyBreakdown.mainPattern}</p></div>
      <div className='miniBlock'><span>서브 뼈대</span><p>{report.copyBreakdown.subPattern || '서브카피 없음'}</p></div>
      <InlineList title='변수 관계' items={report.copyBreakdown.variableMap} />
      <InlineList title='새 주제 치환' items={report.copyBreakdown.adaptationGuide} />
    </section>
  );
}

function DesignIntent({ report }: { report: AnalysisReport }) {
  return (
    <section className='insight'>
      <h2>디자인 클릭 의도</h2>
      <InlineList title='문구 부각 방식' items={report.designIntent.copyEmphasis} />
      <InlineList title='클릭 유도 포인트' items={report.designIntent.clickIntent} />
      <InlineList title='시선 순서' items={report.designIntent.visualHierarchy} />
    </section>
  );
}

function InlineList({ title, items }: { title: string; items: string[] }) {
  return <div className='inlineList'><span>{title}</span><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function Report({ title, items }: { title: string; items: string[] }) {
  return <section className='report'><h2>{title}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

function readFile(file: File | undefined, onChange: (value: string) => void) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onChange(String(reader.result || ''));
  reader.readAsDataURL(file);
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '요청 처리 중 문제가 생겼습니다.');
  return data;
}

function download(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

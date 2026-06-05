'use client';

import { useMemo, useState } from 'react';
import type { AnalysisReport, GeneratedOption, OptionLabel } from './types';

type Busy = 'idle' | 'analyzing' | 'generating' | 'revising';

const stepNames = ['입력', '분석', 'ABC안', '수정'];

export default function Home() {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('초보자도 바로 따라 하는 실전형');
  const [copyImage, setCopyImage] = useState('');
  const [designImage, setDesignImage] = useState('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [options, setOptions] = useState<GeneratedOption[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<OptionLabel>('A');
  const [revisionRequest, setRevisionRequest] = useState('글자를 더 크게, 배경은 더 단순하게');
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
      const data = await postJson<{ report: AnalysisReport }>('/api/analyze', { topic, tone, copyImage, designImage });
      setReport(data.report);
      setOptions([]);
      setRevised(null);
      setStep(1);
      setMessage('분석 완료. 이제 ABC안을 만들면 돼.');
    });
  }

  async function generate() {
    if (!report) return;
    await run('generating', async () => {
      const data = await postJson<{ options: GeneratedOption[] }>('/api/generate', { topic, tone, analysis: report });
      setOptions(data.options);
      setSelectedLabel(data.options[0]?.label || 'A');
      setRevised(null);
      setStep(2);
      setMessage('ABC안 생성 완료. 마음에 드는 안을 골라줘.');
    });
  }

  async function revise() {
    if (!selected) return;
    await run('revising', async () => {
      const data = await postJson<{ revised: GeneratedOption }>('/api/revise', { selected, revisionRequest });
      setRevised(data.revised);
      setStep(3);
      setMessage('수정본 완성. 다운로드해서 바로 쓰면 돼.');
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

  const readyToAnalyze = Boolean(topic.trim() && copyImage && designImage);

  return (
    <main className='shell'>
      <header className='hero'>
        <div>
          <p className='eyebrow'>똑사장 썸네일 제작실</p>
          <h1>썸네일 알케미</h1>
          <p className='lead'>카피 구조와 디자인 스타일을 분리 분석해서 새 썸네일 ABC안을 만들어.</p>
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
                <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder='예: AI 쇼츠 자동화 처음 시작하는 법' />
              </div>
              <div className='field'>
                <label>원하는 톤</label>
                <input value={tone} onChange={(event) => setTone(event.target.value)} />
              </div>
              <div className='uploadGrid'>
                <Upload title='카피 구조용 썸네일' value={copyImage} onChange={setCopyImage} />
                <Upload title='디자인 벤치마킹용 썸네일' value={designImage} onChange={setDesignImage} />
              </div>
              <button className='primary' onClick={analyze} disabled={!readyToAnalyze || isBusy}>{isBusy ? '분석 중...' : '카피 + 디자인 분석'}</button>
            </div>
          )}

          {step === 1 && report && (
            <div className='stack'>
              <Report title='카피 구조' items={report.copyStructure} />
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
  if (!response.ok) throw new Error(data.error || '요청 처리 중 문제가 생겼어.');
  return data;
}

function download(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}

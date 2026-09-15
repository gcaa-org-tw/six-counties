import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SignBoard from './SignBoard';
import { DEMO_CANDIDATES } from '../data/demo';

describe('候選人簽署看板（9/28 截止前）', () => {
  const markup = renderToStaticMarkup(
    <SignBoard state="ready" candidates={DEMO_CANDIDATES} onRetry={() => {}} />,
  );

  it('保留區塊 id 與標題', () => {
    expect(markup).toContain('id="board"');
    expect(markup).toContain('候選人簽署看板');
  });

  it('只顯示截止公告，不顯示候選人卡片與縣市篩選', () => {
    expect(markup).toContain('候選人簽署至 9/28 截止，完整簽署結果將於截止後公開。');
    expect(markup).not.toContain('role="tablist"');
    expect(markup).not.toContain(DEMO_CANDIDATES[0].name);
  });
});

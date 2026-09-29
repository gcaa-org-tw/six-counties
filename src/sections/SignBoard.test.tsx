import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SignBoard from './SignBoard';
import { DEMO_CANDIDATES } from '../data/demo';

describe('候選人簽署看板', () => {
  const markup = renderToStaticMarkup(
    <SignBoard state="ready" candidates={DEMO_CANDIDATES} onRetry={() => {}} />,
  );

  it('顯示縣市篩選與候選人卡片，不再顯示截止公告', () => {
    expect(markup).toContain('id="board"');
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain(DEMO_CANDIDATES[0].name);
    expect(markup).not.toContain('9/28 截止');
  });
});

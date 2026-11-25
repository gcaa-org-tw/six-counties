import { describe, expect, it } from 'vitest';
import { isHttpsUrl, safeImageUrl } from './url';

describe('isHttpsUrl', () => {
  it('只接受 https 網址', () => {
    expect(isHttpsUrl('https://gcaa.org.tw/16551/')).toBe(true);
    expect(isHttpsUrl('http://gcaa.org.tw/16551/')).toBe(false);
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpsUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isHttpsUrl('/images/candidates/guo-xi.jpg')).toBe(false);
    expect(isHttpsUrl('')).toBe(false);
  });
});

describe('safeImageUrl', () => {
  it('https 網址與網站內 /images/ 路徑照用，其他一律當成沒有圖', () => {
    expect(safeImageUrl('https://gcaa.org.tw/a.jpg')).toBe('https://gcaa.org.tw/a.jpg');
    expect(safeImageUrl('/images/candidates/guo-xi.jpg')).toBe('/images/candidates/guo-xi.jpg');
    expect(safeImageUrl('https://six-cities.gcaa.org.tw/images/news/20261124-tcan-policy-review.webp')).toBe(
      'https://six-cities.gcaa.org.tw/images/news/20261124-tcan-policy-review.webp',
    );
    expect(safeImageUrl('http://example.com/a.jpg')).toBe('');
    expect(safeImageUrl('javascript:alert(1)')).toBe('');
    expect(safeImageUrl('data:image/svg+xml,<svg></svg>')).toBe('');
    expect(safeImageUrl('//example.com/a.jpg')).toBe('');
    expect(safeImageUrl('photo.jpg')).toBe('');
    expect(safeImageUrl('')).toBe('');
  });
});

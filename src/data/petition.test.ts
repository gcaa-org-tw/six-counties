import { describe, it, expect } from 'vitest';
import { ENDORSING_GROUPS, INDIVIDUAL_COUNT_SNAPSHOT } from '../content/orgs';
import {
  FALLBACK_PETITION_STATS,
  PLACEHOLDER_MESSAGES,
  parsePetitionResponse,
  validatePetition,
  maskName,
  type PetitionPayload,
} from './petition';

function payload(overrides: Partial<PetitionPayload> = {}): PetitionPayload {
  return {
    kind: 'individual',
    name: '王小明',
    email: 'test@example.com',
    city: '臺北市',
    message: '',
    consentPublic: false,
    website: '',
    ...overrides,
  };
}

describe('validatePetition', () => {
  it('完整填寫回傳 null', () => {
    expect(validatePetition(payload())).toBeNull();
  });

  it('honeypot 有值時擋下', () => {
    expect(validatePetition(payload({ website: 'http://spam.example' }))).toBe('送出失敗，請再試一次');
  });

  it('姓名空白時要求填寫', () => {
    expect(validatePetition(payload({ name: '' }))).toBe('請填寫姓名或團體名稱');
  });

  it('Email 格式錯誤時要求有效 Email', () => {
    expect(validatePetition(payload({ email: 'abc' }))).toBe('請填寫有效的 Email');
  });

  it('縣市空白時要求選擇', () => {
    expect(validatePetition(payload({ city: '' }))).toBe('請選擇居住縣市');
  });
});

describe('maskName', () => {
  it('三字遮第二字', () => {
    expect(maskName('王小明')).toBe('王○明');
  });

  it('兩字遮第二字', () => {
    expect(maskName('王明')).toBe('王○');
  });

  it('單字照留', () => {
    expect(maskName('王')).toBe('王');
  });

  it('四字遮第二字', () => {
    expect(maskName('歐陽小明')).toBe('歐○小明');
  });
});

describe('連署統計', () => {
  it('未接 Apps Script 時使用已確認的連署團體名單與人數快照', () => {
    expect(FALLBACK_PETITION_STATS.groupNames).toEqual(ENDORSING_GROUPS);
    expect(FALLBACK_PETITION_STATS.groupCount).toBe(ENDORSING_GROUPS.length);
    expect(ENDORSING_GROUPS).toHaveLength(7);
    expect(FALLBACK_PETITION_STATS.individualCount).toBe(INDIVIDUAL_COUNT_SNAPSHOT);
    expect(FALLBACK_PETITION_STATS.publicMessages).toHaveLength(6);
  });

  it('Apps Script 回傳的名單與意見照用，沒有公開意見時改用樣板', () => {
    const live = parsePetitionResponse({
      ok: true,
      individualCount: 7,
      groupCount: 2,
      groupNames: ['甲', '乙'],
      publicMessages: [{ name: '連署公民', message: '真實意見' }],
    });
    expect(live.individualCount).toBe(7);
    expect(live.groupNames).toEqual(['甲', '乙']);
    expect(live.publicMessages).toEqual([{ name: '連署公民', message: '真實意見' }]);

    const empty = parsePetitionResponse({ ok: true, individualCount: 0, groupCount: 0, groupNames: [], publicMessages: [] });
    expect(empty.publicMessages).toBe(PLACEHOLDER_MESSAGES);
  });

  it('回應非 ok 時視為讀取失敗', () => {
    expect(() => parsePetitionResponse({ ok: false })).toThrow('讀取連署資料失敗');
  });

  it('人數不是有限的非負數字、名單或意見不是陣列時視為讀取失敗', () => {
    const valid = { ok: true, individualCount: 1, groupCount: 1, groupNames: ['甲'], publicMessages: [] };
    expect(() => parsePetitionResponse({ ...valid, ok: 'true' })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, individualCount: '7' })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, individualCount: -1 })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, groupCount: Number.NaN })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, groupCount: Number.POSITIVE_INFINITY })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, individualCount: undefined })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, groupNames: '甲' })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, groupNames: undefined })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, publicMessages: { name: '甲', message: '乙' } })).toThrow('讀取連署資料失敗');
    expect(() => parsePetitionResponse({ ...valid, publicMessages: null })).toThrow('讀取連署資料失敗');
  });

  it('名單只留字串，意見只留姓名與內容都是字串的項目', () => {
    const stats = parsePetitionResponse({
      ok: true,
      individualCount: 3,
      groupCount: 2,
      groupNames: ['甲', 7, null, { name: '乙' }, '丙'],
      publicMessages: [
        { name: '王○明', message: '保留' },
        { name: 1, message: '姓名不是字串' },
        { name: '李○華' },
        null,
        '字串',
      ],
    });
    expect(stats.groupNames).toEqual(['甲', '丙']);
    expect(stats.publicMessages).toEqual([{ name: '王○明', message: '保留' }]);
  });
});

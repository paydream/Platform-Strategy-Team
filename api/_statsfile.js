// 통계 데이터 파일 저장소 — 저장소가 공개라 수치는 AES-256-GCM으로 암호화해 data/stats/<id>.enc.json 에 둔다.
// 암호화 키는 Vercel 환경변수 STATS_UPDATE_KEY에서 만든다(코드·저장소에는 키가 없음).
// meta(업데이트 날짜·기간)만 평문이라 목록(GET)에서 비밀번호 없이 보여줄 수 있다.
const crypto = require('crypto');
const L = require('./_lib');

const pathOf = id => `data/stats/${id}.enc.json`;
const keyOf = () => crypto.createHash('sha256').update('pst-stats-data:' + (process.env.STATS_UPDATE_KEY || '')).digest();

function seal(data, meta) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', keyOf(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(data), 'utf8'), c.final()]);
  return { v: 1, meta, iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: enc.toString('base64') };
}
function open(file) {
  const d = crypto.createDecipheriv('aes-256-gcm', keyOf(), Buffer.from(file.iv, 'base64'));
  d.setAuthTag(Buffer.from(file.tag, 'base64'));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(file.data, 'base64')), d.final()]).toString('utf8'));
}

// 같은 인스턴스 안에서 잠깐 캐시(GitHub 호출 줄이기). 갱신 직후에는 write가 캐시를 바꿔 둔다.
const cache = new Map();
const TTL = 60 * 1000;
async function readFile(id) {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.t < TTL) return hit.f;
  if (!process.env.GITHUB_TOKEN) return null;
  const r = await L.readJson(pathOf(id), null);
  const f = r.data ? { ...r.data, sha: r.sha } : null;
  cache.set(id, { t: Date.now(), f });
  return f;
}
async function readMeta(id) { const f = await readFile(id); return f ? f.meta : null; }
async function readData(id) { const f = await readFile(id); return f ? open(f) : null; }
async function writeData(id, data, meta) {
  const body = seal(data, meta);
  for (let a = 0; a < 3; a++) {
    const cur = await L.readJson(pathOf(id), null);
    try {
      const sha = await L.writeJson(pathOf(id), body, cur.sha, `통계 자동 갱신: ${id} ${meta.range ? meta.range.end : ''}`.trim());
      cache.set(id, { t: Date.now(), f: { ...body, sha } });
      return sha;
    } catch (e) { if (a === 2 || (e.status !== 409 && e.status !== 422)) throw e; }
  }
}
module.exports = { readMeta, readData, writeData, pathOf, seal, open };

/* 아카이브 데이터 규칙 — 관리자 페이지(브라우저)와 서버 API가 같이 씀
   구조: projects[] > versions[] > items[]
   - project: { id, title, team('design'|'planning'), category, desc, created, updated, hidden, final, versions }
   - version: { id, label, title, desc, created, folder, preview, hidden, items:[{label, href}] }
   - final  : null 또는 { version: 버전id, href: 시안경로 또는 null }   ← 최종안 표시
   - trash  : [{ type:'version', projectId, deleted, version } | { type:'project', deleted, project }]
   덮어쓰기 금지: 한 번 만든 버전의 folder·preview·시안 경로는 절대 못 바꿈. 지우는 건 trash로 옮기기만 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ArchiveModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const TEAMS = { design: '디자인', planning: '기획' };
  const FOLDER_RE = /^archive\/\d{8}-\d{6}-[a-z0-9-]{1,60}$/;

  function todayKST() {
    return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '.');
  }

  // 모든 버전(목록 + 휴지통)을 id → 버전 으로 모음
  function allVersions(data) {
    const map = new Map();
    for (const p of data.projects || []) for (const v of p.versions || []) map.set(v.id, v);
    for (const t of data.trash || []) {
      if (t.type === 'version' && t.version) map.set(t.version.id, t.version);
      if (t.type === 'project' && t.project) for (const v of t.project.versions || []) map.set(v.id, v);
    }
    return map;
  }
  const pathKey = v => [v.folder, v.preview, ...(v.items || []).map(i => i.href)].join('\n');

  // 저장 전 검사: 문제 있으면 한국어 문장, 없으면 null
  function checkSave(oldData, newData) {
    if (!newData || !Array.isArray(newData.projects)) return '목록 형식이 올바르지 않습니다.';
    if (newData.trash != null && !Array.isArray(newData.trash)) return '목록 형식이 올바르지 않습니다.';
    const before = allVersions(oldData), after = allVersions(newData);
    for (const [id, v] of before) {
      const n = after.get(id);
      if (!n) return `"${v.title || v.label}" 버전 기록이 사라졌습니다. 새로고침 후 다시 해 주세요.`;
      if (pathKey(n) !== pathKey(v)) return `"${v.title || v.label}" 버전의 폴더·시안 경로는 바꿀 수 없습니다.`;
    }
    for (const id of after.keys()) if (!before.has(id)) return '여기서는 버전을 새로 만들 수 없습니다. 새 시안은 "새 시안 올리기"에서 올려 주세요.';
    const ids = new Set();
    const projs = [...newData.projects, ...(newData.trash || []).filter(t => t.type === 'project').map(t => t.project)];
    for (const p of projs) {
      if (!p || !p.id || ids.has(p.id)) return '프로젝트 ID가 비었거나 겹칩니다.';
      ids.add(p.id);
      if (p.team && !TEAMS[p.team]) return '팀은 디자인 또는 기획만 고를 수 있습니다.';
      for (const k of ['title', 'desc', 'category', 'created', 'updated'])
        if (p[k] != null && (typeof p[k] !== 'string' || p[k].length > 2000)) return '글자 항목 형식이 올바르지 않습니다.';
      for (const v of p.versions || [])
        for (const k of ['label', 'title', 'desc'])
          if (v[k] != null && (typeof v[k] !== 'string' || v[k].length > 2000)) return '글자 항목 형식이 올바르지 않습니다.';
      if (p.final && !(p.versions || []).some(v => v.id === p.final.version)) p.final = null;
    }
    return null;
  }

  // 새 시안 올리기: 새 프로젝트 또는 기존 프로젝트의 새 버전으로 추가. 바뀐 data를 돌려줌
  // up = { folder, projectId?, project?:{title,team,category,desc}, version:{label,title,desc,created,preview,items} }
  function addUpload(data, up) {
    if (!FOLDER_RE.test(up.folder || '')) throw new Error('폴더 이름 형식이 올바르지 않습니다.');
    const vid = up.folder.slice('archive/'.length);
    if (allVersions(data).has(vid)) throw new Error('같은 버전이 이미 있습니다. 덮어쓰지 않고 멈췄습니다.');
    const s = (x, n) => (typeof x === 'string' ? x.trim() : '').slice(0, n);
    const inFolder = h => typeof h === 'string' && h.startsWith(up.folder + '/') && !h.includes('..');
    const items = (up.version.items || []).filter(i => inFolder(i.href)).map(i => ({ label: s(i.label, 100) || '시안', href: i.href }));
    if (!items.length) throw new Error('시안 버튼이 하나도 없습니다.');
    const today = todayKST();
    let p;
    if (up.projectId) {
      p = data.projects.find(x => x.id === up.projectId);
      if (!p) throw new Error('고른 프로젝트를 찾지 못했습니다. 새로고침 후 다시 해 주세요.');
    } else {
      const team = TEAMS[up.project && up.project.team] ? up.project.team : 'design';
      p = { id: vid, title: s(up.project && up.project.title, 200) || '제목 없음', team, category: s(up.project && up.project.category, 50) || '기타',
            desc: s(up.project && up.project.desc, 2000), created: s(up.version.created, 20) || today, updated: today, hidden: false, final: null, versions: [] };
      data.projects.unshift(p);
    }
    const n = p.versions.length + 1;
    p.versions.push({
      id: vid, label: s(up.version.label, 50) || `v${n}`, title: s(up.version.title, 200) || p.title, desc: s(up.version.desc, 2000),
      created: s(up.version.created, 20) || today, folder: up.folder, preview: inFolder(up.version.preview) ? up.version.preview : items[0].href,
      hidden: false, items,
    });
    p.updated = today;
    // 새 버전이 올라온 프로젝트는 맨 위로
    data.projects = [p, ...data.projects.filter(x => x !== p)];
    return data;
  }

  return { TEAMS, FOLDER_RE, todayKST, allVersions, checkSave, addUpload };
});

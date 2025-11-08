export const provider = "local";

function _key(path){ return `mc_${path}`; }

function _readAll(path){
  const raw = localStorage.getItem(_key(path));
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function _writeAll(path, arr){
  localStorage.setItem(_key(path), JSON.stringify(arr));
}
function _genId(){ return Math.random().toString(36).slice(2, 10); }

export async function listDocs(path, opts={}){
  const arr = _readAll(path);
  if (opts.orderBy){
    arr.sort((a,b) => {
      const dir = (opts.dir || "asc").toLowerCase() === "desc" ? -1 : 1;
      const av = a[opts.orderBy]; const bv = b[opts.orderBy];
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
    });
  }
  return arr;
}

export async function createDoc(path, data){
  const arr = _readAll(path);
  const id = _genId();
  const now = new Date().toISOString();
  arr.push({ id, ...data, createdAt: now, updatedAt: now });
  _writeAll(path, arr);
  return id;
}

export async function readDoc(path, id){
  const arr = _readAll(path);
  return arr.find(x => x.id === id) || null;
}

export async function updateDocById(path, id, data){
  const arr = _readAll(path);
  const now = new Date().toISOString();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0){
    arr[i] = { ...arr[i], ...data, updatedAt: now };
    _writeAll(path, arr);
  }
}

export async function deleteDocById(path, id){
  const arr = _readAll(path).filter(x => x.id !== id);
  _writeAll(path, arr);
}

export async function ensureSeed(path, items){
  const arr = _readAll(path);
  if (arr.length) return false;
  const now = new Date().toISOString();
  const seeded = items.map(it => ({ id: _genId(), ...it, createdAt: now, updatedAt: now }));
  _writeAll(path, seeded);
  return true;
}

export async function bulkCreate(dataset){
  for (const [path, arr] of Object.entries(dataset)){
    for (const item of arr){
      const now = new Date().toISOString();
      const id = _genId();
      const cleaned = { ...item };
      delete cleaned.id;
      _writeAll(path, [..._readAll(path), { id, ...cleaned, createdAt: now, updatedAt: now }]);
    }
  }
}

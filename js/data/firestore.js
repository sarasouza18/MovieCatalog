import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const db = window._services.db;
export const provider = "firebase";

export async function listDocs(path, opts={}){
  const coll = collection(db, path);
  let q = coll;
  if (opts.orderBy){ q = query(coll, orderBy(opts.orderBy, opts.dir || "asc")); }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createDoc(path, data){
  const coll = collection(db, path);
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(coll, payload);
  return ref.id;
}

export async function readDoc(path, id){
  const ref = doc(db, path, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateDocById(path, id, data){
  const ref = doc(db, path, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocById(path, id){
  const ref = doc(db, path, id);
  await deleteDoc(ref);
}

export async function ensureSeed(path, items){
  const list = await listDocs(path);
  if (list.length) return false;
  for (const it of items) await createDoc(path, it);
  return true;
}

export async function bulkCreate(dataset){
  for (const [path, arr] of Object.entries(dataset)){
    for (const item of arr){
      const { id, ...data } = item;
      await createDoc(path, data);
    }
  }
}

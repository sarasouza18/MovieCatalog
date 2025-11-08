export const mode = window._services?.mode || "local";

let api;
try {
  if (mode === "firebase") {
    api = await import("./data/firestore.js");
  }
} catch (e){
  console.warn("Falha ao carregar Firestore, usando modo local:", e);
}
if (!api){
  api = await import("./data/local.js");
}

export const { listDocs, createDoc, readDoc, updateDocById, deleteDocById, ensureSeed, bulkCreate } = api;
export const provider = api.provider;

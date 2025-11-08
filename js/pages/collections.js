import { listDocs, createDoc, updateDocById, deleteDocById } from "../db.js";
import { formToObj, emptyState } from "../ui.js";

const PATH = "collections";

function row(c){
  const items = (c.items || []).join(", ");
  return `
  <tr>
    <td>${c.name}</td>
    <td class="text-muted small">${items}</td>
    <td class="text-end">
      <button class="btn btn-sm btn-outline-secondary" data-edit="${c.id}">Editar</button>
      <button class="btn btn-sm btn-outline-danger" data-del="${c.id}">Excluir</button>
    </td>
  </tr>`;
}

function form(c={}, movies=[]){
  const opts = movies.map(m => `<option value="${m.title}" ${Array.isArray(c.items) && c.items.includes(m.title) ? 'selected' : ''}>${m.title}</option>`).join("");
  return `
  <form id="collectionForm" class="form-section mt-3">
    <input type="hidden" name="id" value="${c.id || ""}">
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Nome da Coleção</label>
        <input name="name" class="form-control" required value="${c.name || ""}" placeholder="Assistir mais tarde, Favoritos...">
      </div>
      <div class="col-md-8">
        <label class="form-label">Filmes (existentes)</label>
        <select name="items" id="moviesSelect" class="form-select" multiple size="6">${opts}</select>
        <div class="form-text">Selecione apenas filmes existentes.</div>
      </div>
    </div>
    <div class="mt-3 d-flex gap-2">
      <button class="btn btn-primary" type="submit">${c.id ? "Salvar" : "Cadastrar"}</button>
      <button class="btn btn-outline-secondary" type="button" id="cancelEdit">Cancelar</button>
    </div>
  </form>`;
}

export async function renderCollectionsPage(){
  const host = document.getElementById("app");
  const movies = await listDocs("movies", { orderBy: "title" });
  host.innerHTML = `
    <div class="d-flex justify-content-between align-items-end">
      <div>
        <h1 class="h3 mb-0">Coleções</h1>
        <small class="text-muted">Conjunto de filmes existentes</small>
      </div>
      <button id="btnNew" class="btn btn-primary">+ Nova Coleção</button>
    </div>
    <div id="formHost"></div>
    <div class="table-responsive mt-2">
      <table class="table table-hover align-middle">
        <thead><tr><th>Nome</th><th>Filmes</th><th class="text-end">Ações</th></tr></thead>
        <tbody id="grid"></tbody>
      </table>
    </div>
  `;

  const grid = document.getElementById("grid");
  const formHost = document.getElementById("formHost");

  async function refresh(){
    const data = await listDocs(PATH, { orderBy: "name" });
    grid.innerHTML = data.length ? data.map(row).join("") : `<tr><td colspan="3">${emptyState("Nenhuma coleção", "Cadastre e selecione filmes existentes.")}</td></tr>`;
    grid.dataset.json = JSON.stringify(data);
  }
  await refresh();

  document.getElementById("btnNew").addEventListener("click", () => {
    formHost.innerHTML = form({}, movies);
    bindForm(refresh);
  });

  grid.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-del");
    const edit = e.target.getAttribute("data-edit");
    const data = JSON.parse(grid.dataset.json || "[]");
    if (id){
      if (confirm("Excluir esta coleção?")){
        await deleteDocById(PATH, id);
        await refresh();
      }
    }
    if (edit){
      const c = data.find(x => x.id === edit);
      formHost.innerHTML = form(c, movies);
      bindForm(refresh);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  function bindForm(refresh){
    const f = document.getElementById("collectionForm");
    document.getElementById("cancelEdit").addEventListener("click", () => formHost.innerHTML = "");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const obj = formToObj(f);
      obj.items = Array.from(document.getElementById("moviesSelect").selectedOptions).map(o => o.value);
      try {
        if (obj.id){ const id = obj.id; delete obj.id; await updateDocById(PATH, id, obj); }
        else { delete obj.id; await createDoc(PATH, obj); }
        formHost.innerHTML = "";
        await refresh();
      } catch (err){
        alert(err.message);
      }
    });
  }
}

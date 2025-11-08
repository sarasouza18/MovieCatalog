import { listDocs, createDoc, updateDocById, deleteDocById } from "../db.js";
import { formToObj, emptyState } from "../ui.js";

const PATH = "genres";

function row(g){
  return `
    <tr>
      <td>${g.name}</td>
      <td class="text-muted small">${g.description || ""}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary" data-edit="${g.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-del="${g.id}">Excluir</button>
      </td>
    </tr>`;
}

function form(g={}){
  return `
  <form id="genreForm" class="form-section mt-3">
    <input type="hidden" name="id" value="${g.id || ""}">
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Nome</label>
        <input name="name" class="form-control" required value="${g.name || ""}">
      </div>
      <div class="col-md-8">
        <label class="form-label">Descrição</label>
        <input name="description" class="form-control" value="${g.description || ""}">
      </div>
    </div>
    <div class="mt-3 d-flex gap-2">
      <button class="btn btn-primary" type="submit">${g.id ? "Salvar" : "Cadastrar"}</button>
      <button class="btn btn-outline-secondary" type="button" id="cancelEdit">Cancelar</button>
    </div>
  </form>`;
}

export async function renderGenresPage(){
  const host = document.getElementById("app");
  host.innerHTML = `
    <div class="d-flex justify-content-between align-items-end">
      <div>
        <h1 class="h3 mb-0">Gêneros</h1>
      </div>
      <button id="btnNew" class="btn btn-primary">+ Novo Gênero</button>
    </div>
    <div id="formHost"></div>
    <div class="table-responsive mt-2">
      <table class="table table-hover align-middle">
        <thead><tr><th>Nome</th><th>Descrição</th><th class="text-end">Ações</th></tr></thead>
        <tbody id="grid"></tbody>
      </table>
    </div>
  `;

  const grid = document.getElementById("grid");
  const formHost = document.getElementById("formHost");

  async function refresh(){
    const data = await listDocs(PATH, { orderBy: "name" });
    grid.innerHTML = data.length ? data.map(row).join("") : `<tr><td colspan="3">${emptyState()}</td></tr>`;
    grid.dataset.json = JSON.stringify(data); // stash
  }
  await refresh();

  document.getElementById("btnNew").addEventListener("click", () => {
    formHost.innerHTML = form();
    bindForm(refresh);
  });

  grid.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-del");
    const edit = e.target.getAttribute("data-edit");
    const data = JSON.parse(grid.dataset.json || "[]");
    if (id){
      if (confirm("Excluir este gênero?")){
        await deleteDocById(PATH, id);
        await refresh();
      }
    }
    if (edit){
      const g = data.find(x => x.id === edit);
      formHost.innerHTML = form(g);
      bindForm(refresh);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  function bindForm(refresh){
    const f = document.getElementById("genreForm");
    document.getElementById("cancelEdit").addEventListener("click", () => formHost.innerHTML = "");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const obj = formToObj(f);
      try {
        if (obj.id){
          const id = obj.id; delete obj.id;
          await updateDocById(PATH, id, obj);
        } else {
          delete obj.id;
          await createDoc(PATH, obj);
        }
        formHost.innerHTML = "";
        await refresh();
      } catch (err){
        alert(err.message);
      }
    });
  }
}

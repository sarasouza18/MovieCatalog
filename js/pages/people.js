import { listDocs, createDoc, updateDocById, deleteDocById } from "../db.js";
import { formToObj, emptyState } from "../ui.js";

const PATH = "people";

function card(p){
  return `
  <div class="col">
    <div class="card h-100 shadow-sm">
      <div class="d-flex align-items-center p-3">
        <img src="${p.photo || 'https://placehold.co/96x96?text=+'}" class="rounded-circle me-3" width="64" height="64" alt="${p.name}">
        <div>
          <h6 class="mb-0">${p.name}</h6>
          <small class="text-muted">${p.role || ""}</small>
        </div>
      </div>
      <div class="card-body pt-0">
        <p class="small text-muted">${p.bio || ""}</p>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-sm btn-outline-secondary" data-edit="${p.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-del="${p.id}">Excluir</button>
        </div>
      </div>
    </div>
  </div>`;
}

function form(p={}){
  return `
  <form id="personForm" class="form-section mt-3">
    <input type="hidden" name="id" value="${p.id || ""}">
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Nome</label>
        <input name="name" class="form-control" required value="${p.name || ""}">
      </div>
      <div class="col-md-4">
        <label class="form-label">Função</label>
        <input name="role" class="form-control" placeholder="Ator, Diretora..." value="${p.role || ""}">
      </div>
      <div class="col-md-4">
        <label class="form-label">Foto (URL)</label>
        <input name="photo" type="url" class="form-control" value="${p.photo || ""}">
      </div>
      <div class="col-12">
        <label class="form-label">Bio</label>
        <textarea name="bio" class="form-control" rows="2">${p.bio || ""}</textarea>
      </div>
    </div>
    <div class="mt-3 d-flex gap-2">
      <button class="btn btn-primary" type="submit">${p.id ? "Salvar" : "Cadastrar"}</button>
      <button class="btn btn-outline-secondary" type="button" id="cancelEdit">Cancelar</button>
    </div>
  </form>`;
}

export async function renderPeoplePage(){
  const host = document.getElementById("app");
  host.innerHTML = `
    <div class="d-flex justify-content-between align-items-end">
      <div>
        <h1 class="h3 mb-0">Pessoas</h1>
        <small class="text-muted">Atores, Diretoras, Roteiristas...</small>
      </div>
      <button id="btnNew" class="btn btn-primary">+ Nova Pessoa</button>
    </div>
    <div id="formHost"></div>
    <div id="grid" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mt-1"></div>
  `;

  const grid = document.getElementById("grid");
  const formHost = document.getElementById("formHost");

  async function refresh(){
    const data = await listDocs(PATH, { orderBy: "name" });
    grid.innerHTML = data.length ? data.map(card).join("") : emptyState("Nenhuma pessoa");
    grid.dataset.json = JSON.stringify(data);
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
      if (confirm("Excluir esta pessoa?")){
        await deleteDocById(PATH, id);
        await refresh();
      }
    }
    if (edit){
      const p = data.find(x => x.id === edit);
      formHost.innerHTML = form(p);
      bindForm(refresh);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  function bindForm(refresh){
    const f = document.getElementById("personForm");
    document.getElementById("cancelEdit").addEventListener("click", () => formHost.innerHTML = "");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const obj = formToObj(f);
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

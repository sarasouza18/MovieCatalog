import { listDocs, createDoc, updateDocById, deleteDocById } from "../db.js";
import { formToObj, emptyState } from "../ui.js";

const PATH = "reviews";

function row(r){
  return `
    <tr>
      <td>${r.movieTitle || "—"}</td>
      <td>${r.personName || "—"}</td>
      <td>${r.score ?? "—"}</td>
      <td class="text-muted small">${r.comment || ""}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary" data-edit="${r.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-del="${r.id}">Excluir</button>
      </td>
    </tr>`;
}

function form(r={}, movies=[], people=[]){
  const movieOpts = movies.map(m => `<option value="${m.title}" ${m.title===r.movieTitle ? 'selected':''}>${m.title}</option>`).join("");
  const personOpts = people.map(p => `<option value="${p.name}" ${p.name===r.personName ? 'selected':''}>${p.name}</option>`).join("");
  return `
  <form id="reviewForm" class="form-section mt-3">
    <input type="hidden" name="id" value="${r.id || ""}">
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label">Filme (existente)</label>
        <select name="movieTitle" id="movieSelect" class="form-select" required>
          <option value="">Escolher...</option>
          ${movieOpts}
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Pessoa (existente)</label>
        <select name="personName" id="personSelect" class="form-select" required>
          <option value="">Escolher...</option>
          ${personOpts}
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label">Nota</label>
        <input name="score" type="number" min="0" max="10" step="0.1" class="form-control" value="${r.score ?? ""}">
      </div>
      <div class="col-12">
        <label class="form-label">Comentário</label>
        <textarea name="comment" class="form-control" rows="2">${r.comment || ""}</textarea>
      </div>
    </div>
    <div class="mt-3 d-flex gap-2">
      <button class="btn btn-primary" type="submit">${r.id ? "Salvar" : "Cadastrar"}</button>
      <button class="btn btn-outline-secondary" type="button" id="cancelEdit">Cancelar</button>
    </div>
  </form>`;
}

export async function renderReviewsPage(){
  const host = document.getElementById("app");
  host.innerHTML = `
    <div class="d-flex justify-content-between align-items-end">
      <div>
        <h1 class="h3 mb-0">Reviews</h1>
        <small class="text-muted">Pessoa avalia Filme existente</small>
      </div>
      <button id="btnNew" class="btn btn-primary">+ Nova Review</button>
    </div>
    <div id="formHost"></div>
    <div class="table-responsive mt-2">
      <table class="table table-hover align-middle">
        <thead><tr><th>Filme</th><th>Pessoa</th><th>Nota</th><th>Comentário</th><th class="text-end">Ações</th></tr></thead>
        <tbody id="grid"></tbody>
      </table>
    </div>
  `;

  const grid = document.getElementById("grid");
  const formHost = document.getElementById("formHost");

  const [movies, people] = await Promise.all([
    listDocs("movies", { orderBy: "title" }),
    listDocs("people", { orderBy: "name" }),
  ]);

  async function refresh(){
    const data = await listDocs(PATH, { orderBy: "movieTitle" });
    grid.innerHTML = data.length ? data.map(row).join("") : `<tr><td colspan="5">${emptyState("Nenhuma review", "Cadastre pessoa e filme primeiro.")}</td></tr>`;
    grid.dataset.json = JSON.stringify(data);
  }
  await refresh();

  document.getElementById("btnNew").addEventListener("click", () => {
    if (!movies.length || !people.length){
      alert("Cadastre pelo menos 1 Filme e 1 Pessoa antes de criar reviews.");
      return;
    }
    formHost.innerHTML = form({}, movies, people);
    bindForm(refresh, movies, people);
  });

  grid.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-del");
    const edit = e.target.getAttribute("data-edit");
    const data = JSON.parse(grid.dataset.json || "[]");
    if (id){
      if (confirm("Excluir esta review?")){
        await deleteDocById(PATH, id);
        await refresh();
      }
    }
    if (edit){
      const r = data.find(x => x.id === edit);
      formHost.innerHTML = form(r, movies, people);
      bindForm(refresh, movies, people);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  function bindForm(refresh, movies, people){
    const f = document.getElementById("reviewForm");
    document.getElementById("cancelEdit").addEventListener("click", () => formHost.innerHTML = "");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const obj = formToObj(f);
      // validate existence (defensive)
      if (!movies.some(m => m.title === obj.movieTitle)){
        alert("Filme inválido."); return;
      }
      if (!people.some(p => p.name === obj.personName)){
        alert("Pessoa inválida."); return;
      }
      obj.score = obj.score ? Number(obj.score) : null;
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

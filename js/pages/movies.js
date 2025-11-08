import { listDocs, createDoc, updateDocById, deleteDocById, bulkCreate } from "../db.js";
import { showAlert, formToObj, emptyState, download } from "../ui.js";

const PATH = "movies";

function movieCard(m, collections){
  const genres = Array.isArray(m.genres) ? m.genres.join(", ") : (m.genres || "");
  const director = m.director || "—";
  const cast = Array.isArray(m.cast) && m.cast.length ? m.cast.join(", ") : "—";
  const collectionOptions = collections.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

  return `
  <div class="col">
    <div class="card h-100 shadow-sm">
      <img class="cover-img" src="${m.poster || 'https://placehold.co/600x800?text=Poster'}" alt="${m.title}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title mb-1">${m.title}</h5>
        <p class="text-muted small mb-0">${m.year || '—'} • ${genres}</p>
        <p class="text-muted small">Dir.: ${director} • Elenco: ${cast}</p>
        <p class="card-text small flex-grow-1">${m.synopsis || ""}</p>
        <div class="d-flex justify-content-between align-items-center gap-2">
          <span class="badge text-bg-primary">${m.rating ?? 'NR'}</span>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" data-edit="${m.id}">Editar</button>
            <button class="btn btn-outline-danger" data-del="${m.id}">Excluir</button>
          </div>
        </div>
        <div class="mt-2">
          <div class="input-group input-group-sm">
            <label class="input-group-text">Coleção</label>
            <select class="form-select" data-add-col="${m.id}">
              <option value="">Escolher...</option>
              ${collectionOptions}
            </select>
            <button class="btn btn-outline-primary" data-add-col-btn="${m.id}">Adicionar</button>
          </div>
          <div class="form-text">Atalho: adiciona o filme a uma coleção existente.</div>
        </div>
      </div>
    </div>
  </div>`;
}

function toolbar(genres){
  const genreOptions = ['<option value="">Todos os gêneros</option>']
    .concat(genres.map(g => `<option value="${g.name}">${g.name}</option>`))
    .join("");
  return `
  <div class="toolbar d-flex align-items-end mb-2">
    <div class="me-2">
      <label class="form-label mb-1">Busca</label>
      <input id="searchInput" class="form-control" placeholder="Título do filme">
    </div>
    <div class="me-2">
      <label class="form-label mb-1">Gênero</label>
      <select id="genreFilter" class="form-select">${genreOptions}</select>
    </div>
    <div class="me-2">
      <label class="form-label mb-1">Ordenar por</label>
      <select id="sortBy" class="form-select">
        <option value="title">Título (A–Z)</option>
        <option value="year">Ano</option>
        <option value="rating">Nota</option>
      </select>
    </div>
    <div class="ms-auto d-flex gap-2">
      <button id="btnExport" class="btn btn-outline-secondary btn-sm">Exportar JSON</button>
      <label class="btn btn-outline-secondary btn-sm mb-0">
        Importar JSON <input type="file" id="fileImport" accept="application/json" hidden>
      </label>
      <button id="btnNew" class="btn btn-primary btn-sm">+ Novo Filme</button>
    </div>
  </div>`;
}

function form(m={}){
  return `
  <form id="movieForm" class="form-section mt-3">
    <input type="hidden" name="id" value="${m.id || ""}">
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Título</label>
        <input name="title" class="form-control" required value="${m.title || ""}">
      </div>
      <div class="col-md-3">
        <label class="form-label">Ano</label>
        <input name="year" type="number" class="form-control" min="1888" max="2100" value="${m.year || ""}">
      </div>
      <div class="col-md-3">
        <label class="form-label">Nota (0–10)</label>
        <input name="rating" type="number" step="0.1" min="0" max="10" class="form-control" value="${m.rating ?? ""}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Poster (URL)</label>
        <input name="poster" type="url" class="form-control" value="${m.poster || ""}">
      </div>
      <div class="col-md-6">
        <label class="form-label d-flex justify-content-between align-items-center">
          <span>Gêneros</span>
          <a href="#/genres" class="small text-decoration-none">+ Gerenciar gêneros</a>
        </label>
        <select name="genres" id="genresSelect" class="form-select" multiple size="4"></select>
        <div class="form-text">Cmd/Ctrl para múltiplos.</div>
      </div>
      <div class="col-md-4">
        <label class="form-label d-flex justify-content-between align-items-center">
          <span>Direção</span>
          <a href="#/people" class="small text-decoration-none">+ Gerenciar pessoas</a>
        </label>
        <select name="director" id="directorSelect" class="form-select"></select>
      </div>
      <div class="col-md-8">
        <label class="form-label">Elenco</label>
        <select name="cast" id="castSelect" class="form-select" multiple size="4"></select>
      </div>
      <div class="col-12">
        <label class="form-label">Sinopse</label>
        <textarea name="synopsis" class="form-control" rows="3">${m.synopsis || ""}</textarea>
      </div>
    </div>
    <div class="mt-3 d-flex gap-2">
      <button class="btn btn-primary" type="submit">${m.id ? "Salvar" : "Cadastrar"}</button>
      <button class="btn btn-outline-secondary" type="button" id="cancelEdit">Cancelar</button>
    </div>
  </form>`;
}

export async function renderMoviesPage(){
  const host = document.getElementById("app");
  const [genres, people, collections] = await Promise.all([
    listDocs("genres", { orderBy: "name" }),
    listDocs("people", { orderBy: "name" }),
    listDocs("collections", { orderBy: "name" }),
  ]);

  host.innerHTML = `
    <div class="d-flex justify-content-between align-items-end">
      <div>
        <h1 class="h3 mb-0">Filmes</h1>
      </div>
    </div>
    ${toolbar(genres)}
    <div id="formHost"></div>
    <div id="grid" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mt-1"></div>
  `;

  const grid = document.getElementById("grid");
  const formHost = document.getElementById("formHost");

  async function loadAndRender(){
    let data = await listDocs(PATH, { orderBy: document.getElementById("sortBy").value || "title" });
    // apply search/filter
    const q = (document.getElementById("searchInput").value || "").toLowerCase();
    const gf = document.getElementById("genreFilter").value || "";
    if (q) data = data.filter(m => (m.title || "").toLowerCase().includes(q));
    if (gf) data = data.filter(m => Array.isArray(m.genres) && m.genres.includes(gf));

    if (!data.length){
      grid.innerHTML = emptyState("Nenhum filme", "Cadastre ou ajuste o filtro.");
      grid.dataset.json = "[]";
    } else {
      grid.innerHTML = data.map(m => movieCard(m, collections)).join("");
      grid.dataset.json = JSON.stringify(data);
    }
  }

  // toolbar events
  document.getElementById("searchInput").addEventListener("input", loadAndRender);
  document.getElementById("genreFilter").addEventListener("change", loadAndRender);
  document.getElementById("sortBy").addEventListener("change", loadAndRender);

  // export/import
  document.getElementById("btnExport").addEventListener("click", async () => {
    const dump = {
      movies: await listDocs("movies"),
      genres: await listDocs("genres"),
      people: await listDocs("people"),
      reviews: await listDocs("reviews"),
      collections: await listDocs("collections"),
    };
    download("movie-catalog-export.json", JSON.stringify(dump, null, 2));
    showAlert("success", "Exportado com sucesso.");
  });
  document.getElementById("fileImport").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      await bulkCreate(json);
      showAlert("success", "Importado com sucesso.");
      await loadAndRender();
    } catch (err){
      showAlert("danger", "Falha ao importar: " + err.message);
    } finally {
      e.target.value = "";
    }
  });

  // initial render
  await loadAndRender();

  // New movie button
  document.getElementById("btnNew").addEventListener("click", async () => {
    formHost.innerHTML = form();
    bindForm(loadAndRender);
    await loadGenresPeople([], "", []);
  });

  // Grid actions (edit/delete/add to collection)
  grid.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-del");
    const edit = e.target.getAttribute("data-edit");
    const addBtnId = e.target.getAttribute("data-add-col-btn");
    const data = JSON.parse(grid.dataset.json || "[]");

    if (id){
      if (confirm("Deseja remover este filme?")){
        await deleteDocById(PATH, id);
        await loadAndRender();
      }
    }
    if (edit){
      const m = data.find(x => x.id === edit);
      formHost.innerHTML = form(m);
      bindForm(loadAndRender);
      const preGenres = Array.isArray(m.genres) ? m.genres : [];
      const preDir = m.director || "";
      const preCast = Array.isArray(m.cast) ? m.cast : [];
      await loadGenresPeople(preGenres, preDir, preCast);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (addBtnId){
      const sel = grid.querySelector(`select[data-add-col="${addBtnId}"]`);
      const colId = sel?.value;
      if (!colId){ showAlert("warning", "Escolha uma coleção."); return; }
      const movie = data.find(x => x.id === addBtnId);
      const cols = await listDocs("collections");
      const col = cols.find(c => c.id === colId);
      const items = Array.isArray(col.items) ? col.items : [];
      if (!items.includes(movie.title)){
        items.push(movie.title);
        await updateDocById("collections", col.id, { items });
        showAlert("success", `Adicionado à coleção "${col.name}".`, 2000);
      } else {
        showAlert("info", "Este filme já está na coleção selecionada.", 2000);
      }
    }
  });

  async function loadGenresPeople(preG=[], preD="", preC=[]){
    const [gs, ps] = await Promise.all([
      listDocs("genres", { orderBy: "name" }),
      listDocs("people", { orderBy: "name" }),
    ]);
    const gSel = document.getElementById("genresSelect");
    const dSel = document.getElementById("directorSelect");
    const cSel = document.getElementById("castSelect");

    gSel.innerHTML = gs.map(g => `<option value="${g.name}" ${preG.includes(g.name) ? 'selected' : ''}>${g.name}</option>`).join("");
    dSel.innerHTML = ['<option value="">—</option>'].concat(ps.map(p => `<option value="${p.name}" ${p.name===preD ? 'selected':''}>${p.name}</option>`)).join("");
    cSel.innerHTML = ps.map(p => `<option value="${p.name}" ${preC.includes(p.name) ? 'selected':''}>${p.name}</option>`).join("");
  }

  function bindForm(refresh){
    const f = document.getElementById("movieForm");
    document.getElementById("cancelEdit").addEventListener("click", () => formHost.innerHTML = "");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const obj = formToObj(f);
      obj.year = obj.year ? Number(obj.year) : null;
      obj.rating = obj.rating ? Number(obj.rating) : null;
      obj.genres = Array.from(document.getElementById("genresSelect").selectedOptions).map(o => o.value);
      obj.director = document.getElementById("directorSelect").value || "";
      obj.cast = Array.from(document.getElementById("castSelect").selectedOptions).map(o => o.value);
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

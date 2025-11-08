import { renderMoviesPage } from "./pages/movies.js";
import { renderGenresPage } from "./pages/genres.js";
import { renderPeoplePage } from "./pages/people.js";
import { renderReviewsPage } from "./pages/reviews.js";
import { renderCollectionsPage } from "./pages/collections.js";
import { showAlert } from "./ui.js";

const routes = {
  "/movies": renderMoviesPage,
  "/genres": renderGenresPage,
  "/people": renderPeoplePage,
  "/reviews": renderReviewsPage,
  "/collections": renderCollectionsPage,
  "/about": () => {
    const el = document.getElementById("app");
    const mode = window._services?.mode || "local";
    el.innerHTML = `
      <div class="p-4 bg-white rounded-3 shadow-sm">
        <h1 class="h4">Sobre o Projeto</h1>
        <p>Catálogo de Filmes com <strong>5 entidades</strong> totalmente integradas:</p>
        <ul>
          <li>Filmes ↔ Gêneros (multi)</li>
          <li>Filmes ↔ Pessoas (Direção e Elenco)</li>
          <li>Reviews: Pessoa avalia Filme existente</li>
          <li>Coleções: listas compostas por Filmes existentes</li>
        </ul>
       </div>`;
  }
};

function parseLocation() {
  const hash = location.hash || "#/movies";
  return hash.slice(1);
}

export async function router(){
  const path = parseLocation();
  const fn = routes[path] || routes["/movies"];
  await fn();
}

window.addEventListener("hashchange", router);
window.addEventListener("load", () => {
  const mode = window._services?.mode || "local";
  const btnIn = document.getElementById("btnSignIn");
  const btnOut = document.getElementById("btnSignOut");

  if (mode === "firebase"){
    const { auth, signInAnonymously, onAuthStateChanged, signOut } = window._services;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        btnIn.classList.add("d-none");
        btnOut.classList.remove("d-none");
        showAlert("success", "Autenticado (anônimo). ID: " + user.uid, 2500);
      } else {
        btnIn.classList.remove("d-none");
        btnOut.classList.add("d-none");
      }
    });
    btnIn?.addEventListener("click", async () => {
      try { await signInAnonymously(auth); } catch(e){ showAlert("danger", e.message); }
    });
    btnOut?.addEventListener("click", async () => {
      try { await signOut(auth); showAlert("info", "Sessão encerrada."); } catch(e){ showAlert("danger", e.message); }
    });
  } else {
    btnIn?.classList.add("d-none");
    btnOut?.classList.add("d-none");
    showAlert("info", "Modo Demo (LocalStorage). Todos os dados ficam no seu navegador.", 3000);
  }

  router();
});

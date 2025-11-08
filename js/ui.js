export function $(sel){ return document.querySelector(sel); }
export function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

export function showAlert(type="info", msg="", timeout=0){
  const host = document.getElementById("alertHost");
  const el = document.createElement("div");
  el.className = `alert alert-${type} alert-dismissible fade show`;
  el.role = "alert";
  el.innerHTML = `
    <div>${msg}</div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  host.appendChild(el);
  if (timeout > 0){
    setTimeout(() => {
      el.classList.remove("show");
      el.addEventListener("transitionend", () => el.remove());
    }, timeout);
  }
}

export function formToObj(form){
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

export function download(filename, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], {type: 'application/json'}));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function emptyState(title="Nada encontrado", subtitle="Cadastre itens para começar."){
  return `
    <div class="text-center text-muted my-5">
      <div class="display-6">🍿</div>
      <h3 class="h5 mt-3">${title}</h3>
      <p>${subtitle}</p>
    </div>
  `;
}

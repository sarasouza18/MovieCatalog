# Catálogo de Filmes

## Integração entre as 5 entidades
- **Filmes ↔ Gêneros:** multiselect no formulário de filmes.
- **Filmes ↔ Pessoas:** seletores para **Diretor** (1) e **Elenco** (N).
- **Reviews:** uma **Pessoa existente** avalia um **Filme existente**.
- **Coleções:** compostas por **Filmes existentes** (multiselect) + atalho “Adicionar à Coleção” nos cards.
- **Pessoas:** CRUD (usadas como Direção/Elenco e em Reviews).

## +3 funcionalidades novas
1) **Busca por título**, **filtro por gênero** e **ordenação** (título/ano/nota) na listagem de filmes.  
2) **Exportar/Importar JSON** do banco (movies, genres, people, reviews, collections).  
3) **Atalho “Adicionar à Coleção”** diretamente nos cards de filmes.

## Execução
- **LocalStorage (demo):** `python3 -m http.server` → `http://localhost:8000`
- **Firestore (opcional):** preencher `firebaseConfig` no `index.html`.


# MovieCatalog

Catálogo de filmes desenvolvido em HTML, CSS e JavaScript puro, com CRUD completo de cinco entidades, integração entre elas e seeder automático para dados iniciais.
Funciona em ambiente local ou via GitHub Pages.

Acesse o projeto em produção:
[https://sarasouza18.github.io/MovieCatalog/#/movies](https://sarasouza18.github.io/MovieCatalog/#/movies)

## Como rodar localmente

O projeto utiliza módulos ES6, então precisa ser executado em um servidor HTTP simples.

### Opção 1 – Python (recomendado)

```
cd MovieCatalog
python3 -m http.server 8000
```

Depois acesse no navegador:

```
http://localhost:8000
```

### Opção 2 – Node.js

```
npm install -g http-server
http-server -p 8000
```

E acesse:

```
http://localhost:8000
```

Para evitar cache, use:

```
http://localhost:8000/?v=1
```

## Seeder automático

O seeder é executado automaticamente em toda carga, garantindo que as coleções tenham dados iniciais.
Se estiver vazio, ele cria registros padrão para:

* **Gêneros**
* **Pessoas**
* **Filmes**
* **Reviews**
* **Coleções**

Para forçar a reinicialização e recarregar o seeder:

```
http://localhost:8000/?seed=force
```

ou

```
https://sarasouza18.github.io/MovieCatalog/?seed=force
```

## Entidades e relações

* **Filmes**
  Associados a múltiplos gêneros, um diretor e vários integrantes de elenco.

* **Gêneros**
  Cadastrados separadamente e usados no formulário de filmes.

* **Pessoas**
  Podem ser diretores ou atores e são vinculadas aos filmes.

* **Reviews**
  Cada avaliação é feita por uma pessoa cadastrada para um filme existente.

* **Coleções**
  Grupos compostos por filmes já cadastrados.

Os relacionamentos são gerenciados por campos de seleção dinâmicos nas telas de cadastro e edição.

## Funcionalidades

* CRUD completo das cinco entidades.
* Busca, filtro e ordenação de filmes.
* Adição de filmes a coleções diretamente dos cards.
* Exportação e importação de dados em JSON.
* Seeder automático com dados padrão.
* Interface responsiva baseada em Bootstrap 5.

## Estrutura de pastas

```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── router.js
│   ├── seed.js
│   ├── db.js
│   ├── ui.js
│   ├── data/
│   │   ├── local.js
│   │   └── firestore.js
│   └── pages/
│       ├── movies.js
│       ├── genres.js
│       ├── people.js
│       ├── reviews.js
│       └── collections.js
```

## Deploy no GitHub Pages

1. Faça o push com o arquivo `index.html` na raiz do repositório.
2. Ative o GitHub Pages em **Settings → Pages → Deploy from a branch**.
3. Use a URL gerada pelo GitHub, por exemplo:
   `https://sarasouza18.github.io/MovieCatalog/`
4. Acesse com `?seed=force` na primeira vez para garantir a carga dos dados iniciais.

## Observações

* Caminhos nos scripts devem ser relativos (`./js/seed.js`) e respeitar letras maiúsculas e minúsculas.
* Caso o conteúdo não apareça, verifique o console do navegador para erros de caminho ou cache.

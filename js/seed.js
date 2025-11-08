import { ensureSeed } from "./db.js";
import { showAlert } from "./ui.js";

import { listDocs, createDoc } from "./db.js";

const DATASETS = {
  genres: [
    { name: "Ação", description: "..." },
    { name: "Aventura", description: "..." },
  ],
  people: [
    { name: "Denis Villeneuve", role: "Diretor" },
  ],
  movies: [
    { title: "Blade Runner 2049", year: 2017, genres: ["Ficção científica","Drama"], rating: 8.7 },
  ],
  reviews: [
    { movieTitle: "Blade Runner 2049", personName: "Christopher Nolan", score: 9.5, comment: "..." },
  ],
  collections: [
    { name: "Favoritos", items: ["Blade Runner 2049","Matrix"] },
  ],
};

async function seedIfEmpty(collection, items){
  const list = await listDocs(collection);
  if (!list || list.length === 0){
    for (const it of items) await createDoc(collection, it);
    console.log(`[seed] ${collection}: inseridos ${items.length}`);
    return true;
  }
  console.log(`[seed] ${collection}: já possui ${list.length}, pulando`);
  return false;
}

(async function runSeed(){
  try{
    const results = await Promise.all(Object.entries(DATASETS).map(([k,v]) => seedIfEmpty(k, v)));
    if (results.some(Boolean)) {
      console.log("[seed] Executado");
    } else {
      console.log("[seed] Nada a fazer (dados já existem)");
    }
  } catch(e){
    console.error("[seed] Falhou:", e);
  }
})();


const defaultGenres = [
  { name: "Ação", description: "Filmes com alto nível de energia, lutas e perseguições." },
  { name: "Aventura", description: "Exploração, jornadas e descobertas." },
  { name: "Drama", description: "Conflitos humanos e emocionais." },
  { name: "Comédia", description: "Histórias leves com humor." },
  { name: "Ficção científica", description: "Tecnologia, futuro e especulação." },
  { name: "Fantasia", description: "Mundos e elementos mágicos." },
  { name: "Crime", description: "Investigações e suspense policial." },
  { name: "Thriller", description: "Tensão e reviravoltas." },
  { name: "Música", description: "Bandas, artistas e performances." }
];

const defaultPeople = [
  { name: "Denis Villeneuve", role: "Diretor", bio: "Diretor de Duna e Blade Runner 2049." },
  { name: "Christopher Nolan", role: "Diretor", bio: "Diretor de A Origem e Interestelar." },
  { name: "Keanu Reeves", role: "Ator", bio: "Protagonista de Matrix." },
  { name: "Gal Gadot", role: "Atriz", bio: "Mulher-Maravilha." },
  { name: "Heath Ledger", role: "Ator", bio: "Coringa em O Cavaleiro das Trevas." }
];

const defaultMovies = [
  { title: "Blade Runner 2049", year: 2017, genres: ["Ficção científica","Drama"], director: "Denis Villeneuve", cast: ["Ryan Gosling","Harrison Ford"], poster: "https://placehold.co/600x800?text=Blade+Runner+2049", synopsis: "Um jovem blade runner desvenda um segredo que pode mergulhar a sociedade no caos.", rating: 8.7 },
  { title: "Duna: Parte Dois", year: 2024, genres: ["Ficção científica","Aventura"], director: "Denis Villeneuve", cast: ["Timothée Chalamet","Zendaya"], poster: "https://placehold.co/600x800?text=Duna+Parte+II", synopsis: "Paul Atreides une forças com os Fremen para vingar sua família.", rating: 8.6 },
  { title: "Interestelar", year: 2014, genres: ["Ficção científica","Drama"], director: "Christopher Nolan", cast: ["Matthew McConaughey","Anne Hathaway"], poster: "https://placehold.co/600x800?text=Interestelar", synopsis: "Exploradores viajam pelo espaço para salvar a humanidade.", rating: 8.6 },
  { title: "A Origem", year: 2010, genres: ["Ação","Ficção científica"], director: "Christopher Nolan", cast: ["Leonardo DiCaprio","Joseph Gordon-Levitt"], poster: "https://placehold.co/600x800?text=A+Origem", synopsis: "Implantar uma ideia no sonho de um alvo não será fácil.", rating: 8.8 },
  { title: "O Cavaleiro das Trevas", year: 2008, genres: ["Ação","Crime","Drama"], director: "Christopher Nolan", cast: ["Christian Bale","Heath Ledger"], poster: "https://placehold.co/600x800?text=The+Dark+Knight", synopsis: "Batman enfrenta o caos instaurado pelo Coringa.", rating: 9.0 },
  { title: "Parasita", year: 2019, genres: ["Drama","Thriller"], director: "", cast: [], poster: "https://placehold.co/600x800?text=Parasita", synopsis: "Duas famílias de classes distintas se cruzam perigosamente.", rating: 8.6 },
  { title: "Tudo em Todo Lugar ao Mesmo Tempo", year: 2022, genres: ["Aventura","Comédia","Ficção científica"], director: "", cast: [], poster: "https://placehold.co/600x800?text=EEE+All+at+Once", synopsis: "Uma aventura multiversal caótica e emocionante.", rating: 8.1 },
  { title: "Cidade de Deus", year: 2002, genres: ["Crime","Drama"], director: "", cast: [], poster: "https://placehold.co/600x800?text=Cidade+de+Deus", synopsis: "A ascensão do crime em uma favela do Rio.", rating: 8.6 },
  { title: "Matrix", year: 1999, genres: ["Ação","Ficção científica"], director: "", cast: ["Keanu Reeves"], poster: "https://placehold.co/600x800?text=Matrix", synopsis: "A realidade pode ser uma simulação.", rating: 8.7 },
  { title: "O Senhor dos Anéis: A Sociedade do Anel", year: 2001, genres: ["Fantasia","Aventura"], director: "", cast: [], poster: "https://placehold.co/600x800?text=Sociedade+do+Anel", synopsis: "A jornada para destruir o Um Anel começa.", rating: 8.8 },
  { title: "Whiplash: Em Busca da Perfeição", year: 2014, genres: ["Drama","Música"], director: "", cast: [], poster: "https://placehold.co/600x800?text=Whiplash", synopsis: "Um professor impiedoso e um aluno obcecado.", rating: 8.5 },
  { title: "Mad Max: Estrada da Fúria", year: 2015, genres: ["Ação","Aventura"], director: "", cast: [], poster: "https://placehold.co/600x800?text=Mad+Max+Fury+Road", synopsis: "Fuga explosiva no deserto pós-apocalíptico.", rating: 8.1 }
];

window.addEventListener("load", async () => {
  const seededGenres = await ensureSeed("genres", defaultGenres);
  const seededPeople = await ensureSeed("people", defaultPeople);
  const seededMovies = await ensureSeed("movies", defaultMovies);
  if (seededGenres){ showAlert("info", "Gêneros padrão adicionados.", 1500); }
  if (seededPeople){ showAlert("info", "Pessoas padrão adicionadas.", 1500); }
  if (seededMovies){ showAlert("success", "Catálogo inicial adicionado (12 filmes).", 2000); }
});

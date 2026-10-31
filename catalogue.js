const tousLesProduits = produits.concat(flash);
const compteur = document.querySelector("#compteur");
const formFiltres = document.querySelector("#filtres");
const formRecherche = document.querySelector("#recherche");
const champRecherche = document.querySelector("#recherche input");
const liste = document.querySelector("#catalogue-liste");
const messageVide = document.querySelector("#catalogue-vide");
const compteResultats = document.querySelector("#compte-resultats");
const prixMin = document.querySelector("#prix-min");
const prixMax = document.querySelector("#prix-max");

// --- Le panier (mêmes fonctions que sur les autres pages) ---
function lirePanier() {
  return JSON.parse(localStorage.getItem("panierProduits")) || [];
}

function sauvegarderPanier(panier) {
  localStorage.setItem("panierProduits", JSON.stringify(panier));
}

function afficherCompteur() {
  let total = 0;
  lirePanier().forEach(function (article) {
    total = total + article.quantite;
  });
  compteur.textContent = total;
}

function formaterPrix(nombre) {
  return nombre.toLocaleString("fr-FR") + " FCFA";
}

// --- Petits outils ---
function simplifier(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function majuscule(texte) {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

function creerCases(conteneurId, propriete, valeurDepart) {
  const conteneur = document.querySelector(conteneurId);
  conteneur.innerHTML = "";

  // 1. La liste des valeurs différentes (sans les vides)
  const valeurs = [];
  tousLesProduits.forEach(function (p) {
    if (p[propriete] && !valeurs.includes(p[propriete])) {
      valeurs.push(p[propriete]);
    }
  });
  valeurs.sort();

  // 2. Une case par valeur
  valeurs.forEach(function (valeur) {
    const nombre = tousLesProduits.filter(function (p) {
      return p[propriete] === valeur;
    }).length;

    const etiquette = document.createElement("label");
    etiquette.className = "option-filtre";

    const caseACocher = document.createElement("input");
    caseACocher.type = "checkbox";
    caseACocher.value = valeur;
    caseACocher.checked = Boolean(valeurDepart) && simplifier(valeur) === simplifier(valeurDepart);

    etiquette.appendChild(caseACocher);
    etiquette.append(" " + majuscule(valeur) + " (" + nombre + ")");
    conteneur.appendChild(etiquette);
  });
}

function valeursCochees(conteneurId) {
  const valeurs = [];
  document.querySelectorAll(conteneurId + " input:checked").forEach(function (caseCochee) {
    valeurs.push(caseCochee.value);
  });
  return valeurs;
}

// --- Quels produits garder ? ---
function produitsFiltres() {
  const recherche = simplifier(champRecherche.value.trim());
  const categories = valeursCochees("#filtre-categories");
  const marques = valeursCochees("#filtre-marques");
  const min = Number(prixMin.value) || 0;
  const max = Number(prixMax.value) || Infinity;
  const noteMin = Number(document.querySelector('input[name="note"]:checked').value);

  return tousLesProduits.filter(function (p) {
    const texte = simplifier(p.nom + " " + p.description + " " + p.marque + " " + p.categorie);

    return (recherche === "" || texte.includes(recherche))
      && (categories.length === 0 || categories.includes(p.categorie))
      && (marques.length === 0 || marques.includes(p.marque))
      && p.prix >= min
      && p.prix <= max
      && p.note >= noteMin;
  });
}

// --- Afficher les cartes ---
function afficherCatalogue() {
  const resultats = produitsFiltres();

  let html = "";
  resultats.forEach(function (p) {
    const remise = Math.round((p.ancienPrix - p.prix) / p.ancienPrix * 100);
    html = html + `
      <article class="carte-produit">
        <span class="badge-remise">-${remise}%</span>
        <a href="produit.html?id=${p.id}"><img src="${p.image}" alt="${p.nom}"></a>
        <h3><a href="produit.html?id=${p.id}">${p.nom}</a></h3>
        <p class="description">${p.marque} - ${p.description}</p>
        <p class="note">${"★".repeat(p.note)}${"☆".repeat(5 - p.note)} <span>(${p.avis})</span></p>
        <p class="prix">${formaterPrix(p.prix)} <span class="ancien-prix">${formaterPrix(p.ancienPrix)}</span></p>
        <p class="stock">${p.stock} articles en stock</p>
        <button type="button" data-id="${p.id}">Ajouter au panier</button>
      </article>`;
  });

  liste.innerHTML = html;
  messageVide.hidden = resultats.length > 0;

  let texte = resultats.length + " produit trouvé";
  if (resultats.length > 1) {
    texte = resultats.length + " produits trouvés";
  }
  compteResultats.textContent = texte;
}

// --- Ajouter au panier (un seul écouteur pour tous les boutons) ---
liste.addEventListener("click", function (evenement) {
  const bouton = evenement.target.closest("button");
  if (!bouton) {
    return;
  }

  const p = produits.find(function (x) {
    return x.id === bouton.dataset.id;
  });

  const panier = lirePanier();
  const existant = panier.find(function (article) {
    return article.id === p.id;
  });

  if (existant) {
    existant.quantite = existant.quantite + 1;
  } else {
    panier.push({
      id: p.id,
      nom: p.nom,
      prix: p.prix,
      image: p.image,
      description: p.description,
      quantite: 1
    });
  }

  sauvegarderPanier(panier);
  afficherCompteur();

  const texteInitial = bouton.textContent;
  bouton.textContent = "Ajouté ✓";
  bouton.disabled = true;
  setTimeout(function () {
    bouton.textContent = texteInitial;
    bouton.disabled = false;
  }, 1000);
});

// --- Réagir aux filtres et à la recherche ---
formFiltres.addEventListener("input", afficherCatalogue);
champRecherche.addEventListener("input", afficherCatalogue);

formFiltres.addEventListener("submit", function (evenement) {
  evenement.preventDefault();
});

formRecherche.addEventListener("submit", function (evenement) {
  evenement.preventDefault();
  afficherCatalogue();
});

document.querySelector("#reinitialiser").addEventListener("click", function () {
  formFiltres.reset();
  champRecherche.value = "";
  afficherCatalogue();
});


// --- Ouvrir / fermer les filtres ---
const blocCatalogue = document.querySelector(".catalogue");
const boutonFiltres = document.querySelector("#btn-filtres");

function majBoutonFiltres() {
  if (blocCatalogue.classList.contains("sans-filtres")) {
    boutonFiltres.textContent = "Afficher les filtres";
  } else {
    boutonFiltres.textContent = "Masquer les filtres";
  }
}

boutonFiltres.addEventListener("click", function () {
  blocCatalogue.classList.toggle("sans-filtres");
  majBoutonFiltres();
});

if (window.matchMedia("(max-width: 700px)").matches) {
  blocCatalogue.classList.add("sans-filtres");
}
majBoutonFiltres();


// --- Au chargement ---
// ?categorie=baskets dans l'adresse coche déjà la catégorie
const categorieURL = new URLSearchParams(window.location.search).get("categorie");

creerCases("#filtre-categories", "categorie", categorieURL);
const marqueURL = new URLSearchParams(window.location.search).get("marque");
creerCases("#filtre-marques", "marque", marqueURL);
afficherCompteur();
afficherCatalogue();
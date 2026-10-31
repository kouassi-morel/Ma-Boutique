const compteur = document.querySelector("#compteur");
const fiche = document.querySelector("#fiche");
const introuvable = document.querySelector("#introuvable");

// --- Les mêmes fonctions que pour le panier ---
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

afficherCompteur();

// --- 1. Quel produit afficher ? On lit l'adresse : produit.html?id=2 ---
const parametres = new URLSearchParams(window.location.search);
const id = parametres.get("id");

const tousLesProduits = produits.concat(flash);

const produit = tousLesProduits.find(function (p) {
  return p.id === id;
});


if (produit) {
  afficherProduit();
} else {
  introuvable.hidden = false;
}

// --- 2. Remplir la page ---
function afficherProduit() {
  document.title = produit.nom + " - Ma Boutique";
  document.querySelector("#p-fil").textContent = produit.nom;

  const image = document.querySelector("#p-image");
  image.src = produit.image;
  image.alt = produit.nom;

  document.querySelector("#p-nom").textContent = produit.nom;
  document.querySelector("#p-note").textContent =
    "★".repeat(produit.note) + "☆".repeat(5 - produit.note) + " (" + produit.avis + " avis)";

  document.querySelector("#p-prix").textContent = formaterPrix(produit.prix);
  document.querySelector("#p-ancien").textContent = formaterPrix(produit.ancienPrix);

  const remise = Math.round((produit.ancienPrix - produit.prix) / produit.ancienPrix * 100);
  document.querySelector("#p-remise").textContent = "-" + remise + "%";

  document.querySelector("#p-stock").textContent = produit.stock + " articles en stock";
  document.querySelector("#p-description").textContent = produit.description;

  const liste = document.querySelector("#p-details");
  produit.details.forEach(function (detail) {
    const li = document.createElement("li");
    li.textContent = detail;
    liste.appendChild(li);
  });

    // Au départ : la catégorie du produit, ou "tous" s'il n'y a pas d'autre produit dedans
  let depart = produit.categorie;
  if (autresProduits(depart).length === 0) {
    depart = "tous";
  }
  afficherSimilaires(depart);
  fiche.hidden = false;

  fiche.hidden = false;
}

// --- 3. La quantité ---
let quantite = 1;
const affichageQuantite = document.querySelector("#p-quantite");

document.querySelector("#p-plus").addEventListener("click", function () {
  if (quantite < produit.stock) {
    quantite = quantite + 1;
    affichageQuantite.textContent = quantite;
  }
});

document.querySelector("#p-moins").addEventListener("click", function () {
  if (quantite > 1) {
    quantite = quantite - 1;
    affichageQuantite.textContent = quantite;
  }
});

// --- 4. Ajouter au panier ---
document.querySelector("#p-ajouter").addEventListener("click", function () {
  const panier = lirePanier();

  const existant = panier.find(function (article) {
    return article.id === produit.id;
  });

  if (existant) {
    existant.quantite = existant.quantite + quantite;
  } else {
    panier.push({
      id: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      image: produit.image,
      description: produit.description,
      quantite: quantite
    });
  }

  sauvegarderPanier(panier);
  afficherCompteur();
  document.querySelector("#p-message").hidden = false;
});

// --- 5. Les produits similaires et la barre de catégories ---
function autresProduits(categorie) {
  return produits.filter(function (p) {
    return p.id !== produit.id && (categorie === "tous" || p.categorie === categorie);
  });
}

function afficherSimilaires(categorie) {
  const liste = autresProduits(categorie);

  let html = "";
  liste.forEach(function (p) {
    const remise = Math.round((p.ancienPrix - p.prix) / p.ancienPrix * 100);
    html = html + `
      <article class="carte-produit">
        <span class="badge-remise">-${remise}%</span>
        <a href="produit.html?id=${p.id}"><img src="${p.image}" alt="${p.nom}"></a>
        <h3><a href="produit.html?id=${p.id}">${p.nom}</a></h3>
        <p class="note">${"★".repeat(p.note)}${"☆".repeat(5 - p.note)} <span>(${p.avis})</span></p>
        <p class="prix">${formaterPrix(p.prix)} <span class="ancien-prix">${formaterPrix(p.ancienPrix)}</span></p>
      </article>`;
  });

  const rangee = document.querySelector("#similaires-liste");
  rangee.innerHTML = html;
  rangee.scrollLeft = 0;

  document.querySelector("#similaires-vide").hidden = liste.length > 0;
  document.querySelector("#similaires").hidden = false;

  // On met en valeur la catégorie choisie
  document.querySelectorAll(".categories a").forEach(function (lien) {
    lien.classList.toggle("actif", lien.dataset.categorie === categorie);
  });
}
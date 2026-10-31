//ON récupere toutes les image de la banniere
const images = document.querySelectorAll(".banniere img");
const boutonPrecedent = document.querySelector(".precedent");
const boutonSuivant = document.querySelector(".suivant");
let position = 0;

// Affiche l'image numéro "numero"
function afficherImage(numero) {
    images[position].classList.remove("active");
    position = (numero + images.length) % images.length;
    images[position].classList.add("active");
}

// clic sur les boutons
boutonSuivant.addEventListener("click", function () {
    afficherImage(position + 1);
    relancerDefilement();
});
boutonPrecedent.addEventListener("click", function() {
    afficherImage(position - 1);
    relancerDefilement();
});

//defilement automatique toute les 3 secondes
let minuteur = setInterval (function() {
    afficherImage(position + 1);
}, 3000);

// Apres un clic, on repart de zéro pour ne pas changer juste après
function relancerDefilement() {
    clearInterval(minuteur);
    minuteur = setInterval(function () {
        afficherImage(position + 1);
    }, 3000);
}


// ----- Le panier -----
const compteur = document.querySelector("#compteur");
const boutonsAjouter = document.querySelectorAll(".carte-produit button");

// Lit le panier enregistré (une liste de produits)
function lirePanier() {
  return JSON.parse(localStorage.getItem("panierProduits")) || [];
}

// Enregistre le panier
function sauvegarderPanier(panier) {
  localStorage.setItem("panierProduits", JSON.stringify(panier));
}

// Affiche le nombre total d'articles dans le menu
function afficherCompteur() {
  let total = 0;
  lirePanier().forEach(function (article) {
    total = total + article.quantite;
  });
  compteur.textContent = total;
}

afficherCompteur();

boutonsAjouter.forEach(function (bouton) {
  bouton.addEventListener("click", function () {
    const carte = bouton.closest(".carte-produit");
    const id = carte.dataset.id;
    const panier = lirePanier();

    // Le produit est-il déjà dans le panier ?
    const existant = panier.find(function (article) {
      return article.id === id;
    });

    if (existant) {
      existant.quantite = existant.quantite + 1;
    } else {
      panier.push({
        id: id,
        nom: carte.querySelector("h3").textContent,
        prix: Number(carte.dataset.prix),
        image: carte.querySelector("img").getAttribute("src"),
        description: carte.dataset.description,
        quantite: 1
      });
    }

    sauvegarderPanier(panier);
    afficherCompteur();

    // Message de confirmation pendant 1 seconde
    bouton.textContent = "Ajouté ✓";
    bouton.disabled = true;
    setTimeout(function () {
      bouton.textContent = "Ajouter au panier";
      bouton.disabled = false;
    }, 1000);
  });
});

// --- La recherche --- 

const formulaireRecherche = document.querySelector(".recherche");
const champRecherche = document.querySelector(".recherche input");
const cartes = document.querySelectorAll(".liste-produits .carte-produit");
const messageVide = document.querySelector("#aucun-resultat");

// Met en minuscules et enlève les accents : "Sandale" = "sandale" = "SANDALE"
function simplifier(texte) {
    return texte
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
}

function filtrerProduits() {
    const recherche = simplifier(champRecherche.value.trim());
    const dansCategorie = categorieChoisie === "tous" || carte.dataset.categorie === categorieChoisie;

    let nombreTrouves = 0;

    cartes.forEach(function (carte){
        const nom = simplifier(carte.querySelector("h3").textContent);
        const description = simplifier(carte.querySelector(".description").textContent);

         if (dansCategorie && (nom.includes(recherche) || description.includes(recherche))) {
            carte.style.display = "";
            nombreTrouves = nombreTrouves + 1; // on montre la carte
        } else {
            carte.style.display = "none"; // on cache la carte
        }
    });

    // le message n'apparait que si aucune carte ne correspond
    messageVide.hedden = nombreTrouves > 0;
}

// Filtre à chaque lettre tapée
champRecherche.addEventListener("input", filtrerProduits);

// Si on appuie sur Entrée ou sur le bouton, on filtre sans recharger la page
formulaireRecherche.addEventListener("submit", function (evenement) {
  evenement.preventDefault();
  filtrerProduits();
});

// ----- La rangée qui défile -----
const rangee = document.querySelector(".rangee-defile");
const flecheGauche = document.querySelector(".rangee-fleche.gauche");
const flecheDroite = document.querySelector(".rangee-fleche.droite");

flecheDroite.addEventListener("click", function () {
  rangee.scrollBy({ left: rangee.clientWidth * 0.8, behavior: "smooth" });
});

flecheGauche.addEventListener("click", function () {
  rangee.scrollBy({ left: -rangee.clientWidth * 0.8, behavior: "smooth" });
});

// ----- Les catégories -----
const categorieChoisie = new URLSearchParams(window.location.search).get("categorie") || "tous";

// On met en valeur le lien de la catégorie choisie
document.querySelectorAll(".categories a").forEach(function (lien) {
  if (lien.dataset.categorie === categorieChoisie) {
    lien.classList.add("actif");
  }
});

// On cache les cartes des autres catégories
document.querySelectorAll(".liste-produits .carte-produit").forEach(function (carte) {
  if (categorieChoisie !== "tous" && carte.dataset.categorie !== categorieChoisie) {
    carte.style.display = "none";
  }
});
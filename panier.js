const listePanier = document.querySelector("#liste-panier");
const resume = document.querySelector("#resume");
const messageVide = document.querySelector("#panier-vide");
const compteur = document.querySelector("#compteur");
const totalAffiche = document.querySelector("#total");

function lirePanier() {
  return JSON.parse(localStorage.getItem("panierProduits")) || [];
}

function sauvegarderPanier(panier) {
  localStorage.setItem("panierProduits", JSON.stringify(panier));
}

// 25000 devient "25 000 FCFA"
function formaterPrix(nombre) {
  return nombre.toLocaleString("fr-FR") + " FCFA";
}

function afficherPanier() {
  const panier = lirePanier();

  // Nombre d'articles dans le menu
  let nombreArticles = 0;
  panier.forEach(function (article) {
    nombreArticles = nombreArticles + article.quantite;
  });
  compteur.textContent = nombreArticles;

  // Panier vide
  if (panier.length === 0) {
    listePanier.innerHTML = "";
    resume.hidden = true;
    messageVide.hidden = false;
    return;
  }

  resume.hidden = false;
  messageVide.hidden = true;

  // On construit une "ligne" par produit
  let html = "";
  let total = 0;

  panier.forEach(function (article) {
    const sousTotal = article.prix * article.quantite;
    total = total + sousTotal;

    html = html + `
      <article class="article-panier">
        <img src="${article.image}" alt="${article.nom}">

        <div>
          <h3>${article.nom}</h3>
          <p class="description">${article.description}</p>
          <div class="quantite">
            <button type="button" data-action="moins" data-id="${article.id}">−</button>
            <span>${article.quantite}</span>
            <button type="button" data-action="plus" data-id="${article.id}">+</button>
          </div>
        </div>

        <div class="cote-droit">
          <strong>${formaterPrix(sousTotal)}</strong>
          <button type="button" class="btn-supprimer" data-action="supprimer" data-id="${article.id}">
            Supprimer
          </button>
        </div>
      </article>
    `;
  });

  listePanier.innerHTML = html;
  totalAffiche.textContent = formaterPrix(total);
}

// Un seul écouteur pour tous les boutons de la liste
listePanier.addEventListener("click", function (evenement) {
  const bouton = evenement.target.closest("button");
  if (!bouton) {
    return;
  }

  const action = bouton.dataset.action;
  const id = bouton.dataset.id;
  let panier = lirePanier();

  if (action === "supprimer") {
    panier = panier.filter(function (article) {
      return article.id !== id;
    });
  } else {
    const article = panier.find(function (a) {
      return a.id === id;
    });

    if (action === "plus") {
      article.quantite = article.quantite + 1;
    }
    if (action === "moins" && article.quantite > 1) {
      article.quantite = article.quantite - 1;
    }
  }

  sauvegarderPanier(panier);
  afficherPanier();
});

afficherPanier();


// ----- La commande -----
const btnCommander = document.querySelector("#btn-commander");
const fenetreCommande = document.querySelector("#commande");
const vueFormulaire = document.querySelector("#vue-formulaire");
const formCommande = document.querySelector("#form-commande");
const confirmation = document.querySelector("#confirmation");
const boutonFermer = document.querySelector("#fermer-commande");
const totalModal = document.querySelector("#modal-total");

function calculerTotal() {
  let total = 0;
  lirePanier().forEach(function (article) {
    total = total + article.prix * article.quantite;
  });
  return total;
}

function ouvrirCommande() {
  totalModal.textContent = formaterPrix(calculerTotal());
  fenetreCommande.hidden = false;
  document.body.style.overflow = "hidden";   // la page derrière ne défile plus
}

function fermerCommande() {
  fenetreCommande.hidden = true;
  document.body.style.overflow = "";
}

// Ouvrir : clic sur "Commander"
btnCommander.addEventListener("click", ouvrirCommande);

// Fermer : bouton ×, clic sur le fond sombre, touche Échap
boutonFermer.addEventListener("click", fermerCommande);

fenetreCommande.addEventListener("click", function (evenement) {
  if (evenement.target === fenetreCommande) {
    fermerCommande();
  }
});

document.addEventListener("keydown", function (evenement) {
  if (evenement.key === "Escape") {
    fermerCommande();
  }
});

// Envoi du formulaire
formCommande.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  const panier = lirePanier();
  if (panier.length === 0) {
    return;
  }

  const champs = formCommande.elements;

  const commande = {
    numero: "CMD-" + Date.now(),
    date: new Date().toLocaleString("fr-FR"),
    nom: champs.nom.value.trim(),
    telephone: champs.telephone.value.trim(),
    ville: champs.ville.value.trim(),
    adresse: champs.adresse.value.trim(),
    paiement: champs.paiement.value,
    articles: panier,
    total: calculerTotal()
  };

  // On enregistre la commande
  const commandes = JSON.parse(localStorage.getItem("commandes")) || [];
  commandes.push(commande);
  localStorage.setItem("commandes", JSON.stringify(commandes));

  // On affiche la confirmation (avant de vider le panier)
  document.querySelector("#conf-numero").textContent = commande.numero;
  document.querySelector("#conf-nom").textContent = commande.nom;
  document.querySelector("#conf-adresse").textContent = commande.adresse + ", " + commande.ville;
  document.querySelector("#conf-paiement").textContent = commande.paiement;
  document.querySelector("#conf-total").textContent = formaterPrix(commande.total);

  vueFormulaire.hidden = true;
  confirmation.hidden = false;

  // On vide le panier
  localStorage.removeItem("panierProduits");
  afficherPanier();
});

// ----- Commande par WhatsApp -----
// Votre numéro, au format international, sans + ni espaces
const NUMERO_WHATSAPP = "2250142312544";

const boutonWhatsapp = document.querySelector("#btn-whatsapp");

boutonWhatsapp.addEventListener("click", function () {
  const panier = lirePanier();

  if (panier.length === 0) {
    alert("Votre panier est vide.");
    return;
  }

  let message = "Bonjour, je souhaite commander :\n\n";
  let total = 0;

  panier.forEach(function (article) {
    const quantite = article.quantite || 1;
    const sousTotal = article.prix * quantite;
    total = total + sousTotal;
    message = message + "• " + article.nom + " x" + quantite
      + " : " + sousTotal.toLocaleString("fr-FR") + " FCFA\n";
  });

  message = message + "\nTotal : " + total.toLocaleString("fr-FR") + " FCFA";

  const lien = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(message);
  window.open(lien, "_blank");
});
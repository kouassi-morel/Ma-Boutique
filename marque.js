// ----- Zones publicitaires des marques -----
const marquesPub = [
  { nom: "Nike", couleur: "#111827" },
  { nom: "Adidas", couleur: "#1e40af" },
  { nom: "Jordan", couleur: "#b91c1c" }
];

function prixMarque(nombre) {
  return nombre.toLocaleString("fr-FR") + " FCFA";
}

// Le HTML d'une carte
function carteMarque(p) {
  const remise = Math.round((p.ancienPrix - p.prix) / p.ancienPrix * 100);
  return `
    <article class="carte-produit">
      <span class="badge-remise">-${remise}%</span>
      <a href="produit.html?id=${p.id}"><img src="${p.image}" alt="${p.nom}"></a>
      <h3><a href="produit.html?id=${p.id}">${p.nom}</a></h3>
      <p class="note">${"★".repeat(p.note)}${"☆".repeat(5 - p.note)} <span>(${p.avis})</span></p>
      <p class="prix">${prixMarque(p.prix)} <span class="ancien-prix">${prixMarque(p.ancienPrix)}</span></p>
    </article>`;
}

// Une zone complète pour une marque
function creerZoneMarque(marque) {
  const articles = produits.concat(flash).filter(function (p) {
    return p.marque === marque.nom;
  });

  if (articles.length === 0) {
    return;   // aucun produit de cette marque : pas de zone
  }

  let cartes = "";
  articles.forEach(function (p) {
    cartes = cartes + carteMarque(p);
  });

  const zone = document.createElement("section");
  zone.className = "pub-marque";
  zone.style.setProperty("--couleur", marque.couleur);

  zone.innerHTML = `
    <div class="pub-marque-entete">
      <div>
        <span class="etiquette-pub">Sponsorisé</span>
        <h2>${marque.nom}</h2>
      </div>
      <a href="catalogue.html?marque=${marque.nom}" class="voir-plus">Voir plus &rarr;</a>
    </div>

    <div class="rangee">
      <button type="button" class="rangee-fleche gauche" aria-label="Précédent">&#10094;</button>
      <div class="rangee-defile">${cartes}</div>
      <button type="button" class="rangee-fleche droite" aria-label="Suivant">&#10095;</button>
    </div>`;

  // Les flèches de cette zone
  const defile = zone.querySelector(".rangee-defile");

  zone.querySelector(".rangee-fleche.droite").addEventListener("click", function () {
    defile.scrollBy({ left: defile.clientWidth * 0.8, behavior: "smooth" });
  });

  zone.querySelector(".rangee-fleche.gauche").addEventListener("click", function () {
    defile.scrollBy({ left: -defile.clientWidth * 0.8, behavior: "smooth" });
  });

  document.querySelector("#zones-marques").appendChild(zone);
}

marquesPub.forEach(creerZoneMarque);
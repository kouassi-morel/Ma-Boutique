// ----- Menu ☰ (téléphone) -----
const enTete = document.querySelector(".en-tete");
const boutonMenu = document.querySelector(".btn-menu");

boutonMenu.addEventListener("click", function () {
  const ouvert = enTete.classList.toggle("menu-ouvert");
  boutonMenu.innerHTML = ouvert ? "&#10005;" : "&#9776;";   // ✕ ou ☰
});

// Un clic sur un lien referme le menu
document.querySelectorAll(".navigation a").forEach(function (lien) {
  lien.addEventListener("click", function () {
    enTete.classList.remove("menu-ouvert");
    boutonMenu.innerHTML = "&#9776;";
  });
});

// ----- Bouton retour en haut -----
const boutonHaut = document.querySelector("#btn-haut");

if (boutonHaut) {
  window.addEventListener("scroll", function () {
    boutonHaut.classList.toggle("visible", window.scrollY > 400);
  });

  boutonHaut.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
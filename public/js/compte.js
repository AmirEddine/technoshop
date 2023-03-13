
/** Élément HTML du bouton pour désinscrire d'une activitie . */
let desinscrireActivities = document.querySelectorAll("#desinscireActivitie");

const desinscrireActivitie = (id) => {
  // Listeners pour le clic pour désinscrire a une activitie
  let data = {
    id_produit: parseInt(id),
  };
  fetch(`/compte`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};
desinscrireActivities.forEach((activitie) => {
  activitie.addEventListener("click", (event) => {
    desinscrireActivitie(event.currentTarget.dataset.id);
    location.reload();
  });
});

let addquantite = document.querySelectorAll("#addquantite");
console.log(addquantite)
//Fonction qui inscrit l'utilisateur au cour
const addquantites = (id,nb_produit) => {
  // Listeners pour le clic pour inscrire a une activitie
  let data = {
    id_produit: id,
    nb_produit:Number(nb_produit)+1
  };
  fetch(`/compte`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};
addquantite.forEach((activitie) => {
  activitie.addEventListener("click", (event) => {
    console.log(event.currentTarget.dataset.nb_produit+"  "+event.currentTarget.dataset.nb_produit)
    addquantites(event.currentTarget.dataset.id,event.currentTarget.dataset.nb_produit);
  });
});

let decrisequantite = document.querySelectorAll("#decrisequantite");
console.log(addquantite)
//Fonction qui inscrit l'utilisateur au cour
const decrisequantites = (id,nb_produit) => {
  // Listeners pour le clic pour inscrire a une activitie
  let data = {
    id_produit: id,
    nb_produit:Number(nb_produit)-1
  };
  fetch(`/compte`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};
decrisequantite.forEach((activitie) => {
  activitie.addEventListener("click", (event) => {
    console.log(event.currentTarget.dataset.nb_produit+"  "+event.currentTarget.dataset.nb_produit)
    decrisequantites(event.currentTarget.dataset.id,event.currentTarget.dataset.nb_produit);
  });
});

/** Élément HTML du bouton pour inscrire a une activitie. */

let inscrireActivities = document.querySelectorAll("#inscireActivitie");
//Fonction qui inscrit l'utilisateur au cour
const inscrireActivitie = (id,nb_produit) => {
  // Listeners pour le clic pour inscrire a une activitie
  let data = {
    id_produit: id,
    nb_produit:nb_produit+1
  };
  fetch(`/activitie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};
inscrireActivities.forEach((activitie) => {
  activitie.addEventListener("click", (event) => {
    inscrireActivitie(event.currentTarget.dataset.id,event.currentTarget.dataset.nb_produit);
  });
});

function search_animal() {
  let input = document.getElementById('searchbar').value
  input=input.toLowerCase();
  let x = document.getElementsByClassName('nomsearch');
  let divProduit = document.getElementsByClassName('divproduit');

   console.log(input)
 let i ;
  for (i = 0; i < x.length; i++) { 
      if (!x[i].innerHTML.toLowerCase().includes(input)) {
          divProduit[i].style.display="none";
      }
      else {
        divProduit[i].style.display="flex";                 
      }
  }
}
document.getElementById('searchbar').addEventListener('keyup', search_animal);


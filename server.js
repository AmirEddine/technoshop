// Aller chercher les configurations de l'application
import "dotenv/config";

// Importer les fichiers et librairies
import https from "https";
import { readFile } from "fs/promises";
import express, { json, request, response } from "express";
import helmet from "helmet";
import compression from "compression";
import session from "express-session";
import memorystore from "memorystore";
import cors from "cors";
import passport from "passport";
import middlewareSse from "./middleware-sse.js";
import {
  DesabonnerCours,
  getActivities,
  getActivitiesUser,
  sinscrireCours,
  supprimActivite,
  ajouterActivite,
  getUseraActi,
  getId,
  Addquantite,
  getnombreuser
} from "./model/activities.js";
import { ajouteruser } from "./model/utilisateur.js";
import { engine } from "express-handlebars";
import {
  validateActivitie,
  validateIdActivitie,
  validateCreationUser,
  validateConnexionUser,
} from "./validation.js";
import "./authentification.js";

// Création du serveur
const app = express();
app.enable('trust proxy');

// Création de l'engin dans Express
app.engine(
  "handlebars",
  engine({
  })
);

// Mettre l'engin handlebars comme engin de rendu
app.set("view engine", "handlebars");

// Configuration de handlebars
app.set("views", "./views");
// Créer le constructeur de base de données
const MemoryStore = memorystore(session);

// Ajout de middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(json());
app.use(
  session({
    cookie: { maxAge: 1800000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 1800000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(middlewareSse());
app.use(express.static("public"));

//*************************************************Les pages du site********************************************** */

//-----------------------------Page Activities---------------------------------

app.get("/activitie", async (request, response) => {
  if (request.user) {
    // si utilisateur est connecté on recuper ses activites
    let tabCoursUtilisateur = await getActivitiesUser(request.user.courriel);
    let activities = await getActivities();
    let tableid_produitsUtilisateur = [];
    let dataFinal = [];
    //remplir la table par les id des cours inscrit par l'utilisateur
    for (let i = 0; i < tabCoursUtilisateur.length; i++)
      tableid_produitsUtilisateur.push(tabCoursUtilisateur[i].id_produit);

    //on a bouclé sur les données reçu de la base de données() et les modifier avant de les passer à handlebars dans la fonction render
    for (const element of activities) {
     
      dataFinal.push({
        id_produit: element.id_produit,
        nom: element.nom,
        quantite:element.quantite,
        description: element.description,
        prix:element.prix,
        nb_produit:element.nb_produit,
        inscrit: tableid_produitsUtilisateur.includes(element.id_produit),
      });
    }
    
    response.render("Activitie", {
      titre: "Activitie",
      scripts: ["/js/main.js"],
      accept: request.session.accept,
      user: request.user,
      isAdmin: request.user?.id_type_utilisateur === 2,
      activities: dataFinal,
    });
  } else {
    response.redirect("/");
  }
});
//-----------------------------Page Contact---------------------------------
app.get("/Contact", async (request, response, next) => {
  if (request.user) {
    response.render("Contact", {
      titre: "Contact Nous",
      scripts: ["/js/main.js"],
      accept: request.session.accept,
      user: request.user,
      isAdmin: request.user?.id_type_utilisateur === 2
     
    });

  }
  else {
    response.redirect("/activitie");
  }


});

//-----------------------------Page Administrateur---------------------------------
app.get("/admin", async (request, response, next) => {
  //Si utilisateur n'est pas connecté
  if (!request.user) {
    response.sendStatus(401);
  }
  //Si utilisateur est connecté mais pas administrateur(pas droit d'accés a la page admin)
  else if (request.user.id_type_utilisateur !== 2) {
    response.sendStatus(403);
  }
  //Si utilisateur est administrateur
  else {
    let activities = await getActivities();
    let utilisateurs = [];

    let dataFinal = [];
    for (const element of activities) {
      dataFinal.push({
        id_produit: element.id_produit,
        nom: element.nom,
        quantite:element.quantite,
        description: element.description,
        prix:element.prix,
        utilisateurs: await getUseraActi(element.id_produit),//Pour recupere tous les utilisateur inscrit pour un cour bien definit
      });
    }
    response.render("admin", {
      titre: "admin",
      scripts: ["/js/Administration.js"],
      accept: request.session.accept,
      user: request.user,
      isAdmin: request.user?.id_type_utilisateur === 2,
      activities: dataFinal,
      utilisateurs: utilisateurs,
    });
  }
});
//-----------------------------Page Compte utilisateur---------------------------------

app.get("/compte", async (request, response) => {
  
  if (request.user) {
    //Récuperation de toutes les activité de utilisateur
    let tabCoursUtilisateur = await getActivitiesUser(request.user.courriel);
    let dataFinal = [];
    let tch = 0;
    
    for (const element of tabCoursUtilisateur) {
       
      dataFinal.push({
        id_produit: element.id_produit,
        nom: element.nom,
        quantite:element.quantite,
        nb_produit:element.nb_produit,
        description: element.description,
        prix:element.prix,
        insecrit: true,
        eglaaOne :  Number(element.nb_produit)  === 1 ? true :  false,
        eglaaSexty:  Number(element.nb_produit)  === Number(element.quantite) ? true :  false
      });
    }
    for (const element of  dataFinal) {
      tch=tch+ (element.prix*element.nb_produit)
    }
    response.render("compte", {
      titre: "compte",
      scripts: ["/js/compte.js"],
      accept: request.session.accept,
      user: request.user,
      isAdmin: request.user?.id_type_utilisateur == 2,
      activitiesUser: dataFinal, 
      total:tch.toFixed(2),
    });
  }
  //Si utilisateur n'est pas connecté on va le rediriger vers la page d'accueil
  else {
    response.redirect("/"); //Redirection vers la page de connection
  }
});

//-----------------------------Page Creation---------------------------------
app.get("/creation", (request, response) => {
  response.render("creation", {
    titre: "creation",
    scripts: ["/js/creation.js"],
    accept: request.session.accept,
  });
});

//-----------------------------Page Connexion---------------------------------
app.get("/", (request, response) => {
  response.render("connection", {
    titre: "connection",
    scripts: ["/js/connexion.js"],
    accept: request.session.accept,
  });
});
//*************************************************Programmation des routes********************************************** */
//-----------------------------Route Principale - connection- ---------------------------------
app.post("/", (request, response, next) => {
  //Validation
  if (validateConnexionUser(request.body)) {
    passport.authenticate("local", (error, user, info) => {
      if (error) {
        next(error);
      } else if (!user) {
        response.status(401).json(info);
      } else {
        request.logIn(user, (error) => {
          if (error) {
            next(error);
          } else {
            response.status(200).end();
          }
        });
      }
    })(request, response, next);
  } else {
    response.status(400).end();
  }
});

//-----------------------------Route Activitie ---------------------------------
//Ajout de cour
app.route("/activitie").post(async (request, response) => {
  if (!request.user) {
    response.status(401).end();
  } else {
    sinscrireCours(request.body.id_produit, request.user.courriel, request.body.nb_produit);
    response.sendStatus(200);
    response.pushJson(
      {
        id_produit: request.body.id_produit,
        nom: request.user.nom,
        prenom: request.user.prenom,
        id_user: request.user.id_utilisateur,
      },
      "add-CoursUser"
    );
  }
});


//-----------------------------Route Compte ---------------------------------
//Désabonner de cour
app.route("/compte").delete(async (request, response) => {
  if (!request.user) {
    response.status(401).end();
  } else {
    if (validateIdActivitie(request.body.id_produit)) {
      DesabonnerCours(request.body.id_produit, request.user.courriel);
      response.sendStatus(200);
      response.pushJson(
        {
          id_produit: request.body.id_produit,
          id_user: request.user.id_utilisateur,
        },
        "desabonner-CourUser"
      );
    } else response.status(400).end();
  }
});

app.route("/compte").put(async (request, response) => {
  if (!request.user) {
    response.status(401).end();
  } else {
    
    Addquantite(request.body.id_produit, request.user.id_utilisateur, request.body.nb_produit);
    response.sendStatus(200);
    response.pushJson(
      {
        id_produit: request.body.id_produit,
        id_user: request.user.id_utilisateur,
        nb_produit:request.body.nb_produit
      },
      "addquantite-CourUser"
    );
  
  }
});
//-----------------------------Route Administrateur ---------------------------------
//1- Suppression de cours
app.route("/admin").delete(async (request, response) => {
  if (!request.user) {
    response.status(401).end();
  } else if (request.user.id_type_utilisateur != 2) {
    response.status(403).end();
  } else {
    
      supprimActivite(request.body.id_produit);
      response.sendStatus(200);
      response.pushJson(
        {
          id_produit: request.body.id_produit,
        },
        "sup-CoursM"
      );
  }
});

//2- Ajout de cours--Formulaire
app.route("/admin").post(async (request, response) => {
  if (!request.user) {
    response.status(401).end();
  } else if (request.user.id_type_utilisateur != 2) {
    response.status(403).end();
  } else {
      let data = ajouterActivite(
        request.body.nom,
        request.body.quantite,
        request.body.description,
        request.body.prix
      );
      response.status(201).json(data);
      let id = Object.values(await getId());
      response.pushJson(
        {
          id_produit: Object.values(id[0]),
          nom: request.body.nom,
          quantite : request.body.quantite,
          description:request.body.description,
          prix: request.body.prix
        },
        "add-Activitie"
      );
  }
});
//-----------------------------Route Creation de compte ---------------------------------
app.route("/creation").post(async (request, response, next) => {
  if (validateCreationUser(request.body)) {
    try {
      let data = await ajouteruser(
        request.body.nomUser,
        request.body.prenomUser,
        request.body.courriel,
        request.body.password
      );
      response.status(201).json(data);
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT") {
        response.status(409).end();
      } else {
        next(error);
      }
    }
  } else {
    response.status(400).end();
  }
});

//-----------------------------Route deconnexion---------------------------------
app.post("/deconnexion", function (request, response, next) {
  request.logout(function (error) {
    if (error) {
      return next(error);
    }
    response.redirect("/");
  });
});

//-----------------------------Route Session ---------------------------------
app.post("/accept", (request, response) => {
  request.session.accept = true;
  response.status(200).end();
});
//-----------------------------Route Streaming- ---------------------------------
app.get("/stream", (request, response, next) => {
  if (request.user?.id_type_utilisateur === 2) {
    response.initStream();
  } else {
    response.status(401).end();
  }
});
//*************************************************Démarrage du serveur - Securité avec HTTPS ********************************************** */
if (process.env.NODE_ENV === "production") {
  app.listen(process.env.PORT);
  console.info(`Serveurs démarré:`);
  console.info(`http://localhost:${process.env.PORT}`);
} else {
  const credentials = {
    key: await readFile("./security/localhost.key"),
    cert: await readFile("./security/localhost.cert"),
  };
  https.createServer(credentials, app).listen(process.env.PORT);
  console.info(`Serveurs démarré:`);
  console.info(`https://localhost:${process.env.PORT}`);
}

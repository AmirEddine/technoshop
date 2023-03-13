import { existsSync } from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

/**
 * Constante indiquant si la base de données existe au démarrage du serveur
 * ou non.
 */
const IS_NEW = !existsSync(process.env.DB_FILE);

/**
 * Crée une base de données par défaut pour le serveur. Des données fictives
 * pour tester le serveur y ont été ajouté.
 */
const createDatabase = async (connectionPromise) => {
  let connection = await connectionPromise;

  await connection.exec(
    `CREATE TABLE IF NOT EXISTS type_utilisateur(
            id_type_utilisateur INTEGER PRIMARY KEY,
            type TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS utilisateur(
            id_utilisateur INTEGER PRIMARY KEY,
            id_type_utilisateur INTEGER NOT NULL,
            courriel TEXT NOT NULL UNIQUE,
            mot_passe TEXT NOT NULL,
            prenom TEXT NOT NULL,
            nom TEXT NOT NULL,
            CONSTRAINT fk_type_utilisateur 
                FOREIGN KEY (id_type_utilisateur)
                REFERENCES type_utilisateur(id_type_utilisateur) 
                ON DELETE SET NULL 
                ON UPDATE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS produit(
            id_produit INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            description TEXT NOT NULL,
            quantite INTEGER NOT NULL,
           
            prix REAL NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS panier_utilisateur(
            id_produit INTEGER,
            id_utilisateur INTEGER,
            nb_produit INTEGER NOT NULL,
            PRIMARY KEY (id_produit, id_utilisateur),
            CONSTRAINT fk_panier_utilisateur 
                FOREIGN KEY (id_produit)
                REFERENCES produit(id_produit) 
                ON DELETE SET NULL 
                ON UPDATE CASCADE,
            CONSTRAINT fk_utilisateur_panier 
                FOREIGN KEY (id_utilisateur)
                REFERENCES utilisateur(id_utilisateur)
                ON DELETE SET NULL 
                ON UPDATE CASCADE
        );
        
        INSERT INTO type_utilisateur (type) VALUES 
            ('regulier'),
            ('administrateur');

        INSERT INTO utilisateur (id_type_utilisateur, courriel, mot_passe, prenom, nom) VALUES 
            (1, 'john_doe@gmail.com', 'passw0rd', 'John', 'Doe'),
            (1, 'sera@gmail.com', 'passw0rd', 'Seraphina', 'Lopez'),
            (1, 'arlo_shield@gmail.com', 'passw0rd', 'Arlo', 'Shield'),
            (1, 'blyke_ray@gmail.com', 'passw0rd', 'Blyke', 'Leclerc'),
            (1, 'remi_fast@gmail.com', 'passw0rd', 'Remi', 'Smith'),
            (1, 'isen_radar@gmail.com', 'passw0rd', 'Isen', 'Turner'),
            (1, 'elaine_doc@gmail.com', 'passw0rd', 'Elaine', 'Nelson'),
            (1, 'zeke_the_form@gmail.com', '1234', 'Zeke', 'Anderson'),
            (2, 'admin@gmail.com', 'admin123', 'Admin', 'Admin');
            
            INSERT INTO produit (nom, quantite,prix,description) VALUES 
            ('Iphone 13 Pro', 100,1200.99,'Il est équipé un écran OLED de 6,1 pouces 120 Hz, un SoC Apple A15 Bionic compatible 5G.'),
             ('Acer Ordinateur portable',  60,500.99,'Aspire 5 Slim, écran Full HD IPS de 15,6, AMD Ryzen 3 3200U, Vega 3 Graphics, 4 Go DDR4, 128 Go SSD, clavier rétroéclairé, Windows 10 en mode S, A515-43-R19L, argenté.'),
             ('Canon EOS Rebel T7', 50,514.99,'Appareil photo numérique avec objectif IS II 18-55 mm, noir.'),
             ('Galaxy S23 Ultra', 45, 1600.99,'Samsung Galaxy S23 Ultra 5G Crème 512 Go – Écran AMOLED 6,8 120 Hz, appareil photo arrière 200 MP + 12 MP + 10 MP + 10 MP, appareil photo selfie 12 MP, vidéo 8 K, stylet inclus, nightographie.'),
            ('Samsung Moniteur T55',  30, 400.99, 'Samsung Moniteur T55 27 | Moniteur incurvé (LC27T550FDNXZA) – Courbe, 1000R, 1080p, 4ms, AMD Freesync, HDMI, DP.'),
            ('Apple iPad',  40 , 315.99, 'Apple iPad 9,7 avec WiFi 32 Go - Gris sidéral modèle 2017.');
            
        
      INSERT INTO panier_utilisateur (id_produit, id_utilisateur,nb_produit) VALUES 
            (1, 5,1),
            (1, 6,1),
            (1, 7,1),
            (2, 2,1),
            (2, 3,1),
            (3, 9,1),
            (6, 4,1),
            (6, 5,1),
            (6, 6,1),
            (6, 7,1),
            (6, 8,1),
            (5, 2,1),
            (5, 3,1),
            (5, 4,1),
            (5, 5,1),
            (4, 6,1),
            (4, 7,1),
            (4, 8,1);`
  );

  return connection;
};

// Base de données dans un fichier
let connectionPromise = open({
  filename: process.env.DB_FILE,
  driver: sqlite3.Database,
});

// Si le fichier de base de données n'existe pas, on crée la base de données
// et on y insère des données fictive de test.
if (IS_NEW) {
  connectionPromise = createDatabase(connectionPromise);
}

export default connectionPromise;



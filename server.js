// Importation des modules nécessaires
const express = require("express");
const puppeteer = require("puppeteer");
const axios = require("axios");
const { timeout } = require("puppeteer");

// Création de l'application Express
const app = express();
const port = 5050; // Port sur lequel le serveur écoutera
const API_URL = "https://api-goal-diary.com";
let browsers = []; // Instance de navigateur Puppeteer

// Fonction pour initialiser Puppeteer
const initPuppeteer = async () => {
  const browser = await puppeteer.launch({ headless: true });
  browsers.push(browser); // Ajouter l'instance de navigateur au tableau
};
// Middleware pour parser le corps de la requête en JSON
app.use(express.json());

// Définition de l'endpoint
app.post("/xan", async (req, res) => {
  try {
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (error) {
        return false;
      }
    };
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const account = await axios
      .get(`${API_URL}/items/account/${req.body.account_id}`)
      .then((res) => res.data.data);
    const process = await axios
      .get(
        `${API_URL}/items/process_xan/${
          account.process_xan.sort((a, b) => b - a)[0]
        }`
      )
      .then((res) => res.data.data);
    const updateProcess = async (payload) =>
      await axios
        .patch(`${API_URL}/items/process_xan/${process.id}`, payload)
        .then((res) => res.data.data);
    const deleteProcess = async () =>
      await axios.delete(`${API_URL}/items/process_xan/${req.body.process}`);
    await initPuppeteer();
    const index = browsers.length;

    const browser = browsers[index - 1];

    // Utilisation de l'instance Puppeteer pour effectuer des opérations
    // browser.on("disconnected", async () => {
    //   await deleteProcess();
    // });
    let page = await browser.newPage();
    const start = async () => {
      try {
        await page.goto("https://www.instagram.com/", { timeout: 90000 });
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }

      // Traiter les données de la requête
      // console.log(req.body);
      // Obtenir tous les boutons de la page
      let buttons;
      try {
        buttons = await page.$$("button");
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      // Parcourir les boutons pour trouver celui contenant le texte "Autoriser tous les cookies"
      for (const button of buttons) {
        try {
          const buttonText = await button.evaluate((node) => node.textContent);
          if (buttonText.includes("Autoriser tous les cookies")) {
            await button.click();
            break; // Arrêter la boucle une fois que le bouton est cliqué
          }
        } catch (error) {
          await updateProcess({
            status: "debug",
            error_message: error.message,
          });
          res.status(500).send();
        }
      }
      const userNameSelector = `input[name="username"]`;
      try {
        await page.waitForSelector(userNameSelector);
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      try {
        await page.type(userNameSelector, `${account.email}`);
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      const passwordSelector = `input[name="password"]`;
      try {
        await page.waitForSelector(passwordSelector);
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      try {
        await page.type(passwordSelector, `${account.password}`);
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      try {
        await page.keyboard.press("Enter");
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      try {
        await page.waitForNavigation({ timeout: 90000 });
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      try {
        await page.waitForSelector('div[role="button"]');
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      let divLaters;
      try {
        divLaters = await page.$$('div[role="button"]');
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      for (const button of divLaters) {
        try {
          const buttonText = await button.evaluate((node) => node.textContent);
          if (buttonText.includes("Plus tard")) {
            await button.click();
            break; // Arrêter la boucle une fois que le bouton est cliqué
          }
        } catch (error) {
          await updateProcess({
            status: "debug",
            error_message: error.message,
          });
          res.status(500).send();
        }
      }
      try {
        await page.waitForSelector("button");
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      let buttonLaters;
      try {
        buttonLaters = await page.$$("button");
      } catch (error) {
        await updateProcess({ status: "debug", error_message: error.message });
        res.status(500).send();
      }
      for (const button of buttonLaters) {
        try {
          const buttonText = await button.evaluate((node) => node.textContent);
          if (buttonText.includes("Plus tard")) {
            await button.click();
            break; // Arrêter la boucle une fois que le bouton est cliqué
          }
        } catch (error) {
          await updateProcess({
            status: "debug",
            error_message: error.message,
          });
          res.status(500).send();
        }
      }
    };
    console.log(req.body);
    console.log("logProcess", process);
    const profils = req.body.data;

    const processFollow = async () => {
      for (const profil of profils) {
        let currentDate = new Date();
        let currentHour = currentDate.getHours();
        let currentMinute = currentDate.getMinutes();
        let currentTime = currentHour * 100 + currentMinute;
        const startTime =
          parseInt(req.body.start.split(":")[0]) * 100 +
          parseInt(req.body.start.split(":")[1]);
        const endTime =
          parseInt(req.body.end.split(":")[0]) * 100 +
          parseInt(req.body.end.split(":")[1]);
        console.log(startTime);
        console.log(endTime);
        console.log(currentTime);
        const isGoodTime = (currentTime) => {
          if (startTime > endTime) {
            return currentTime < startTime && currentTime > endTime;
          } else {
            return currentTime < startTime || currentTime > endTime;
          }
        };
        // Vérifier si l'heure actuelle est comprise entre les heures spécifiées
        if (isGoodTime(currentTime)) {
          console.log("Dans les heures spécifiées, en attente...");
          const currentUrl = await page.url();
          console.log(currentUrl);
          // Vérifier si l'URL de la page contient "instagram"

          await new Promise((resolve) => {
            setTimeout(async () => {
              try {
                if (
                  profil.URLProfil.includes("https://www.instagram.com/") &&
                  isValidUrl(profil.URLProfil)
                ) {
                  await page.goto(profil.URLProfil);
                } else {
                  resolve();
                }
                // Autres opérations sur la page...
              } catch (error) {
                console.error(
                  `Erreur lors de la navigation vers ${profil.URLProfil}:`,
                  error.message
                );
                await updateProcess({
                  status: "error",
                  error_message: error.message,
                });
                res.status(500).send();
                // Passez simplement au profil suivant en continuant la boucle
                resolve();
              }
              try {
                await page.waitForSelector("button");
              } catch (error) {
                console.log(error);
                await updateProcess({
                  status: "error",
                  error_message: error.message,
                });
                res.status(500).send();
                resolve();
              }
              resolve(); // Marquer la promesse comme résolue après l'exécution du code
            }, (60 / req.body.counthour) * 60 * 1000);
          });
        } else {
          console.log("Hors des heures spécifiées, en pause...");
          // Ajoutez ici votre logique pour fermer la page
          // Fermeture de la page
          await page.close();

          // Attendre jusqu'à ce que l'heure soit à nouveau dans la plage spécifiée
          while (!isGoodTime(currentTime)) {
            await delay(60000); // Attendre 1 minute avant de vérifier à nouveau l'heure
            currentDate = new Date();
            currentHour = currentDate.getHours();
            currentMinute = currentDate.getMinutes();
            currentTime = currentHour * 100 + currentMinute;
          }
          if (isGoodTime(currentTime)) {
            page = await browser.newPage();
            // await start();
            await new Promise((resolve) => {
              setTimeout(async () => {
                try {
                  if (
                    profil.URLProfil.includes("https://www.instagram.com/") &&
                    isValidUrl(profil.URLProfil)
                  ) {
                    await page.goto(profil.URLProfil);
                  } else {
                    resolve();
                  }
                  // Autres opérations sur la page...
                } catch (error) {
                  console.error(
                    `Erreur lors de la navigation vers ${profil.URLProfil}:`,
                    error.message
                  );
                  await updateProcess({
                    status: "error",
                    error_message: error.message,
                  });
                  res.status(500).send();
                  // Passez simplement au profil suivant en continuant la boucle
                  resolve();
                }

                try {
                  await page.waitForSelector("button");
                } catch (error) {
                  console.log(error);
                  await updateProcess({
                    status: "error",
                    error_message: error.message,
                  });
                  res.status(500).send();
                  resolve();
                }
                resolve(); // Marquer la promesse comme résolue après l'exécution du code
              }, (60 / req.body.counthour) * 60 * 1000);
            });
          }
        }
      }
    };

    try {
      await start();
    } catch (error) {
      await updateProcess({ status: "debug", error_message: error.message });
      res.status(500).send();
    }
    try {
      await processFollow();
      console.log("end");
      await updateProcess({ status: "success" });
      await browser.close();
      res.status(200).send();
    } catch (error) {
      await updateProcess({ status: "error", error_message: error.message });
      res.status(500).send();
    }

    // const processFollow = async () => {
    //   for (const profil of profils) {
    //     await new Promise((resolve) => {
    //       setTimeout(async () => {
    //         await page.goto(profil.URLProfil);
    //         await page.waitForSelector("button");
    //         resolve(); // Marquer la promesse comme résolue après l'exécution du code
    //       }, (60 / req.body.counthour) * 60 * 1000);
    //     });
    //   }
    // };

    // const buttons = await page.$$("button");

    // // Parcourir tous les boutons pour trouver celui avec le texte "Suivre"
    // for (const button of buttons) {
    //   try {
    //     // Trouver la div à l'intérieur du bouton
    //     const divInsideButton = await button.$("div > div");

    //     if (divInsideButton) {
    //       // Récupérer le texte de la div
    //       const divText = await divInsideButton.evaluate((node) =>
    //         node.textContent.trim()
    //       );

    //       if (divText.includes("Suivre")) {
    //         await button.click();

    //         break; // Arrêter la boucle une fois que le bouton est cliqué
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Erreur lors du traitement du bouton :", error);
    //   }
    // }
    // setTimeout(async () => {
    //   await page.goto(`${profil.URLProfil}`);

    //   await page.waitForSelector("button");
    // }, (60 / req.body.counthour) * 60 * 1000);
    // Récupérer tous les boutons de la page

    // console.log(buttonLater);
    // Attendre que la div contenant le texte "Plus tard" soit chargée
    // const waitLater = await page.evaluate(() => {
    //   try {
    //     console.log("Dans la fonction d'évaluation");
    //     // Trouver tous les éléments ayant un attribut role égal à "button"
    //     const buttons = Array.from(
    //       document.querySelectorAll('div[role="button"]')
    //     );
    //     console.log("Elements boutons trouvés :", buttons.length);
    //     // Filtrer les éléments pour trouver celui contenant le texte "Plus tard"
    //     const waitLaterElement = buttons.find((button) =>
    //       button.textContent.includes("Plus tard")
    //     );
    //     console.log("Element trouvé :", waitLaterElement);
    //     // Renvoyer l'élément trouvé
    //     return waitLaterElement;
    //   } catch (error) {
    //     console.error("Erreur dans la fonction d'évaluation :", error);
    //     return null;
    //   }
    // });

    // await page.keyboard.press("Tab");
    // await page.keyboard.press("Tab");
    // await page.keyboard.press("Enter");
    // const loginButton = await page.waitForSelector('button[type="submit"]');

    // console.log(loginButton);
    // await loginButton.click();
    // await page.click('button[type="submit"]');
    // Attendre un court instant pour vérifier le résultat
    // await page.waitFor(2000);
    // Fermer la page
    // await page.close();

    // Envoyer la réponse
  } catch (error) {
    console.error(error);
    await updateProcess({ status: "error", error_message: error.message });
    res.status(500).send();
  }
});

// Démarrage du serveur et initialisation de Puppeteer
app.listen(port, async () => {
  try {
    console.log(`Serveur démarré sur le port ${port}`);
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Puppeteer:", error);
    await updateProcess({ status: "error", error_message: error.message });
    res.status(500).send();
    process.exit(1);
  }
});

// Gestionnaire pour fermer le navigateur lorsque le serveur est arrêté
process.on("SIGINT", async () => {
  try {
    await browser.close();
    await updateProcess({ status: "error" });
    console.log("Navigateur Puppeteer fermé.");
    process.exit();
  } catch (error) {
    console.error("Erreur lors de la fermeture de Puppeteer:", error);
    process.exit(1);
  }
});

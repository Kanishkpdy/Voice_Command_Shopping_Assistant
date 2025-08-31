export default {
  keywords: {
    add: ["ajouter", "acheter", "obtenir"],
    remove: ["supprimer", "retirer", "effacer"],
    search: ["chercher", "trouver", "rechercher"],
    increase: ["augmenter", "plus"],
    decrease: ["diminuer", "moins"],
    ignore: []
  },
  messages: {
    added: "Ajouté {quantity} × {item} à votre liste",
    removed: "Supprimé {item} de votre liste",
    increased: "Augmenté {item} de {quantity}, total maintenant {total}",
    decreased: "Diminué {item} de {quantity}, total maintenant {total}",
    notFound: "{item} introuvable dans votre liste",
    found: "{count} articles trouvés correspondant à la recherche",
    help: "Dites 'Ajouter lait' ou 'Supprimer pain' pour gérer votre liste",
    substituteFor: "Vous pouvez utiliser {item} comme substitut"
  }
};

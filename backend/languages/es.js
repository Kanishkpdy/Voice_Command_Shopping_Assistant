export default {
  keywords: {
    add: ["agregar", "comprar", "obtener"],
    remove: ["eliminar", "quitar", "borrar"],
    search: ["buscar", "encontrar"],
    increase: ["aumentar", "más"],
    decrease: ["disminuir", "menos"],
    ignore: []
  },
  messages: {
    added: "Agregado {quantity} × {item} a tu lista",
    removed: "Eliminado {item} de tu lista",
    increased: "Aumentado {item} por {quantity}, total ahora {total}",
    decreased: "Disminuido {item} por {quantity}, total ahora {total}",
    notFound: "{item} no se encuentra en tu lista",
    found: "Encontrados {count} artículos coincidentes",
    help: "Di 'Agregar leche' o 'Eliminar pan' para administrar tu lista",
    substituteFor: "Puedes usar {item} como sustituto"
  }
};

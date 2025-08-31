export default {
  keywords: {
    add: ["add", "buy", "get"],
    remove: ["remove", "delete"],
    search: ["search", "find", "look for"],
    increase: ["increase", "more", "add more"],
    decrease: ["decrease", "less", "reduce"],
    ignore: []
  },
  messages: {
    added: "Added {quantity} × {item} to your list",
    removed: "Removed {item} from your list",
    increased: "Increased {item} by {quantity}, total now {total}",
    decreased: "Decreased {item} by {quantity}, total now {total}",
    notFound: "{item} not found in your list",
    found: "Found {count} items matching your search",
    help: "Say 'Add milk' or 'Remove bread' to manage your list",
    substituteFor: "You could use {item} as a substitute"
  }
};

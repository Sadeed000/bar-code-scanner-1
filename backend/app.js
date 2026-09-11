// Both entry points use the same routes, frontend build, and upload directory.
const { bootstrap } = require("./src/app");
bootstrap().catch(error => { console.error(error); process.exit(1); });

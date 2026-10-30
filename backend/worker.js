import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";
import db from "./src/db.js";
import app from "./src/server.js";

db.config.getUrl = () => env.HYPERDRIVE.connectionString;

app.listen(3000);
export default httpServerHandler({ port: 3000 });
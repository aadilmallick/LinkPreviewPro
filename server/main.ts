// deno-types=npm:@types/express
import express, { type Request, Response, NextFunction } from "npm:express";
import { registerRoutes } from "./routes.ts";
import dotenv from "npm:dotenv";
import process from "node:process";
import path from "node:path";
// @deno-types=npm:@types/cors
import cors from "npm:cors";

dotenv.config();

// if (Deno.env.get("DENO_ENV") === "development") {
//   const cmd = new Deno.Command("npm", {
//     args: ["run", "build"],
//     cwd: "../client",
//     env: {
//       NODE_ENV: "production",
//     },
//   });
//   const { stdout, stderr } = await cmd.output();
//   console.log(stdout.toString());
//   console.log(stderr.toString());
// }

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // credentials: true,
    allowedHeaders: "*",
  })
);

const frontendPath = path.resolve("dist");
// const frontendPath = "dist";

// Serve static files from client/dist
app.use(express.static(frontendPath));

const server = registerRoutes(app);

server.get("*any", (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

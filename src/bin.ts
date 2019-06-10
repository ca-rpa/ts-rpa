#!/usr/bin/env node
import { readFileSync } from "fs";
import * as ts from "typescript";
import { Script } from "vm";
import * as program from "commander";
import * as readline from "readline";
import { google } from "googleapis";

import Module = require("module");
require("pkginfo")(module);

let filename;
program
  .option("-g, --google-auth", "Getting Google OAuth Access Token.")
  .option("-r, --require", "Require a node module before execution.")
  .version(module.exports.version, "-v, --version")
  .usage("<file>")
  .action(
    (fileArg): void => {
      filename = fileArg;
    }
  );

program.parse(process.argv);

if (typeof filename === "undefined") {
  process.exit(0);
}

// Require specified modules before start-up.
if (program.require) (Module as any)._preloadModules(program.require); // eslint-disable-line no-underscore-dangle

function getGoogleApisNewToken(): void {
  const credentials = {
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    clientId: process.env.GOOGLE_CLIENT_ID,
    redirectUrl: "urn:ietf:wg:oauth:2.0:oob"
  };
  const client = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUrl
  );
  const authUrl = client.generateAuthUrl({
    access_type: "offline", // eslint-disable-line @typescript-eslint/camelcase
    scope: "https://www.googleapis.com/auth/drive"
  });
  console.log("Authorize this app by visiting this url: \n ", authUrl); // eslint-disable-line no-console
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(
    "\nEnter the code from that page here: ",
    async (code: string): Promise<void> => {
      rl.close();
      const res = await client.getToken(code);
      console.log("\n", res.tokens); // eslint-disable-line no-console
    }
  );
}

(async (): Promise<void> => {
  if (program.googleAuth) {
    getGoogleApisNewToken();
    return;
  }

  const code = readFileSync(filename, "utf8");
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2018
  };
  const transpiledCode = ts.transpile(code, options);
  const script = new Script(transpiledCode, {
    displayErrors: true,
    filename
  });

  const module = new Module(filename);
  module.filename = filename;
  module.paths = (Module as any)._nodeModulePaths(filename); // eslint-disable-line no-underscore-dangle

  (global as any).exports = module.exports;
  (global as any).module = module;
  (global as any).require = module.require.bind(module);

  const hardFixScript = new Script("exports = module.exports", {
    displayErrors: true,
    filename
  });

  await hardFixScript.runInThisContext();
  await script.runInThisContext();
})();

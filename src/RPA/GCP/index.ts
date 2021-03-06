import * as path from "path";
import * as GCPBigQuery from "./BigQuery";
import * as GCPFirestore from "./Firestore";

import File from "../File";
import Hash from "../Hash";

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT) {
  const credentialsFile = `${Hash.md5(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT
  )}.json`;
  File.write({
    filename: credentialsFile,
    data: process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT
  });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
    File.outDir,
    credentialsFile
  );
}

export namespace RPA {
  export namespace GCP {
    export const BigQuery = GCPBigQuery.default.instance;
    export const Firestore = GCPFirestore.default.instance;
  }
}

export default RPA.GCP;

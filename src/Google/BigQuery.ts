import { bigquery_v2 as bigQueryApi, google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import Logger from "../Logger";

export namespace RPA {
  export namespace Google {
    export class BigQuery {
      private static bigQuery: BigQuery;

      private api: bigQueryApi.Bigquery;

      private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

      public static get instance(): BigQuery {
        if (!this.bigQuery) {
          this.bigQuery = new BigQuery();
        }
        return this.bigQuery;
      }

      public initialise(auth: OAuth2Client): void {
        this.api = google.bigquery({ version: "v2", auth });
      }

      public async query(params: {
        projectId: string;
        requestBody: bigQueryApi.Schema$QueryRequest;
      }): Promise<bigQueryApi.Schema$QueryResponse> {
        Logger.debug("BigQuery.queyr", params);
        const res = await this.api.jobs.query({ ...params });
        return res.data;
      }
    }
  }
}

export default RPA.Google.BigQuery;

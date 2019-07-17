import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";

import Spreadsheet from "./Spreadsheet";
import Drive from "./Drive";
import Gmail from "./Gmail";
import BigQuery from "./BigQuery";

export namespace RPA.Google {
  export interface ClientCredentials {
    clientSecret: string;
    clientId: string;
    redirectUrl: string;
  }

  export interface AuthCredentials {
    refreshToken?: string | null;
    expiryDate?: number | null;
    accessToken?: string | null;
    tokenType?: string | null;
    idToken?: string | null;
  }

  export class Auth {
    private static auth: Auth;

    public client: Promise<OAuth2Client>;

    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    public static get instance(): Auth {
      if (!this.auth) {
        this.auth = new Auth();
      }
      return this.auth;
    }

    public async authorize(authCredentials: AuthCredentials): Promise<void> {
      const clientCredentials: ClientCredentials = {
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        clientId: process.env.GOOGLE_CLIENT_ID,
        redirectUrl: "urn:ietf:wg:oauth:2.0:oob"
      };

      this.client = new Promise(
        (resolve): void => {
          const client = new google.auth.OAuth2(
            clientCredentials.clientId,
            clientCredentials.clientSecret,
            clientCredentials.redirectUrl
          );
          /* eslint-disable @typescript-eslint/camelcase */
          client.credentials = {
            refresh_token: authCredentials.refreshToken,
            expiry_date: authCredentials.expiryDate,
            access_token: authCredentials.accessToken,
            token_type: authCredentials.tokenType,
            id_token: authCredentials.idToken
          };
          /* eslint-enable @typescript-eslint/camelcase */
          Spreadsheet.instance.initialise(client);
          Drive.instance.initialise(client);
          Gmail.instance.initialise(client);
          BigQuery.instance.initialise(client);
          resolve(client);
        }
      );
    }
  }
}

export default RPA.Google.Auth;

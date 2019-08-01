import nodeFetch, { Response } from "node-fetch";
import * as qs from "querystring";
import Logger from "./Logger";

// http://developer.chatwork.com/ja/index.html

export namespace RPA {
  export class Chatwork {
    private static chatwork: Chatwork;

    private apiToken: string;

    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    public static get instance(): Chatwork {
      if (!this.chatwork) {
        this.chatwork = new Chatwork();
      }
      return this.chatwork;
    }

    public initialise(credential: { apiToken: string }): void {
      this.apiToken = credential.apiToken;
    }

    public async postMessage(params: {
      roomId: string;
      message: string;
    }): Promise<void> {
      Logger.debug("Chatwork.postMessage", params);
      await this.request({
        url: `https://api.chatwork.com/v2/rooms/${params.roomId}/messages`,
        method: "POST",
        data: {
          body: params.message
        }
      });
    }

    private async request(params: {
      url: string;
      method: string;
      data: { [key: string]: string };
    }): Promise<Response> {
      Logger.debug("Chatwork.request", params);
      return nodeFetch(params.url, {
        method: params.method,
        headers: {
          "X-ChatWorkToken": this.apiToken,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: qs.stringify(params.data)
      });
    }
  }
}

export default RPA.Chatwork.instance;

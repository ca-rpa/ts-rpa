import * as forge from "node-forge";
import Logger from "./Logger";

export namespace RPA {
  export class Hash {
    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    public static md5(msg: string): string {
      Logger.debug("Hash.md5", msg);
      const md = forge.md.md5.create();
      md.update(msg);
      return md.digest().toHex();
    }
  }
}

export default RPA.Hash;

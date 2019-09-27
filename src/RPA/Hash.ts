import * as forge from "node-forge";

export namespace RPA {
  export class Hash {
    private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

    /**
     * Calculate the md5 hash of a string.
     * @param msg
     */
    public static md5(msg: string): string {
      const md = forge.md.md5.create();
      md.update(msg);
      return md.digest().toHex();
    }
  }
}

export default RPA.Hash;

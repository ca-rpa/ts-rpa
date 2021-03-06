import { google, drive_v3 as driveApi } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import * as path from "path";
import * as fs from "fs";
import * as MimeStream from "mime-stream";
import Request from "../Request";
import Logger from "../Logger";

export namespace RPA {
  export namespace Google {
    export class Drive {
      private static drive: Drive;

      private api: driveApi.Drive;

      private outDir: string = process.env.WORKSPACE_DIR || "./";

      private constructor() {} // eslint-disable-line no-useless-constructor, no-empty-function

      public static get instance(): Drive {
        if (!this.drive) {
          this.drive = new Drive();
        }
        return this.drive;
      }

      public initialise(auth: OAuth2Client): void {
        this.api = google.drive({ version: "v3", auth });
      }

      /**
       * Lists the files.
       * @param params
       */
      public async listFiles(params?: {
        /**
         * The IDs of the parent folders which contain the files.
         * If not specified, lists files owned by the user in all locations.
         */
        parents?: string[];
        /** Whether to include files in trash */
        includesTrash?: boolean;
        /**
         * A comma-separated list of sort keys.
         * Valid keys are "createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "name_natural",
         * "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", and "viewedByMeTime".
         * Each key sorts ascending by default, but may be reversed with the "desc" modifier.
         * Example: "folder,modifiedTime desc,name"
         */
        orderBy?: string;
        /**
         * The maximum number of files to return per page.
         * Acceptable values are 1 to 1000, inclusive. (Default: 100)
         */
        pageSize?: number;
      }): Promise<driveApi.Schema$File[]> {
        Logger.debug("Google.Drive.listFiles", params);
        const {
          parents = [],
          includesTrash = false,
          orderBy = "",
          pageSize = 100
        } = params || {};
        if (!orderBy.match(/^[A-Za-z, ]*$/g)) {
          throw new Error(`Invalid orderBy parameter: ${orderBy}`);
        }
        // Build `q` parameter
        // https://developers.google.com/drive/api/v3/search-files
        const queries = [];
        if (parents) {
          queries.push(
            `(${parents
              .map((parent): string => `"${parent}" in parents`)
              .join(" or ")})`
          );
        }
        if (!includesTrash) {
          queries.push("(trashed = false)");
        }
        const res = await this.api.files.list({
          q: queries.join("and"),
          orderBy,
          pageSize
        });
        return res.data.files;
      }

      /**
       * Creates a new file.
       */
      public async create(params: {
        /**
         * The IDs of the parent folders which contain the file.
         * If not specified, the file will be placed directly in the user's My Drive folder.
         */
        parents?: string[];
        /** The name of the file. */
        filename?: string;
        /** The MIME type of the file. */
        mimeType?: string;
      }): Promise<driveApi.Schema$File> {
        Logger.debug("Google.Drive.create", params);
        const res = await this.api.files.create({
          requestBody: {
            parents: params.parents,
            mimeType: params.mimeType,
            name: params.filename
          }
        });
        return res.data;
      }

      /**
       * Exports a Google Doc to the requested MIME type and saves the exported content as the specified filename.
       * Please note that the exported content is limited to 10MB.
       * @param params
       */
      public async export(params: {
        fileId: string;
        mimeType: string;
        filename: string;
      }) {
        const out = fs.createWriteStream(
          path.join(this.outDir, params.filename)
        );
        const res: any = await this.api.files.export(
          {
            fileId: params.fileId,
            mimeType: params.mimeType
          },
          {
            responseType: "stream"
          }
        );
        return new Promise(async (resolve, reject) => {
          res.data
            .on("end", () => {
              resolve();
            })
            .on("error", (err: Error) => {
              reject(err);
            })
            .pipe(out);
        });
      }

      /**
       * Uploads a file.
       * @param params
       */
      public async upload(params: {
        /** The name of the file to upload. */
        filename: string;
        /** The array of parent folders to upload to. */
        parents?: string[];
        /** If specified, reads the file as this MIME type. */
        mimeType?: string;
        /** If specified, uploads as this file name. */
        destFilename?: string;
        /** If specified, uploads as this MIME type. */
        destMimeType?: string;
      }): Promise<string> {
        const filePath = path.join(this.outDir, params.filename);
        Logger.debug("Google.Drive.upload", filePath, params.parents);
        return new Promise((resolve, reject): void => {
          let file: MimeStream;
          const onDetectedType = async (type): Promise<void> => {
            const srcMimeType =
              params.mimeType || (type && type.mime) || "text/plain";
            try {
              const res = await this.api.files.create({
                requestBody: {
                  parents: params.parents,
                  mimeType: params.destMimeType,
                  name: params.destFilename || params.filename
                },
                supportsTeamDrives: true,
                media: {
                  mimeType: srcMimeType,
                  body: file
                },
                fields: "id"
              });
              resolve(res.data.id);
            } catch (e) {
              reject(e);
            }
          };
          file = fs
            .createReadStream(filePath)
            .on("error", reject)
            .pipe(MimeStream(onDetectedType))
            .on("error", reject);
        });
      }

      /**
       * Downloads a file.
       * @param params
       */
      public async download(params: {
        /** The ID of the file to download. */
        fileId?: string;
        /**
         * If specified, downloads file as this name.
         * If specified the `url`, you must specify it
         */
        filename?: string;
        /**
         * The URL of the file to download.
         * If you specify this parameter, you must also specify the `filename`.
         */
        url?: string;
      }): Promise<string> {
        let outFilename: string;
        if (params.filename) {
          outFilename = params.filename;
        }
        if (params.fileId) {
          Logger.debug(
            "Google.Drive.download",
            params.fileId,
            params.filename,
            params.url
          );
          const res = await this.api.files.get({
            fileId: params.fileId
          });
          if (!params.filename) {
            outFilename = res.data.name;
          }
          await Request.download(outFilename, `${res.config.url}?alt=media`, {
            headers: res.config.headers,
            compress: true
          });
          return outFilename;
        }
        if (params.url && params.filename) {
          const queryParams = new URL(params.url).searchParams;
          /* eslint-disable no-underscore-dangle */
          await Request.download(
            outFilename,
            `${params.url}${queryParams ? "&" : "?"}alt=media`,
            {
              headers: {
                Authorization: `Bearer ${
                  (await (this.api.context._options
                    .auth as OAuth2Client).getAccessToken()).token
                }`
              },
              compress: true
            }
          );
          /* eslint-enable no-underscore-dangle */
          return outFilename;
        }
        throw Error("Invalid parameter.");
      }

      /**
       * Deletes a file.
       * @param params
       */
      public async delete(params: { fileId: string }): Promise<void> {
        Logger.debug("Google.Drive.delete", params.fileId);
        await this.api.files.delete({ fileId: params.fileId });
      }

      /**
       * Creates a copy of a file and applies any requested updates.
       */
      public async copy(params: {
        /** The ID of the file to copy. */
        fileId: string;
        /** If specified, copies as this file name. */
        filename?: string;
        /** If specified, copies as this MIME type. */
        mimeType?: string;
        /** The array of parent folders to copy to. */
        parents?: string[];
      }): Promise<driveApi.Schema$File> {
        Logger.debug("Google.Drive.copy", params);
        const res = await this.api.files.copy({
          fileId: params.fileId,
          requestBody: {
            mimeType: params.mimeType,
            name: params.filename,
            parents: params.parents
          }
        });
        return res.data;
      }

      /**
       * Moves a file between folders.
       */
      public async move(params: {
        /** The ID of the file to move. */
        fileId: string;
        /** The ID of the parent folder to move to. */
        parent: string;
      }): Promise<driveApi.Schema$File> {
        Logger.debug("Google.Drive.move", params);
        const file = await this.api.files.get({
          fileId: params.fileId,
          fields: "parents"
        });
        const previousParents = file.data.parents.join(",");
        const res = await this.api.files.update({
          fileId: params.fileId,
          addParents: params.parent,
          removeParents: previousParents,
          fields: "id, parents"
        });
        return res.data;
      }
    }
  }
}

export default RPA.Google.Drive;

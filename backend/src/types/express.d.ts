import { ApiKey, User } from "@prisma/client";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      apiKey?: ApiKey;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};

import { Request, Response, NextFunction } from "express";
import { handleResponse } from "../utils/response";
import logger from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(err.stack || err.message || err);
  return handleResponse(
    res,
    null,
    err.message || "Internal Server Error",
    false,
    500,
  );
}

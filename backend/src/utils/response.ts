import { Response } from "express";

export function handleResponse(
  res: Response,
  data: any = null,
  message: string = "",
  success: boolean = true,
  statusCode: number = 200,
) {
  return res.status(statusCode).json({
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

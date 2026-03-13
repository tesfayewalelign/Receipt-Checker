import { Request, Response } from "express";
import AbyssiniaService from "../services/abyssinia.service";

export class AbyssiniaController {
  async verify(req: Request, res: Response) {
    try {
      const { reference, accountSuffix } = req.body || {};

      const fileBuffer = req.file?.buffer;

      const result = await AbyssiniaService.verify({
        reference,
        accountSuffix,
        fileBuffer,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Verification failed",
      });
    }
  }
}

export default new AbyssiniaController();

import { Request, Response, NextFunction } from "express";

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    return res
      .status(200)
      .json({ message: "File uploaded successfully", url: req.file.filename });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

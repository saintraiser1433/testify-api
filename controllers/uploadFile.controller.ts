import { Request, Response, NextFunction } from "express";

export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (error) {
        next(error); // Pass errors to the global error handler
    }


};

import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";

export const validate = (schema: z.ZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ 
        body: req.body as string, 
        query: req.query, 
        params: req.params 
      })
      next()
    } catch (error) {
      return res.status(400).json(error)
    }
}
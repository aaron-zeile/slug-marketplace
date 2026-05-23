import type { Request, Response } from 'express';

export const getSession = async (req: Request, res: Response) => {
    res.json({ user: req.user }); // user set by doCheck
  }
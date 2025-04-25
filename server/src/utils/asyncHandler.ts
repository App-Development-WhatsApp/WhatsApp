import { Request, Response, NextFunction } from "express";
export interface customRequest extends Request {
  user?: any;
}

// This asyncHandler is a higher-order function that accepts a function as a parameter
const asyncHandler = (requestHandler: (req: customRequest, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise
      .resolve(requestHandler(req, res, next))
      .catch((err) => next(err));
  };
};

export { asyncHandler };

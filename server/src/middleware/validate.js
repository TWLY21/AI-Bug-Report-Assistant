import { z } from 'zod';
import { ApiError } from '../utils/api-error.js';

export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new ApiError(400, 'Validation failed', error.flatten()));
      }
      return next(error);
    }
  };
}

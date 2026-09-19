import { ZodError } from 'zod';

/**
 * Middleware generator for Zod body validation
 * @param {import('zod').ZodSchema} schema 
 */
export const validateBody = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formattedErrors
      });
    }
    return next(error);
  }
};

/**
 * Middleware generator for Zod query parameter validation
 * @param {import('zod').ZodSchema} schema 
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.validatedQuery = schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: formattedErrors
      });
    }
    return next(error);
  }
};

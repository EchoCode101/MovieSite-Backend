import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";

type RequestPart = "body" | "query" | "params";

export interface ValidationOptions {
  /** Which part of the request to validate (default: "body") */
  target?: RequestPart;
}

export function validate(
  schema: Joi.ObjectSchema | Joi.Schema,
  optionsOrTarget: ValidationOptions | RequestPart = {},
) {
  let target: RequestPart;
  if (typeof optionsOrTarget === "string") {
    target = optionsOrTarget;
  } else {
    target = optionsOrTarget.target ?? "body";
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const valueToValidate = req[target];

    const { error, value } = schema.validate(valueToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join("; ");

      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    // Replace the validated part with the sanitized value
    (req as any)[target] = value;
    next();
  };
}

// Alias for backward compatibility
export const validateRequest = validate;



import { Request, Response, NextFunction } from 'express';

const JSON_FIELDS = ['tags', 'keywords', 'experimentIds', 'images', 'attachments'];

export function jsonFieldParser(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    if (body && typeof body === 'object') {
      body = parseJsonFields(body);
    }
    return originalJson(body);
  };

  next();
}

function parseJsonFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => parseJsonFields(item));
  }

  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (JSON_FIELDS.includes(key) && typeof value === 'string') {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = parseJsonFields(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return obj;
}

export function stringifyJsonField(value: string[] | string | undefined): string {
  if (!value) return '[]';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}
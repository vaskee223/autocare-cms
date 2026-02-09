import { HttpParams } from '@angular/common/http';

export function createQueryParams(
  obj: Record<string, unknown>,
  allowEmptyValues = false,
): HttpParams {
  let params = new HttpParams();
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value === null || value === undefined) {
      continue;
    }
    if (!allowEmptyValues && value === '') {
      continue;
    }
    params = params.set(key, String(value));
  }
  return params;
}

export type Uuid = string;
export interface IBeginUploadRequest {
  fileName: string;
  fileSize: number;
}

export interface IBeginUploadResponse {
  fileId: Uuid;
  uploadId: string;
  partUrls: string[];
  partSize: number;
}
export interface ICompleteUploadRequest {
  fileId: Uuid;
  uploadId: string;
  eTags: string[];
}

export interface ITags {
  [key: string]: string;
}
export type IsoDate = string;
export interface IBaseEntity {
  id?: Uuid;
  createdAt?: IsoDate;
  updatedAt?: IsoDate;
}
export interface ITaggedEntity extends IBaseEntity {
  tags: ITags;
}
export interface ICloudFile extends ITaggedEntity {
  name: string;
  organizationId: Uuid;
  userId: Uuid;
  fileId: Uuid;
  fileSize: number;
}
export interface IQueryFilesResponse {
  fileUrls: string[];
}

const millisecond = 1;
const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;
const year = 365 * day;

export const duration = {
  millisecond,
  second,
  minute,
  hour,
  day,
  week,
  month,
  year,
} as const;
export interface IValidation {
  [key: string]: string[];
}
export type Timeout = ReturnType<typeof setTimeout>;
export class ConnectionError extends Error {
  constructor(
    public cause: Error,
    public url: string,
    public retryable: boolean
  ) {
    super(`Connection failure: ${cause.message}`);
  }
}
export const delay = (time?: number) =>
  new Promise((resolve) => setTimeout(resolve, time || 0));

export function isErrorType<T extends Error>(
  error: unknown,
  constructor: new (...x: any[]) => T,
  predicate: (t: T) => boolean = () => true
): error is T {
  return error instanceof constructor && predicate(error);
}

export function narrowError<T extends Error>(
  error: unknown,
  constructor: new (...x: any[]) => T,
  predicate: (t: T) => boolean = () => true
): T {
  if (isErrorType(error, constructor, predicate)) {
    return error;
  } else {
    throw error;
  }
}

export function isObject(value: any): boolean {
  return !!value && (typeof value === "object" || typeof value === "function");
}

const blacklist = ["password", "secret", "token", "key", "buffer"];

/**
 * Returns a copy of an object with sensitive information redacted.
 */
export function redact(object: any, visited: Set<any> = new Set()) {
  if (visited.has(object)) {
    return "[ RECURSIVE ]";
  }
  if (isObject(object)) {
    visited.add(object);
    return Object.keys(object).reduce<any>((acc, key) => {
      acc[key] = blacklist.some((_) =>
        key.toLowerCase().includes(_.toLowerCase())
      )
        ? "[ REDACTED ]"
        : redact(object[key], visited);
      return acc;
    }, {});
  } else {
    return object;
  }
}

export class ResponseError extends Error {
  constructor(
    public method: string,
    public url: string,
    public statusCode: number,
    public body: any,
    public validationErrors: IValidation = {},
    public headers?: any
  ) {
    super(
      `Unexpected response (${statusCode}) for ${method} ${url}: ${JSON.stringify(
        headers
          ? redact(
              [...headers.entries()].reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {})
            )
          : {}
      )} -- ${JSON.stringify(redact(body))}`
    );
  }
}

export class ResponseHeadersError extends Error {
  constructor(
    public validationErrors: IValidation,
    public responseError: ResponseError
  ) {
    super(
      `Invalid headers (${JSON.stringify(validationErrors)}) for response: ${
        responseError.message
      }`
    );
  }
}

export interface IBaseEntity {
  id?: Uuid;
  createdAt?: IsoDate;
  updatedAt?: IsoDate;
}
export interface IListResponse<T> {
  items: T[];
}

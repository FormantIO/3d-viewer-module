import {
  duration,
  IValidation,
  Timeout,
  ConnectionError,
  delay,
  narrowError,
  ResponseError,
  ResponseHeadersError,
} from "./types";
import AbortController from "abort-controller";
import crossFetch from "cross-fetch";

export interface IRequestInit {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: { [key: string]: string };
  body?: any;
  token?: string;
  allowUnsafeRetries?: boolean;
  json?: boolean; // default: true
}

export interface IResponse<T> {
  body: T;
  headers: Headers;
}

const idempotentMethods = new Set([
  "GET",
  "HEAD",
  "PUT",
  "QUERY",
  "DELETE",
  "OPTIONS",
  "TRACE",
]);

export abstract class BaseClient {
  public static retries = 8;
  public static waitForConnectivity: () => Promise<void> = async () =>
    undefined;
  public static onResponseError: (error: ResponseError) => Promise<void> =
    async () => undefined;

  private validateHeaders: (headers: Headers) => IValidation;
  private verbose: boolean;
  private configuredRetries: number | undefined;
  private timeoutMs?: number;
  private maxBackoffDelayMs: number;

  constructor(
    protected endpoint: string | undefined,
    options: {
      validateHeaders?: (headers: Headers) => IValidation;
      verbose?: boolean;
      retries?: number;
      timeoutMs?: number;
      maxBackoffDelayMs?: number;
    } = {}
  ) {
    this.validateHeaders = (headers) =>
      options.validateHeaders ? options.validateHeaders(headers) : {};
    this.verbose = options.verbose !== false;

    if (options.retries !== undefined && !(options.retries >= 0)) {
      throw new Error("retries must be positive or zero");
    }

    this.configuredRetries = options.retries;

    if (options.timeoutMs !== undefined && !(options.timeoutMs > 0)) {
      throw new Error("timeoutMs must be positive");
    }

    // no timeout by default
    this.timeoutMs = options.timeoutMs;

    if (
      options.maxBackoffDelayMs !== undefined &&
      !(options.maxBackoffDelayMs > 0)
    ) {
      throw new Error("maxBackoffDelayMs must be positive");
    }

    this.maxBackoffDelayMs = options.maxBackoffDelayMs || 30 * duration.second;
  }

  protected getRetries(): number {
    return this.configuredRetries !== undefined
      ? this.configuredRetries
      : this.getConstructor().retries;
  }

  protected getHeaders(): { [_: string]: string } {
    return {};
  }

  protected async fetch<T>(
    path: string,
    extendedInit: IRequestInit = {}
  ): Promise<T> {
    const result = await this.fetchVerbose<T>(path, extendedInit);
    return result.body;
  }

  protected async fetchVerbose<T>(
    path: string,
    extendedInit: IRequestInit = {}
  ): Promise<IResponse<T>> {
    let backoff = 100 * duration.millisecond;
    let attempt = 0;

    const endTime =
      this.timeoutMs !== undefined
        ? new Date().getTime() + this.timeoutMs
        : undefined;
    const timeRemaining = endTime
      ? () => Math.max(endTime - new Date().getTime(), 0)
      : undefined;

    while (true) {
      try {
        return await this.doFetch(path, extendedInit, timeRemaining);
      } catch (error: any) {
        const connectionError = narrowError(error, ConnectionError);

        if (
          timeRemaining?.() === 0 ||
          attempt === this.getRetries() ||
          !connectionError.retryable
        ) {
          throw connectionError;
        }

        attempt++;
        backoff = Math.min(
          ...(timeRemaining ? [timeRemaining()] : []),
          backoff * (2 + (Math.random() - 0.5) * 0.1),
          this.maxBackoffDelayMs
        );
        await delay(backoff);

        if (this.verbose) {
          console.warn(
            `Connection failure, retrying. Error: ${error.cause.message}`,
            {
              url: error.url,
              error: error.cause,
              attempt,
            }
          );
        }
      }
    }
  }

  private async doFetch<T>(
    path: string,
    extendedInit: IRequestInit,
    timeRemaining?: () => number
  ): Promise<IResponse<T>> {
    const { token, json, allowUnsafeRetries, ...init } = extendedInit;
    const method = (init.method || "GET").toUpperCase();
    const url =
      this.endpoint !== undefined
        ? `${this.endpoint}${path ? `/${path}` : ""}`
        : path;

    const abortController = new AbortController();
    let abortTimeout: any;

    if (timeRemaining) {
      const abortDelay = timeRemaining();
      if (abortDelay > 0) {
        abortTimeout = setTimeout(() => {
          abortController.abort();
        }, abortDelay);
      } else {
        // abort immediately
        abortController.abort();
      }
    }

    try {
      let waitTimeout: Timeout | undefined;
      await Promise.race([
        this.getConstructor().waitForConnectivity(),
        new Promise((resolve) => {
          waitTimeout = setTimeout(
            resolve,
            timeRemaining
              ? Math.min(duration.minute, timeRemaining())
              : duration.minute
          );
        }),
      ]);
      if (waitTimeout) {
        clearTimeout(waitTimeout);
      }

      const response = await crossFetch(url, {
        ...init,
        headers: {
          ...(json !== false ? { "Content-Type": "application/json" } : {}),
          ...this.getHeaders(),
          ...(init.headers || {}),
          ...(token !== undefined ? { Authorization: `Bearer ${token}` } : {}),
        },
        // TODO: this project is abandondoned and we should not use it
        // it throws an type error when we try to use it because it's
        // missing certain handler methods
        signal: abortController.signal as any,
      });

      const contentType: string = response.headers.get("content-type") || "";
      const isJson = contentType && contentType.startsWith("application/json");
      const body = isJson ? await response.json() : await response.text();

      const createResponseError = () =>
        new ResponseError(
          method,
          url,
          response.status,
          body,
          (body && body.validationErrors) || {},
          response.headers
        );

      if (!response.ok) {
        if (this.verbose) {
          console.warn("Response error", {
            method,
            url,
            statusCode: response.status,
          });
        }
        throw createResponseError();
      }

      const validation = this.validateHeaders(response.headers);
      if (Object.keys(validation).length !== 0) {
        throw new ResponseHeadersError(validation, createResponseError());
      }

      if (response.status === 204) {
        return {
          body: undefined as any as T,
          headers: response.headers,
        };
      }

      if (json && !isJson) {
        throw new Error(`Response is not JSON: ${JSON.stringify(body)}`);
      }

      return { body, headers: response.headers };
    } catch (error: any) {
      const retryable = allowUnsafeRetries || idempotentMethods.has(method);

      if (error.message === "Network request failed") {
        // Generic frontend fetch error
        throw new ConnectionError(error, url, retryable);
      }

      if (
        error.type === "system" &&
        ["EAI_AGAIN", "ECONNREFUSED", "EHOSTUNREACH", "ENOTFOUND"].find(
          (_) => _ === error.code
        )
      ) {
        // node-fetch error codes
        throw new ConnectionError(error, url, true);
      }

      if (
        error.type === "system" &&
        ["ETIMEDOUT", "ECONNRESET", "ESOCKETTIMEDOUT", "EPIPE"].find(
          (_) => _ === error.code
        )
      ) {
        // node-fetch error codes
        throw new ConnectionError(error, url, retryable);
      }

      if (error.name === "AbortError") {
        // client-side request timeout
        throw new ConnectionError(error, url, retryable);
      }

      const responseError = narrowError(error, ResponseError);
      const { statusCode } = responseError;
      if (
        statusCode === 408 /* Timeout */ ||
        statusCode === 429 /* Too many requests */ ||
        statusCode === 502 /* Bad gateway */ ||
        statusCode === 503 /* Service unavailable */ ||
        statusCode === 504 /* Gateway timeout */
      ) {
        if (this.verbose && !retryable) {
          console.warn("Potentially unsafe retry");
        }
        throw new ConnectionError(error, url, true);
      }

      const validation = this.validateHeaders(responseError.headers);
      if (Object.keys(validation).length !== 0) {
        throw new ResponseHeadersError(validation, responseError);
      }

      await this.getConstructor().onResponseError(responseError);

      throw error;
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
  }

  // this allows us to access subclass static methods
  private getConstructor(): typeof BaseClient {
    return Object.getPrototypeOf(this).constructor;
  }
}

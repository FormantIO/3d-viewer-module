import {
  narrowError,
  ResponseError,
  Uuid,
  IBaseEntity,
  IListResponse,
} from "./types";
import { FormantBaseClient } from "./FormantBaseClient";
// @ts-ignore
import * as qs from "qs";

export abstract class BaseModelClient<
  Model extends IBaseEntity,
  Query = undefined
> extends FormantBaseClient {
  constructor(endpoint: string, protected path: string) {
    super(endpoint);
  }

  public async get(
    token: string,
    id: Uuid
  ): Promise<(Model & { id: Uuid }) | undefined> {
    try {
      return await this.fetch<Model & { id: Uuid }>(`${this.path}/${id}`, {
        token,
      });
    } catch (error) {
      const responseError = narrowError(error, ResponseError);
      if (responseError.statusCode === 404) {
        return undefined;
      }
      throw responseError;
    }
  }

  public async list(
    token: string,
    query?: Query
  ): Promise<(Model & { id: Uuid })[]> {
    const result = await this.fetch<IListResponse<Model & { id: Uuid }>>(
      query === undefined ? this.path : `${this.path}?${qs.stringify(query)}`,
      { token }
    );
    return result.items;
  }

  public async create(
    token: string,
    model: Model
  ): Promise<Model & { id: Uuid }> {
    return await this.fetch<Model & { id: Uuid }>(this.path, {
      token,
      method: "POST",
      body: JSON.stringify(model),
    });
  }

  public async update(
    token: string,
    id: Uuid,
    model: Partial<Model>
  ): Promise<Model & { id: Uuid }> {
    return await this.fetch<Model & { id: Uuid }>(`${this.path}/${id}`, {
      token,
      method: "PATCH",
      body: JSON.stringify(model),
    });
  }

  public async delete(token: string, id: Uuid): Promise<void> {
    try {
      await this.fetch(`${this.path}/${id}`, {
        token,
        method: "DELETE",
      });
    } catch (error) {
      narrowError(error, ResponseError, (_) => _.statusCode === 404);
    }
  }
}

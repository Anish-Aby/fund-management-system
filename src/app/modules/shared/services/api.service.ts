import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Performs an HTTP GET request to the given API endpoint.
   *
   * @template R The expected response type returned by API.
   *
   * @param apiEndpoint
   * Relative API endpoint (appended to the base API URL).
   * Example: `api/users`
   *
   * @param options
   * Optional request configuration.
   * - `params`: HTTP query parameters.
   * - `responseType`: Expected response type. Defaults to `json`.
   *
   * @returns
   * An `Observable` emitting the response of type `R`
   *
   * @example
   * ```ts
   * this.apiService.get<User>('users/1');
   * this.apiService.get<string>('reports/export', {
   *   responseType: 'text'
   * });
   * ```
   */
  get<R>(apiEndpoint: string, options?: any): Observable<R> {
    const { params, responseType } = options || {};
    return this.http.get<R>(`${this.apiUrl}/${apiEndpoint}`, {
      params,
      responseType,
    });
  }

  /**
   * Performs an HTTP POST request to the given API endpoint.
   *
   * @template R The expected response type returned by the API.
   * @template B The request body type being sent to the API.
   *
   * @param apiEndpoint
   * Relative API endpoint (appended to the base API URL).
   * Example: `users`, `auth/login`
   *
   * @param body
   * Request payload sent in the POST request.
   *
   * @param options
   * Optional request configuration.
   * - `params`: HTTP query parameters.
   *
   * @returns
   * An `Observable` emitting the response of type `R`.
   *
   * @example
   * ```ts
   * this.apiService.post<User, CreateUserRequest>('users', payload);
   * ```
   */
  post<R, B>(apiEndpoint: string, body: B, options?: any): Observable<R> {
    const { params } = options || {};
    return this.http.post<R>(`${this.apiUrl}/${apiEndpoint}`, body, {
      params,
    });
  }

  /**
   * Performs an HTTP PUT request to the given API endpoint.
   *
   * @template R The expected response type returned by the API.
   * @template B The request body type being sent to the API.
   *
   * @param apiEndpoint
   * Relative API endpoint (appended to the base API URL).
   * Example: `users/123`
   *
   * @param body
   * Request payload used to fully update the resource.
   *
   * @returns
   * An `Observable` emitting the response of type `R`.
   *
   * @example
   * ```ts
   * this.apiService.put<User, UpdateUserRequest>('users/123', payload);
   * ```
   */
  put<R, B>(apiEndpoint: string, body: B): Observable<R> {
    return this.http.put<R>(`${this.apiUrl}/${apiEndpoint}`, body);
  }

  /**
   * Performs an HTTP PATCH request to the given API endpoint.
   *
   * @template R The expected response type returned by the API.
   * @template B The request body type being sent to the API.
   *
   * @param apiEndpoint
   * Relative API endpoint (appended to the base API URL).
   * Example: `users/123`
   *
   * @param body
   * Request payload used to partially update the resource.
   *
   * @returns
   * An `Observable` emitting the response of type `R`.
   *
   * @example
   * ```ts
   * this.apiService.patch<User, Partial<User>>('users/123', payload);
   * ```
   */
  patch<R, B>(apiEndpoint: string, body: B): Observable<R> {
    return this.http.patch<R>(`${this.apiUrl}/${apiEndpoint}`, body);
  }

  /**
   * Performs an HTTP DELETE request to the given API endpoint.
   *
   * @template R The expected response type returned by the API.
   * @template B The optional request body type sent with the DELETE request.
   *
   * @param apiEndpoint
   * Relative API endpoint (appended to the base API URL).
   * Example: `users/123`
   *
   * @param options
   * Optional request configuration.
   * - `body`: Request body (used when the backend expects a payload).
   * - `params`: HTTP query parameters.
   *
   * @returns
   * An `Observable` emitting the response of type `R`.
   *
   * @example
   * ```ts
   * this.apiService.delete<void>('users/123');
   *
   * this.apiService.delete<void, DeletePayload>('users/bulk', {
   *   body: payload
   * });
   * ```
   */
  delete<R, B>(
    apiEndpoint: string,
    options?: {
      body?: B;
      params?: any;
    },
  ): Observable<R> {
    return this.http.delete<R>(`${this.apiUrl}/${apiEndpoint}`, {
      body: options?.body,
      params: options?.params,
    });
  }

  downloadTemplate<T>(url: string, body: T): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/${url}`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}

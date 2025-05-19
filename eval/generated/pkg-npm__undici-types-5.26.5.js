  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void;
}

declare class Request {
  method: string;
  url: string;
  headers: Headers;
  body: any;
  signal?: AbortSignal;
  constructor(input: string | Request, init?: {
    method?: string,
    headers?: Headers | { [key: string]: string },
    body?: any,
    signal?: AbortSignal
  });
  clone(): Request;
}

declare class Response {
  static error(): Response;
  static redirect(url: string, status?: number): Response;
  body: any;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  url: string;
  type: string;
  constructor(body?: any, init?: {
    status?: number,
    statusText?: string,
    headers?: Headers | { [key: string]: string }
  });
  clone(): Response;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<any>;
  text(): Promise<string>;
}

interface FetchOptions {
  method?: string;
  headers?: Headers | { [key: string]: string };
  body?: any;
  signal?: AbortSignal;
  redirect?: 'follow' | 'error' | 'manual';
}

declare function fetch(input: string | Request, init?: FetchOptions): Promise<Response>;

declare class FormData {
  append(name: string, value: string | Blob, fileName?: string): void;
  delete(name: string): void;
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): FormDataEntryValue[];
  has(name: string): boolean;
  set(name: string, value: string | Blob, fileName?: string): void;
  forEach(callback: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void;
}

type FormDataEntryValue = string | Blob;
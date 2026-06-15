export class YapiHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseText: string,
  ) {
    super(message);
    this.name = "YapiHttpError";
  }
}

export class YapiApiError extends Error {
  constructor(
    message: string,
    readonly errcode: number,
    readonly data: unknown,
  ) {
    super(message);
    this.name = "YapiApiError";
  }
}

export class HTTPError extends Error {
    readonly #response: Response;

    constructor(response: Response) {
        const reason = response.status
            ? `${response.status} ${response.statusText}`
            : 'xxx unknown error';
        super(`Request failed with ${reason}`);

        this.#response = response;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    get response(): Response {
        return this.#response;
    }
}

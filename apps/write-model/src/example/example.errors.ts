export class ExampleNotFoundError extends Error {
    constructor(id: string) {
        super(`Example with id ${id} not found`);
        this.name = 'ExampleNotFoundError';
    }
}
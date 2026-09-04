import { createCustomResponse } from '../create-custom-response.util.js';

class MockDataDto {
    id: string;
}

describe('createCustomResponse', () => {
    it('should generate class for single item response', () => {
        const ResponseClass = createCustomResponse(MockDataDto, false);
        expect(ResponseClass).toBeDefined();
        expect(ResponseClass.name).toBe('CustomResponseOfMockDataDto');

        const instance = new ResponseClass();
        expect(instance).toBeDefined();
    });

    it('should generate class for array response', () => {
        const ResponseClass = createCustomResponse(MockDataDto, true);
        expect(ResponseClass).toBeDefined();
        expect(ResponseClass.name).toBe('CustomResponseOfMockDataDtoArray');

        const instance = new ResponseClass();
        expect(instance).toBeDefined();
    });

    it('should generate class for void/null response', () => {
        const ResponseClass = createCustomResponse(null);
        expect(ResponseClass).toBeDefined();
        expect(ResponseClass.name).toBe('CustomResponseOfVoid');

        const instance = new ResponseClass();
        expect(instance).toBeDefined();
    });
});

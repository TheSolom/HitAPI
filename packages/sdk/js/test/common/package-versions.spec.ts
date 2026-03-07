import { getPackageVersion } from '../../src/common/core/package-versions.js';

describe('Package versions', () => {
    it('Get package version', async () => {
        expect(await getPackageVersion('jest')).not.toBeNull();
        expect(await getPackageVersion('nonexistent')).toBeNull();
    });
});

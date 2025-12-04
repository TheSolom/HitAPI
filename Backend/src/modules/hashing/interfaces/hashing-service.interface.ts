export interface IHashingService {
    /**
     * Hashes a given string using the SHA256 algorithm.
     *
     * @param string The input string to be hashed.
     * @returns {string} The SHA256 hash of the input string, encoded in hexadecimal.
     */
    hash(string: string): string;
    /**
     * Hashes a raw password.
     * @param rawPassword The plain-text password to hash.
     * @returns {Promise<string>} A promise that resolves to the hashed password string.
     */
    hashPassword(rawPassword: string): Promise<string>;
    /**
     * Verifies if a raw password matches a given hashed password.
     * @param rawPassword The plain-text password to verify.
     * @param hashedPassword The hashed password to compare against.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the passwords match, `false` otherwise.
     */
    verifyPassword(
        rawPassword: string,
        hashedPassword: string,
    ): Promise<boolean>;
}

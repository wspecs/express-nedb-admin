export declare function afterSerialization(plaintext: string): string;
export declare function beforeDeserialization(ciphertext: string): string;
export declare function hashInfo(input: string): {
    salt: any;
    hash: any;
};
export declare function compareHash(input: string, hash: string): any;

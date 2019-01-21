import { Schema } from './types';
export declare class Database {
    private DATABASE;
    private static instance;
    collectionCount: number;
    languageCount: number;
    userCount: number;
    datastoreSize: number;
    collectionsInfo: any[];
    languagesInfo: any[];
    private constructor();
    static getInstance(): Database;
    getCollectionSize(collection: string): any;
    updateQuickStats(): Promise<{}>;
    getCollectionName(collection: string): string;
    private createCollection;
    addNewCollection(collection: string, schema: any[]): Promise<void>;
    findSchema(collection: string): Promise<{
        collection: string;
        schema: Schema[];
    }>;
    loadCollectionIfNeeded(collection: string): void;
    validateInsertion(collection: string, insertion: any): Promise<boolean>;
    updateSchema(collection: string, schema: any): Promise<{}>;
    deleteSchema(collection: string): Promise<{}>;
    archiveCollection(collection: string): Promise<void>;
    insert(collection: string, insertion: any): Promise<{}>;
    findOne(collection: string, filter?: {}): Promise<any>;
    find(collection: string, filter?: {}, options?: {
        sort?: {};
        skip?: number;
        limit?: number;
    }): Promise<any[]>;
    count(collection: string, filter?: {}): Promise<number>;
    update(collection: string, filter: {}, update: any): Promise<{}>;
    archive(collection: string, filter: {}): Promise<{}>;
    unArchive(collection: string, filter: {}): Promise<{}>;
    addUser(user: any): Promise<{}>;
    verifyUser(userName: string, password: string): Promise<{
        valid: boolean;
        token: string;
        success?: undefined;
    } | {
        success: any;
        token: string;
        valid?: undefined;
    }>;
    getLanguageCollectionName(language: string): string;
    getLocale(language: string, key: string): Promise<any>;
    upsertLocale(language: string, key: string, value: string): Promise<{}>;
}

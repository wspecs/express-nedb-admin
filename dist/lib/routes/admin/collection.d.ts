export declare class AdminCollectionController {
    private db;
    newCollectionPage(req: any, res: any): void;
    newCollectionHandler(req: any, res: any): Promise<void>;
    collectionsPage(req: any, res: any): Promise<void>;
    modifyCollectionPage(req: any, res: any): Promise<void>;
    deleteCollection(req: any, res: any): Promise<void>;
    deleteCollectionPage(req: any, res: any): Promise<void>;
    deleteCollectionHandler(req: any, res: any): Promise<void>;
    collectionListPage(req: any, res: any): Promise<void>;
    newEntryPage(req: any, res: any): Promise<void>;
    newEntryHandler(req: any, res: any): Promise<void>;
    getEntry(req: any, res: any): Promise<void>;
}

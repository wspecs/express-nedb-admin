export declare class AdminAuthController {
    private db;
    loginPage(req: any, res: any): void;
    loginHandler(req: any, res: any): Promise<void>;
    logout(req: any, res: any): void;
    registerPage(req: any, res: any): void;
    registerHandler(req: any, res: any): Promise<void>;
}

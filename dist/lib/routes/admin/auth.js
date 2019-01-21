"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("@decorators/express");
const database_1 = require("../../database");
const middleware_1 = require("./middleware");
let AdminAuthController = class AdminAuthController {
    constructor() {
        this.db = database_1.Database.getInstance();
    }
    loginPage(req, res) {
        res.serve('admin/login', {});
    }
    loginHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const verification = yield this.db.verifyUser(req.body.userName, req.body.password);
            if (verification.success) {
                req.adminSession.user = verification.token;
            }
            res.send(Object.assign({}, verification));
        });
    }
    logout(req, res) {
        req.session.reset();
        res.redirect('/admin');
    }
    registerPage(req, res) {
        res.serve('admin/register', {});
    }
    registerHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.addUser(req.body);
            res.send({ success: true });
        });
    }
};
__decorate([
    express_1.Get('/login')
], AdminAuthController.prototype, "loginPage", null);
__decorate([
    express_1.Post('/login')
], AdminAuthController.prototype, "loginHandler", null);
__decorate([
    express_1.Get('/logout')
], AdminAuthController.prototype, "logout", null);
__decorate([
    express_1.Get('/register')
], AdminAuthController.prototype, "registerPage", null);
__decorate([
    express_1.Post('/register')
], AdminAuthController.prototype, "registerHandler", null);
AdminAuthController = __decorate([
    express_1.Controller('/admin', [middleware_1.AdminMiddleware])
], AdminAuthController);
exports.AdminAuthController = AdminAuthController;

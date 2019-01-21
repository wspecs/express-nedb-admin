"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
let AdminDashboardController = class AdminDashboardController {
    constructor() {
        this.db = database_1.Database.getInstance();
    }
    dashboard(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.updateQuickStats();
            const data = {
                quickStats: [
                    {
                        name: 'Collections',
                        value: this.db.collectionCount,
                        href: '/admin/collection/all',
                        icon: 'chevron-up'
                    },
                    {
                        name: 'Languages',
                        value: this.db.languageCount,
                        href: '/admin/collection/all',
                        icon: 'chevron-up'
                    },
                    {
                        name: 'Users',
                        value: this.db.userCount,
                        href: '/admin/collection/all',
                        icon: 'chevron-up'
                    },
                    {
                        name: 'Datastore Size',
                        value: this.db.datastoreSize,
                        href: '/admin/collection/all',
                        icon: 'chevron-up'
                    },
                    {
                        name: 'Datastore',
                        value: 1,
                        href: '/admin/collection/all',
                        icon: 'chevron-up'
                    },
                    {
                        name: 'Datastore',
                        value: 1,
                        href: '/admin/collection/all',
                        icon: 'chevron-up'
                    }
                ]
            };
            res.serve('admin/dashboard', data);
        });
    }
    landing(res) {
        res.redirect('/admin/dashboard');
    }
};
__decorate([
    express_1.Get('/dashboard'),
    __param(0, express_1.Response())
], AdminDashboardController.prototype, "dashboard", null);
__decorate([
    express_1.Get('/'),
    __param(0, express_1.Response())
], AdminDashboardController.prototype, "landing", null);
AdminDashboardController = __decorate([
    express_1.Controller('/admin', [middleware_1.AdminMiddleware])
], AdminDashboardController);
exports.AdminDashboardController = AdminDashboardController;

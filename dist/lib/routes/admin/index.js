"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("./collection");
const dashboard_1 = require("./dashboard");
const auth_1 = require("./auth");
exports.ADMIN_CONTROLLERS = [
    collection_1.AdminCollectionController,
    auth_1.AdminAuthController,
    dashboard_1.AdminDashboardController
];

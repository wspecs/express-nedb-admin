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
const ejs_helper_1 = require("../../ejs-helper");
const middleware_1 = require("./middleware");
const helpers_1 = require("./helpers");
let AdminCollectionController = class AdminCollectionController {
    constructor() {
        this.db = database_1.Database.getInstance();
    }
    newCollectionPage(req, res) {
        res.serve('admin/collection_new', {});
    }
    newCollectionHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.addNewCollection(req.body.collection, req.body.schema);
                res.send({ success: true });
            }
            catch (e) {
                res.status(500);
                res.send({ success: false });
            }
        });
    }
    collectionsPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.updateQuickStats();
            const data = {
                collections: this.db.collectionsInfo.map((info) => (Object.assign({}, info, { href: helpers_1.getCollectionUrl(info.collection) })))
            };
            res.serve('admin/collections', data);
        });
    }
    modifyCollectionPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = helpers_1.transformCollectionName(req.params.collection);
            const schema = yield this.db.findSchema(collection);
            res.serve('admin/collection_modify', { collection, schema });
        });
    }
    deleteCollection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = helpers_1.transformCollectionName(req.params.collection);
            try {
                yield this.db.updateSchema(req.body.collection, req.body.schema);
                res.send({ success: true });
            }
            catch (e) {
                res.status(500);
                res.send({ success: false });
            }
            res.send({ success: true });
        });
    }
    deleteCollectionPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = helpers_1.transformCollectionName(req.params.collection);
            res.serve('admin/collection_delete', { collection });
        });
    }
    deleteCollectionHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = helpers_1.transformCollectionName(req.params.collection);
            this.db.deleteSchema(collection);
            yield this.db.archiveCollection(collection);
            res.send({ success: true });
        });
    }
    collectionListPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = helpers_1.transformCollectionName(req.params.collection);
            const connectionUrl = helpers_1.getCollectionUrl(collection);
            const schema = yield this.db.findSchema(collection);
            const limit = 24; // page size
            const page = req.query.page || 1;
            const skip = (page - 1) * limit;
            const size = this.db.getCollectionSize(helpers_1.transformCollectionName(collection));
            const pagination = ejs_helper_1.getPaginationData('/', page, size, limit);
            const data = {
                collection,
                headers: schema.schema
                    .filter(x => x.type === 'string' || x.type === 'boolean')
                    .filter(x => x.preview)
                    .map(x => x.name),
                size,
                pagination,
                rows: (yield this.db.find(collection, {}, { limit, skip })).map((row) => (Object.assign({}, row, { href: `${connectionUrl}/${row._id}` })))
            };
            res.serve('admin/collection_list', data);
        });
    }
    newEntryPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = helpers_1.transformCollectionName(req.params.collection);
            const schema = yield this.db.findSchema(collection);
            const data = {
                collection,
                inputs: schema.schema.map(x => ejs_helper_1.getFormInput(x))
            };
            res.serve('admin/entry_new', data);
        });
    }
    newEntryHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.insert(req.body.collection, req.body.entry);
            res.send({ success: true });
        });
    }
    getEntry(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = helpers_1.transformCollectionName(req.params.collection);
            const item = yield this.db.findOne(collection, { _id: req.params.id });
            const schema = yield this.db.findSchema(collection);
            const data = Object.assign({ collection }, item);
            res.serve('admin/entry_view', data);
        });
    }
};
__decorate([
    express_1.Get('/new')
], AdminCollectionController.prototype, "newCollectionPage", null);
__decorate([
    express_1.Post('/new')
], AdminCollectionController.prototype, "newCollectionHandler", null);
__decorate([
    express_1.Get('/all')
], AdminCollectionController.prototype, "collectionsPage", null);
__decorate([
    express_1.Get('/:collection/modify')
], AdminCollectionController.prototype, "modifyCollectionPage", null);
__decorate([
    express_1.Post('/:collection/modify')
], AdminCollectionController.prototype, "deleteCollection", null);
__decorate([
    express_1.Get('/:collection/delete')
], AdminCollectionController.prototype, "deleteCollectionPage", null);
__decorate([
    express_1.Post('/:collection/delete')
], AdminCollectionController.prototype, "deleteCollectionHandler", null);
__decorate([
    express_1.Get('/:collection')
], AdminCollectionController.prototype, "collectionListPage", null);
__decorate([
    express_1.Get('/:collection/new')
], AdminCollectionController.prototype, "newEntryPage", null);
__decorate([
    express_1.Post('/:collection/new')
], AdminCollectionController.prototype, "newEntryHandler", null);
__decorate([
    express_1.Get('/:collection/:id')
], AdminCollectionController.prototype, "getEntry", null);
AdminCollectionController = __decorate([
    express_1.Controller('/admin/collection', [middleware_1.AdminMiddleware])
], AdminCollectionController);
exports.AdminCollectionController = AdminCollectionController;

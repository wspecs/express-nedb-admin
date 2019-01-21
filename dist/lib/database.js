"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Datastore = require("nedb");
const schema = require("./schema");
const log = require("great-logs");
const utils_1 = require("./utils");
const filesize = require('filesize');
const walk = require('walkdir');
const md5 = require('md5');
const faker = require('faker');
const Joi = require('joi');
const encryption_1 = require("./encryption");
const shell = require('shelljs');
const DATASTORE_FOLDER = './datastore';
const CONFIG_DATA_FOLDER = 'config';
const ARCHIVED_FOLDER = 'archived';
const USER_COLLECTION = `${CONFIG_DATA_FOLDER}/users`;
const SCHEMA_COLLECTION = `${CONFIG_DATA_FOLDER}/schema`;
shell.exec(`mkdir -p ${DATASTORE_FOLDER}`);
shell.exec(`mkdir -p ${DATASTORE_FOLDER}/${ARCHIVED_FOLDER}`);
shell.exec(`mkdir -p ${DATASTORE_FOLDER}/${CONFIG_DATA_FOLDER}`);
class Database {
    constructor() {
        this.DATABASE = {};
        this.collectionCount = 0;
        this.languageCount = 0;
        this.userCount = 0;
        this.datastoreSize = 0;
        this.collectionsInfo = [];
        this.languagesInfo = [];
        if (Database.instance) {
            throw new Error('Use Database.getInstance() to use the Database class');
        }
        this.updateQuickStats();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
            log.debug('Database Initialized');
        }
        return Database.instance;
    }
    getCollectionSize(collection) {
        const infos = this.collectionsInfo.filter(x => x.collection === collection);
        if (infos) {
            return infos[0].rows;
        }
        return 0;
    }
    updateQuickStats() {
        return __awaiter(this, void 0, void 0, function* () {
            this.collectionCount = 0;
            this.languageCount = 0;
            this.userCount = yield this.count(USER_COLLECTION, {});
            this.datastoreSize = utils_1.getHumanReadableSize(DATASTORE_FOLDER);
            const totalFilesCount = walk.sync(DATASTORE_FOLDER).length;
            this.collectionsInfo = [];
            this.languagesInfo = [];
            return new Promise((resolve, reject) => {
                let count = 0;
                walk.sync(DATASTORE_FOLDER, (path, stats) => __awaiter(this, void 0, void 0, function* () {
                    if (path.endsWith('.db') &&
                        !path.endsWith('users.db') &&
                        !path.endsWith('schema.db')) {
                        const collection = path
                            .substr(path.indexOf('datastore') + 10)
                            .replace('.db', '');
                        let collectionTitle = collection.replace('/', ' ');
                        const info = Object.assign({ collection,
                            collectionTitle, rows: yield this.count(collection, {}) }, stats, { size: filesize(stats.size) });
                        if (path.indexOf('language/') >= 0) {
                            this.languageCount++;
                            this.languagesInfo.push(info);
                        }
                        else {
                            this.collectionCount++;
                            this.collectionsInfo.push(info);
                        }
                    }
                    if (++count === totalFilesCount)
                        resolve(this.collectionsInfo);
                }));
            });
        });
    }
    getCollectionName(collection) {
        return `${DATASTORE_FOLDER}/${collection}.db`;
    }
    createCollection(collection) {
        log.debug('Creating new collection: %s', collection);
        this.DATABASE[collection] = new Datastore({
            filename: this.getCollectionName(collection),
            autoload: true,
            afterSerialization: encryption_1.afterSerialization,
            beforeDeserialization: encryption_1.beforeDeserialization
        });
    }
    addNewCollection(collection, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const found = yield this.findOne(SCHEMA_COLLECTION, { collection });
            if (found == null) {
                yield this.insert(SCHEMA_COLLECTION, {
                    collection: collection.toLowerCase().replace(/ /g, '_'),
                    schema
                });
                this.loadCollectionIfNeeded(collection);
            }
            else {
                throw new Error('Collection already exists');
            }
        });
    }
    findSchema(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOne(SCHEMA_COLLECTION, { collection });
        });
    }
    loadCollectionIfNeeded(collection) {
        if (!this.DATABASE[collection]) {
            this.createCollection(collection);
        }
    }
    validateInsertion(collection, insertion) {
        return __awaiter(this, void 0, void 0, function* () {
            if (collection === SCHEMA_COLLECTION) {
                return true;
            }
            yield this.findSchema(collection);
            return true;
        });
    }
    updateSchema(collection, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(SCHEMA_COLLECTION, { collection }, { $set: { schema } });
        });
    }
    deleteSchema(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.archive(SCHEMA_COLLECTION, { collection });
        });
    }
    archiveCollection(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = `${DATASTORE_FOLDER}/${collection}.db`;
            const destination = `${DATASTORE_FOLDER}/archived/${collection}.archived`;
            shell.exec(`mv ${source} ${destination}`);
            yield this.updateQuickStats();
        });
    }
    insert(collection, insertion) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadCollectionIfNeeded(collection);
            this.validateInsertion(collection, insertion);
            return new Promise((resolve, reject) => {
                this.DATABASE[collection].insert(Object.assign({}, insertion, { _created: new Date(), _updated: new Date(), _archived: false, _lastAction: 'insertion' }), (err, insertion) => {
                    if (err)
                        reject(err);
                    else {
                        log.debug('Insertion new entry in %s collection', collection);
                        this.updateQuickStats();
                        resolve(insertion);
                    }
                });
            });
        });
    }
    findOne(collection, filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.find(collection, filter, { limit: 1 });
            return items.length === 1 ? items[0] : null;
        });
    }
    find(collection, filter = {}, options = {
        skip: 0,
        limit: 0
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadCollectionIfNeeded(collection);
            log.debug('looking up info in %s collection:', collection);
            return new Promise((resolve, reject) => {
                const query = this.DATABASE[collection].find(Object.assign({}, filter, { _archived: false }));
                if (options.sort)
                    query.sort(options.sort);
                if (options.skip)
                    query.skip(options.skip);
                if (options.limit)
                    query.limit(options.limit);
                query.exec((err, docs) => {
                    if (err)
                        reject(err);
                    else
                        resolve(docs);
                });
            });
        });
    }
    count(collection, filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadCollectionIfNeeded(collection);
            log.debug('looking up info in %s collection:', collection);
            return new Promise((resolve, reject) => {
                const query = this.DATABASE[collection].count(Object.assign({ _archived: false }, filter));
                query.exec((err, count) => {
                    if (err)
                        reject(err);
                    else
                        resolve(count);
                });
            });
        });
    }
    update(collection, filter, update) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadCollectionIfNeeded(collection);
            return new Promise((resolve, reject) => {
                if (!update.$set) {
                    update.$set = {};
                }
                if (!update.$set._updated)
                    update.$set._updated = new Date();
                if (!update.$set._lastAction)
                    update.$set._lastAction = 'updated';
                const query = this.DATABASE[collection].update(filter, update, { multi: true }, (err, numReplaced) => {
                    if (err)
                        reject(err);
                    else {
                        log.debug('Updated %s entries in % collection', numReplaced, collection);
                        resolve(numReplaced);
                    }
                });
            });
        });
    }
    archive(collection, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadCollectionIfNeeded(collection);
            return this.update(collection, filter, {
                $set: { _archived: true, _archivedDate: new Date() }
            });
        });
    }
    unArchive(collection, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadCollectionIfNeeded(collection);
            return this.update(collection, filter, {
                $set: { _archived: false },
                $unset: { _archivedDate: true }
            });
        });
    }
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersFound = yield this.find(USER_COLLECTION, { userName: user.userName }, { limit: 1 });
            if (usersFound.length > 0) {
                throw new Error('User already exists');
            }
            const isFirstUser = (yield this.findOne(USER_COLLECTION, {})) == null;
            const encryptedAccess = md5(user.password);
            const encryptionInfo = encryption_1.hashInfo(encryptedAccess);
            delete user.password;
            const insertion = Object.assign({}, user, { verified: false, hash: encryptionInfo.hash, salt: md5(encryptionInfo.salt), isAdmin: isFirstUser, verificationKey: faker.random.alphaNumeric(32) });
            const valid = Joi.validate(insertion, schema.user);
            if (valid.error) {
                throw new Error(valid.error);
            }
            return this.insert(USER_COLLECTION, insertion);
        });
    }
    verifyUser(userName, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.find(USER_COLLECTION, { userName }, { limit: 1 });
            if (users.length === 0) {
                return { valid: false, token: '' };
            }
            const user = users[0];
            const success = encryption_1.compareHash(md5(password), user.hash);
            let token = '';
            if (success) {
                token = faker.random.alphaNumeric(64);
                this.update(USER_COLLECTION, { _id: user._id }, { $set: { accessToken: token } });
            }
            return { success, token };
        });
    }
    getLanguageCollectionName(language) {
        return `language/${language}`;
    }
    getLocale(language, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.getLanguageCollectionName(language);
            return this.findOne(collection, {
                key
            });
        });
    }
    upsertLocale(language, key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.getLanguageCollectionName(language);
            const oldPair = yield this.getLocale(language, key);
            let oldValue = oldPair === null ? '' : oldPair.value;
            const newPair = { key: key.toLowerCase(), value, oldValue };
            if (oldPair === null) {
                return this.insert(collection, newPair);
            }
            else {
                return this.update(collection, { _id: oldPair._id }, { $set: newPair });
            }
        });
    }
}
exports.Database = Database;

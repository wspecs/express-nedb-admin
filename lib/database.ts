import * as Datastore from 'nedb';
import * as schema from './schema';
import * as log from 'great-logs';
import { getHumanReadableSize } from './utils';
const filesize = require('filesize');
const walk = require('walkdir');
const md5 = require('md5');
const faker = require('faker');
const Joi = require('joi');
import {
  afterSerialization,
  beforeDeserialization,
  hashInfo,
  compareHash
} from './encryption';
import { Schema } from './types';
const shell = require('shelljs');

const DATASTORE_FOLDER = './datastore';
const CONFIG_DATA_FOLDER = 'config';
const ARCHIVED_FOLDER = 'archived';
const USER_COLLECTION = `${CONFIG_DATA_FOLDER}/users`;
const SCHEMA_COLLECTION = `${CONFIG_DATA_FOLDER}/schema`;

shell.exec(`mkdir -p ${DATASTORE_FOLDER}`);
shell.exec(`mkdir -p ${DATASTORE_FOLDER}/${ARCHIVED_FOLDER}`);
shell.exec(`mkdir -p ${DATASTORE_FOLDER}/${CONFIG_DATA_FOLDER}`);

interface DatabaseInterface {
  [key: string]: Datastore;
}
export class Database {
  private DATABASE: DatabaseInterface = {};
  private static instance: Database;
  collectionCount = 0;
  languageCount = 0;
  userCount = 0;
  datastoreSize = 0;
  collectionsInfo: any[] = [];
  languagesInfo: any[] = [];

  private constructor() {
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

  getCollectionSize(collection: string) {
    const infos = this.collectionsInfo.filter(x => x.collection === collection);
    if (infos) {
      return infos[0].rows;
    }
    return 0;
  }

  async updateQuickStats() {
    this.collectionCount = 0;
    this.languageCount = 0;
    this.userCount = await this.count(USER_COLLECTION, {});
    this.datastoreSize = getHumanReadableSize(DATASTORE_FOLDER);
    const totalFilesCount = walk.sync(DATASTORE_FOLDER).length;
    this.collectionsInfo = [];
    this.languagesInfo = [];

    return new Promise((resolve, reject) => {
      let count = 0;
      walk.sync(DATASTORE_FOLDER, async (path: string, stats: any) => {
        if (
          path.endsWith('.db') &&
          !path.endsWith('users.db') &&
          !path.endsWith('schema.db')
        ) {
          const collection = path
            .substr(path.indexOf('datastore') + 10)
            .replace('.db', '');
          let collectionTitle = collection.replace('/', ' ');
          const info = {
            collection,
            collectionTitle,
            rows: await this.count(collection, {}),
            ...stats,
            size: filesize(stats.size)
          };
          if (path.indexOf('language/') >= 0) {
            this.languageCount++;
            this.languagesInfo.push(info);
          } else {
            this.collectionCount++;
            this.collectionsInfo.push(info);
          }
        }

        if (++count === totalFilesCount) resolve(this.collectionsInfo);
      });
    });
  }

  getCollectionName(collection: string) {
    return `${DATASTORE_FOLDER}/${collection}.db`;
  }

  private createCollection(collection: string) {
    log.debug('Creating new collection: %s', collection);
    this.DATABASE[collection] = new Datastore({
      filename: this.getCollectionName(collection),
      autoload: true,
      afterSerialization,
      beforeDeserialization
    });
  }

  async addNewCollection(collection: string, schema: any[]) {
    const found = await this.findOne(SCHEMA_COLLECTION, { collection });
    if (found == null) {
      await this.insert(SCHEMA_COLLECTION, {
        collection: collection.toLowerCase().replace(/ /g, '_'),
        schema
      });
      this.loadCollectionIfNeeded(collection);
    } else {
      throw new Error('Collection already exists');
    }
  }

  async findSchema(
    collection: string
  ): Promise<{ collection: string; schema: Schema[] }> {
    return this.findOne(SCHEMA_COLLECTION, { collection });
  }

  loadCollectionIfNeeded(collection: string) {
    if (!this.DATABASE[collection]) {
      this.createCollection(collection);
    }
  }

  async validateInsertion(collection: string, insertion: any) {
    if (collection === SCHEMA_COLLECTION) {
      return true;
    }
    await this.findSchema(collection);
    return true;
  }

  async updateSchema(collection: string, schema: any) {
    return this.update(SCHEMA_COLLECTION, { collection }, { $set: { schema } });
  }

  async deleteSchema(collection: string) {
    return this.archive(SCHEMA_COLLECTION, { collection });
  }

  async archiveCollection(collection: string) {
    const source = `${DATASTORE_FOLDER}/${collection}.db`;
    const destination = `${DATASTORE_FOLDER}/archived/${collection}.archived`;
    shell.exec(`mv ${source} ${destination}`);
    await this.updateQuickStats();
  }

  async insert(collection: string, insertion: any) {
    this.loadCollectionIfNeeded(collection);
    this.validateInsertion(collection, insertion);
    return new Promise((resolve, reject) => {
      (this.DATABASE[collection] as any).insert(
        {
          ...insertion,
          _created: new Date(),
          _updated: new Date(),
          _archived: false,
          _lastAction: 'insertion'
        },
        (err: Error, insertion: any) => {
          if (err) reject(err);
          else {
            log.debug('Insertion new entry in %s collection', collection);
            this.updateQuickStats();
            resolve(insertion);
          }
        }
      );
    });
  }

  async findOne(collection: string, filter = {}) {
    const items = await this.find(collection, filter, { limit: 1 });
    return items.length === 1 ? items[0] : null;
  }

  async find(
    collection: string,
    filter = {},
    options: { sort?: {}; skip?: number; limit?: number } = {
      skip: 0,
      limit: 0
    }
  ): Promise<any[]> {
    this.loadCollectionIfNeeded(collection);
    log.debug('looking up info in %s collection:', collection);
    return new Promise((resolve, reject) => {
      const query = (this.DATABASE[collection] as any).find({
        ...filter,
        _archived: false
      });
      if (options.sort) query.sort(options.sort);
      if (options.skip) query.skip(options.skip);
      if (options.limit) query.limit(options.limit);
      query.exec((err: Error, docs: any[]) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  async count(collection: string, filter = {}): Promise<number> {
    this.loadCollectionIfNeeded(collection);
    log.debug('looking up info in %s collection:', collection);
    return new Promise((resolve, reject) => {
      const query = (this.DATABASE[collection] as any).count({
        _archived: false,
        ...filter
      });
      query.exec((err: Error, count: number) => {
        if (err) reject(err);
        else resolve(count);
      });
    });
  }

  async update(collection: string, filter: {}, update: any) {
    this.loadCollectionIfNeeded(collection);
    return new Promise((resolve, reject) => {
      if (!update.$set) {
        update.$set = {};
      }
      if (!update.$set._updated) update.$set._updated = new Date();
      if (!update.$set._lastAction) update.$set._lastAction = 'updated';
      const query = (this.DATABASE[collection] as any).update(
        filter,
        update,
        { multi: true },
        (err: Error, numReplaced: number) => {
          if (err) reject(err);
          else {
            log.debug(
              'Updated %s entries in % collection',
              numReplaced,
              collection
            );
            resolve(numReplaced);
          }
        }
      );
    });
  }

  async archive(collection: string, filter: {}) {
    this.loadCollectionIfNeeded(collection);
    return this.update(collection, filter, {
      $set: { _archived: true, _archivedDate: new Date() }
    });
  }

  async unArchive(collection: string, filter: {}) {
    this.loadCollectionIfNeeded(collection);
    return this.update(collection, filter, {
      $set: { _archived: false },
      $unset: { _archivedDate: true }
    });
  }

  async addUser(user: any) {
    const usersFound = await this.find(
      USER_COLLECTION,
      { userName: user.userName },
      { limit: 1 }
    );
    if (usersFound.length > 0) {
      throw new Error('User already exists');
    }
    const isFirstUser = (await this.findOne(USER_COLLECTION, {})) == null;
    const encryptedAccess = md5(user.password);
    const encryptionInfo = hashInfo(encryptedAccess);
    delete user.password;
    const insertion = {
      ...user,
      verified: false,
      hash: encryptionInfo.hash,
      salt: md5(encryptionInfo.salt),
      isAdmin: isFirstUser,
      verificationKey: faker.random.alphaNumeric(32)
    };
    const valid = Joi.validate(insertion, schema.user);
    if (valid.error) {
      throw new Error(valid.error);
    }
    return this.insert(USER_COLLECTION, insertion);
  }

  async verifyUser(userName: string, password: string) {
    const users = await this.find(USER_COLLECTION, { userName }, { limit: 1 });
    if (users.length === 0) {
      return { valid: false, token: '' };
    }
    const user = users[0];
    const success = compareHash(md5(password), user.hash);
    let token = '';
    if (success) {
      token = faker.random.alphaNumeric(64);
      this.update(
        USER_COLLECTION,
        { _id: user._id },
        { $set: { accessToken: token } }
      );
    }
    return { success, token };
  }

  getLanguageCollectionName(language: string) {
    return `language/${language}`;
  }

  async getLocale(language: string, key: string) {
    const collection = this.getLanguageCollectionName(language);
    return this.findOne(collection, {
      key
    });
  }

  async upsertLocale(language: string, key: string, value: string) {
    const collection = this.getLanguageCollectionName(language);
    const oldPair = await this.getLocale(language, key);
    let oldValue = oldPair === null ? '' : oldPair.value;
    const newPair = { key: key.toLowerCase(), value, oldValue };
    if (oldPair === null) {
      return this.insert(collection, newPair);
    } else {
      return this.update(collection, { _id: oldPair._id }, { $set: newPair });
    }
  }
}

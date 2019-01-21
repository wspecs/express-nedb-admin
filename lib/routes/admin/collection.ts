import { Controller, Get, Post } from '@decorators/express';
import { Database } from '../../database';
import { getFormInput, getPaginationData } from '../../ejs-helper';
import { AdminMiddleware } from './middleware';
import { transformCollectionName, getCollectionUrl } from './helpers';

@Controller('/admin/collection', [AdminMiddleware])
export class AdminCollectionController {
  private db = Database.getInstance();

  @Get('/new')
  newCollectionPage(req: any, res: any) {
    res.serve('admin/collection_new', {});
  }

  @Post('/new')
  async newCollectionHandler(req: any, res: any) {
    try {
      await this.db.addNewCollection(req.body.collection, req.body.schema);
      res.send({ success: true });
    } catch (e) {
      res.status(500);
      res.send({ success: false });
    }
  }

  @Get('/all')
  async collectionsPage(req: any, res: any) {
    await this.db.updateQuickStats();
    const data = {
      collections: this.db.collectionsInfo.map((info: any) => ({
        ...info,
        href: getCollectionUrl(info.collection)
      }))
    };
    res.serve('admin/collections', data);
  }

  @Get('/:collection/modify')
  async modifyCollectionPage(req: any, res: any) {
    const collection = transformCollectionName(req.params.collection);
    const schema = await this.db.findSchema(collection);
    res.serve('admin/collection_modify', { collection, schema });
  }

  @Post('/:collection/modify')
  async deleteCollection(req: any, res: any) {
    const collection = transformCollectionName(req.params.collection);
    try {
      await this.db.updateSchema(req.body.collection, req.body.schema);
      res.send({ success: true });
    } catch (e) {
      res.status(500);
      res.send({ success: false });
    }
    res.send({ success: true });
  }

  @Get('/:collection/delete')
  async deleteCollectionPage(req: any, res: any) {
    const collection = transformCollectionName(req.params.collection);
    res.serve('admin/collection_delete', { collection });
  }

  @Post('/:collection/delete')
  async deleteCollectionHandler(req: any, res: any) {
    const collection = transformCollectionName(req.params.collection);
    this.db.deleteSchema(collection);
    await this.db.archiveCollection(collection);
    res.send({ success: true });
  }

  @Get('/:collection')
  async collectionListPage(req: any, res: any) {
    const collection = transformCollectionName(req.params.collection);
    const connectionUrl = getCollectionUrl(collection);
    const schema = await this.db.findSchema(collection);
    const limit = 24; // page size
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const size = this.db.getCollectionSize(transformCollectionName(collection));
    const pagination = getPaginationData('/', page, size, limit);
    const data = {
      collection,
      headers: schema.schema
        .filter(x => x.type === 'string' || x.type === 'boolean')
        .filter(x => x.preview)
        .map(x => x.name),
      size,
      pagination,
      rows: (await this.db.find(collection, {}, { limit, skip })).map(
        (row: any) => ({
          ...row,
          href: `${connectionUrl}/${row._id}`
        })
      )
    };
    res.serve('admin/collection_list', data);
  }

  @Get('/:collection/new')
  async newEntryPage(req: any, res: any) {
    const collection = transformCollectionName(req.params.collection);
    const schema = await this.db.findSchema(collection);
    const data: any = {
      collection,
      inputs: schema.schema.map(x => getFormInput(x))
    };
    res.serve('admin/entry_new', data);
  }

  @Post('/:collection/new')
  async newEntryHandler(req: any, res: any) {
    await this.db.insert(req.body.collection, req.body.entry);
    res.send({ success: true });
  }

  @Get('/:collection/:id')
  async getEntry(req: any, res: any) {
    const collection = transformCollectionName(req.params.collection);
    const item = await this.db.findOne(collection, { _id: req.params.id });
    const schema = await this.db.findSchema(collection);
    const data: any = {
      collection,
      ...item
    };
    res.serve('admin/entry_view', data);
  }
}

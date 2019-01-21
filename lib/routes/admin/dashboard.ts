import { Controller, Get, Response } from '@decorators/express';
import { Database } from '../../database';
import { AdminMiddleware } from './middleware';

@Controller('/admin', [AdminMiddleware])
export class AdminDashboardController {
  private db = Database.getInstance();

  @Get('/dashboard')
  async dashboard(@Response() res: any) {
    await this.db.updateQuickStats();
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
  }

  @Get('/')
  landing(@Response() res: any) {
    res.redirect('/admin/dashboard');
  }
}

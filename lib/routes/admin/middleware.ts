import { Middleware } from '@decorators/express';

const ADMIN_ROUTE_TEMPLATES_PATH = `${__dirname}/../../../../templates`;
export class AdminMiddleware implements Middleware {
  use(req: any, res: any, next: any) {
    // Templates path for ADMIN ROUTES
    req.templatesPath = ADMIN_ROUTE_TEMPLATES_PATH;
    if (
      ['/login', '/logout', '/register', '/forgot'].some(x => x === req.path)
    ) {
      next();
      return;
    }
    if (req.path.startsWith('/assets/') || req.path.startsWith('/docs/')) {
      next();
      return;
    }
    if (req.adminSession.user) {
      next();
      return;
    }
    res.redirect('/admin/login');
  }
}

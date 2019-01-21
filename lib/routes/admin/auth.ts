import { Controller, Get, Post } from '@decorators/express';
import { Database } from '../../database';
import { AdminMiddleware } from './middleware';

@Controller('/admin', [AdminMiddleware])
export class AdminAuthController {
  private db = Database.getInstance();

  @Get('/login')
  loginPage(req: any, res: any) {
    res.serve('admin/login', {});
  }

  @Post('/login')
  async loginHandler(req: any, res: any) {
    const verification = await this.db.verifyUser(
      req.body.userName,
      req.body.password
    );
    if (verification.success) {
      req.adminSession.user = verification.token;
    }
    res.send({ ...verification });
  }

  @Get('/logout')
  logout(req: any, res: any) {
    req.session.reset();
    res.redirect('/admin');
  }

  @Get('/register')
  registerPage(req: any, res: any) {
    res.serve('admin/register', {});
  }

  @Post('/register')
  async registerHandler(req: any, res: any) {
    await this.db.addUser(req.body);
    res.send({ success: true });
  }
}

import { Context, Next } from 'koa';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error caught by error handler:', error);
    
    ctx.status = (error as any).status || 500;
    ctx.body = {
      error: (error as Error).message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    };
  }
}

export default errorHandler;

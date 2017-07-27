import koaBunyan from 'koa-bunyan-logger';

export default (app) => {
  app.use(koaBunyan());
  app.use(koaBunyan.requestIdContext());
  app.use(koaBunyan.requestLogger());
  app.use(koaBunyan.timeContext());
  return app;
};

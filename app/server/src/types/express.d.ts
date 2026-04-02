declare module 'swagger-ui-express' {
  import type { RequestHandler, Router } from 'express';
  const swaggerUi: {
    serve: RequestHandler[];
    setup(
      doc: object,
      options?: { customCss?: string; customSiteTitle?: string; [key: string]: unknown }
    ): RequestHandler;
  };
  export default swaggerUi;
}

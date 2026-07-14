import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { appConfig } from './app';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Brunch Bouaké PMS API',
      version: '1.0.0',
      description: 'API documentation for Nucleus PMS Core (Brunch Bouaké)',
    },
    servers: [
      {
        url: `http://localhost:${appConfig.port}${appConfig.apiPrefix}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', ...([ swaggerUi.serve, swaggerUi.setup(swaggerSpec) ] as any[]));
};

import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import { MastraServer } from '@mastra/express'
import * as swaggerUi from 'swagger-ui-express'
import { mastra } from './mastra'

const app: Express = express();
const PORT = process.env.PORT || 4111;

// Middleware
app.use(express.json());

//Runs on every request, before Mastra context exists (DEV)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Initialize Mastra server
const server = new MastraServer({ 
  app, 
  mastra,
  openapiPath: '/openapi.json',
})

// Before init - runs before Mastra middleware
app.get('/early-health', (req, res) => res.json({ status: 'ok' }))

await server.init()

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Hello, World!" });
});

// After init - has access to Mastra context
app.get('/custom', (req, res) => {
  const mastra = res.locals.mastra
  // const requestContext = res.locals.requestContext
  // const abortSignal = res.locals.abortSignal

  const agent = mastra.getAgent('weatherAgent')
  res.json({ agent: agent.name })
})

// openapiPath is joined with the adapter prefix, so the spec is /api/openapi.json.
const openApiUrl = '/api/openapi.json'
const swaggerPage = swaggerUi.setup(null, {
  customSiteTitle: 'Mastra API',
  swaggerOptions: {
    url: openApiUrl,
  },
})

app.use('/swagger-ui', ...swaggerUi.serve, (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next()
    return
  }

  const pathname = req.originalUrl.split('?')[0]
  if (pathname !== '/swagger-ui' && pathname !== '/swagger-ui/') {
    next()
    return
  }

  if (!pathname.endsWith('/')) {
    res.redirect(308, '/swagger-ui/')
    return
  }

  swaggerPage(req, res, next)
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/swagger-ui`);
});

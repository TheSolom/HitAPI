import express, { type Request, type Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { pinoHttp } from 'pino-http';
import winston from 'winston';
import { CLIENT_ID } from '../../utils.js';
import {
    setConsumer,
    useHitAPI,
} from '../../../src/integrations/express/index.js';

const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
    ),
    transports: [new winston.transports.Console()],
});

const requestLoggingConfig = {
    enabled: true,
    logQueryParams: true,
    logRequestHeaders: true,
    logRequestBody: true,
    logResponseHeaders: true,
    logResponseBody: true,
    captureLogs: true,
    captureTraces: true,
};

export const getAppWithValidator = () => {
    const app = express();
    app.use(express.json());
    app.use(pinoHttp());

    useHitAPI(app, {
        clientId: CLIENT_ID,
        requestLogging: requestLoggingConfig,
    });

    app.get(
        '/hello',
        query('name').isString().isLength({ min: 2 }),
        query('age').isInt({ min: 18 }),
        (req: Request, res: Response) => {
            setConsumer(req, 'test');

            console.warn('Console test');
            req.log.info('Pino test');
            winstonLogger.info('Winston test');

            const result = validationResult(req);
            if (result.isEmpty()) {
                const query = req.query as Record<string, string>;

                res.type('txt');
                res.send(
                    `Hello ${query.name}! You are ${query.age} years old!`,
                );
                return;
            }
            res.status(400).send({ errors: result.array() });
        },
    );
    app.get('/hello/:id', (req: Request, res: Response) => {
        res.send(
            `Hello ID ${Array.isArray(req.params.id) ? req.params.id[0] : req.params.id}!`,
        );
    });
    app.post(
        '/hello',
        body('name').isString().isLength({ min: 2 }),
        body('age').isInt({ min: 18 }),
        (req: Request, res: Response) => {
            const result = validationResult(req);
            if (result.isEmpty()) {
                const body = req.body as Record<string, unknown>;

                res.type('txt');
                res.send(
                    `Hello ${body.name as string}! You are ${body.age as number} years old!`,
                );
                return;
            }
            res.status(400).send({ errors: result.array() });
        },
    );
    app.get('/error', () => {
        throw new Error('test');
    });

    return app;
};

export const getAppWithMiddlewareOnRouter = () => {
    const app = express();
    const router = express.Router();

    useHitAPI(router, {
        clientId: CLIENT_ID,
        basePath: '/api',
        requestLogging: requestLoggingConfig,
    });

    router.get('/hello', (req: Request, res: Response) => {
        res.send('Hello!');
    });

    app.use('/api', router);
    return app;
};

export const getAppWithNestedRouters = () => {
    const app = express();
    const router1 = express.Router();
    const router2 = express.Router({ mergeParams: true });
    const router3 = express.Router();
    const router4 = express.Router();

    useHitAPI(app, {
        clientId: CLIENT_ID,
        requestLogging: requestLoggingConfig,
    });

    router1.get('/health', (req: Request, res: Response) => {
        res.send('OK');
    });

    router2.get('/hello/:name', (req: Request, res: Response) => {
        res.send(
            `Hello ${Array.isArray(req.params.name) ? req.params.name[0] : req.params.name}!`,
        );
    });

    router3.get('/world', (req: Request, res: Response) => {
        res.send('World!');
    });

    router4.get('/', (req: Request, res: Response) => {
        res.send('Success!');
    });

    router2.use('/goodbye', router3);
    app.use('/', router1);
    app.use('/api/:version', router2);
    app.use('/test', router4);
    return app;
};

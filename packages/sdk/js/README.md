# HitAPI SDK for Node.js

[![npm](https://img.shields.io/npm/v/@hitapi/js?logo=npm&color=%23cb0000)](https://www.npmjs.com/package/@hitapi/js)

HitAPI is a simple API monitoring and analytics tool that makes it easy to understand API usage, monitor performance, and troubleshoot issues.
Get started in minutes by just adding a few lines of code. No infrastructure changes required, no dashboards to build.

## Key features

### API analytics

Track traffic, error and performance metrics for your API, each endpoint and
individual API consumers, allowing you to make informed, data-driven engineering
and product decisions.

### Request logs

Drill down from insights to individual API requests or use powerful search and filters to
find specific requests. View correlated application logs and traces for a complete picture
of each request, making troubleshooting faster and easier.

### Error tracking

Understand which validation rules in your endpoints cause client errors. Capture
error details and stack traces for 500 error responses, and have them linked to
Sentry issues automatically.

### API monitoring & alerts

Get notified immediately if something isn't right using custom alerts, synthetic
uptime checks and heartbeat monitoring. Alert notifications can be delivered via
email, Slack and Microsoft Teams.

## Supported frameworks

| Framework                                           | Supported versions |
| --------------------------------------------------- | ------------------ |
| [**Express**](https://github.com/expressjs/express) | `4.x`, `5.x`       |

## Getting started

### Express

Install the SDK:

```bash
npm install @hitapi/js
```

Then add the Apitally middleware to your application:

```javascript
import express from 'express';
import { useHitAPI, setConsumer } from '@hitapi/js/express';

const app = express();
app.use(express.json());

useHitAPI(app, {
    clientId: 'your-client-id', // Get this from your HitAPI dashboard
    requestLogging: {
        // Optional: customize request logging
        enabled: true,
        logQueryParams: true,
        logRequestHeaders: false,
        logRequestBody: false,
        logResponseHeaders: true,
        logResponseBody: false,
        logException: true,
        captureLogs: false,
        captureTraces: false,
        maskQueryParams: [/password/, /token/],
        maskHeaders: [/authorization/, /cookie/],
        maskBodyFields: [/password/, /credit_card/],
        excludePaths: [/^\/health/, /^\/metrics/],
    },
    logger: console, // Optional: custom logger
});

// Your routes
app.get('/api/users', (req, res) => {
    setConsumer(req, 'Tester'); // Optional: set consumer

    res.json([{ id: 1, name: 'John' }]);
});

app.listen(3000);
```

That's it! HitAPI will now automatically start collecting metrics for all your API endpoints.

## HitAPIConfig

| Option         | Type                          | Default   | Description                                            |
| -------------- | ----------------------------- | --------- | ------------------------------------------------------ |
| clientId       | string                        | Required  | Your HitAPI client ID from the dashboard               |
| requestLogging | Partial<RequestLoggingConfig> | {}        | Request logging configuration (see below)              |
| logger         | ILogger                       | undefined | Custom logger interface (e.g., console, pino, winston) |

## RequestLoggingConfig

| Option             | Type     | Default | Description                                               |
| ------------------ | -------- | ------- | --------------------------------------------------------- |
| enabled            | boolean  | false   | Enable/disable request logging                            |
| logQueryParams     | boolean  | true    | Whether to capture query parameters                       |
| logRequestHeaders  | boolean  | false   | Whether to capture request headers                        |
| logRequestBody     | boolean  | false   | Whether to capture request bodies                         |
| logResponseHeaders | boolean  | true    | Whether to capture response headers                       |
| logResponseBody    | boolean  | false   | Whether to capture response bodies                        |
| logException       | boolean  | true    | Whether to capture exception details                      |
| captureLogs        | boolean  | false   | Whether to capture application logs                       |
| captureTraces      | boolean  | false   | Whether to capture distributed traces                     |
| maskQueryParams    | RegExp[] | []      | Array of regex patterns for masking query parameters      |
| maskHeaders        | RegExp[] | []      | Array of regex patterns for masking headers               |
| maskBodyFields     | RegExp[] | []      | Array of regex patterns for masking body fields           |
| excludePaths       | RegExp[] | []      | Array of regex patterns for paths to exclude from logging |

## License

This library is licensed under the terms of the [MIT license](LICENSE).

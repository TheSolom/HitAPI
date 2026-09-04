# @hitapi/js - HitAPI SDK for Node.js

[![npm version](https://img.shields.io/npm/v/@hitapi/js?color=%23cb0000&logo=npm)](https://www.npmjs.com/package/@hitapi/js) [![Node Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Express](https://img.shields.io/badge/Express-4.x%20%7C%205.x-000000?logo=express&logoColor=white)](https://expressjs.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/TheSolom/HitAPI/blob/main/packages/sdk/js/LICENSE.txt)

[HitAPI Platform](https://github.com/TheSolom/HitAPI) • [Documentation](https://github.com/TheSolom/HitAPI#readme) • [Issue Tracker](https://github.com/TheSolom/HitAPI/issues) • [NPM Package](https://www.npmjs.com/package/@hitapi/js)

**`@hitapi/js`** is the official Node.js client SDK for [HitAPI](https://github.com/TheSolom/HitAPI)—a lightweight, open-source API monitoring and analytics platform.

Get full visibility into your API traffic, request logs, performance metrics, client error rates, and consumer usage in minutes with just a few lines of code.

---

## 📑 Table of Contents

- [Features](#-features)
- [Supported Frameworks](#-supported-frameworks)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
    - [TypeScript / ESM](#typescript--esm)
    - [CommonJS](#commonjs)
- [Where to Get Your Client ID](#-where-to-get-your-client-id)
- [Consumer & Tenant Tracking](#-consumer--tenant-tracking)
- [Configuration Reference](#-configuration-reference)
    - [HitAPIConfig](#hitapiconfig)
    - [RequestLoggingConfig](#requestloggingconfig)
- [Data Privacy & Sensitive Field Masking](#-data-privacy--sensitive-field-masking)
- [Excluding Endpoints](#-excluding-endpoints)
- [Custom Loggers](#-custom-loggers)
- [How It Works](#-how-it-works)
- [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)
- [Development & Testing](#-development--testing)
- [License](#-license)

---

## ✨ Features

- ⚡ **Zero Latency Impact**: In-memory queue buffering (`Denque`) batches and transmits telemetry in the background without delaying API responses.
- 📊 **Automatic Metric Aggregation**: Captures request volume, response time distributions, HTTP status codes, and endpoint performance automatically.
- 🔎 **Deep Request Logging**: Optionally inspect full request/response lifecycles, including query parameters, headers, payloads, and response status.
- 🛡️ **Privacy-First Data Masking**: Native regex rules scrub authorization tokens, cookies, passwords, and sensitive fields before telemetry ever leaves your server.
- 👥 **API Consumer Attribution**: Easily tag incoming requests with client IDs, customer names, or tenant tiers (`Free`, `Pro`, `Enterprise`) via `setConsumer()`.
- 💻 **Host Resource Telemetry**: Samples CPU and memory usage in the background to provide visibility into server load.
- 🔄 **Fault-Tolerant Delivery**: Built-in retry logic with exponential backoff (`fetch-retry`) ensures reliable ingestion even during transient network spikes.

---

## 🧩 Supported Frameworks

| Framework                             | Supported Versions | Import Path          | Status              |
| ------------------------------------- | ------------------ | -------------------- | ------------------- |
| [**Express**](https://expressjs.com/) | `4.x`, `5.x`       | `@hitapi/js/express` | ✅ Production Ready |
| [**NestJS**](https://nestjs.com/)     | `11.x`             | `@hitapi/js/nestjs`  | 🚧 In Progress      |

---

## 📦 Installation

Install the package via npm or your preferred package manager:

```bash
npm install @hitapi/js
```

---

## 🚀 Quick Start

### TypeScript / ESM

Add the HitAPI middleware to your Express application. Place it **early in your middleware pipeline**, right after body parsers:

```typescript
import express from 'express';
import { useHitAPI, setConsumer } from '@hitapi/js/express';

const app = express();

// 1. Standard body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Initialize HitAPI middleware
useHitAPI(app, {
    clientId: 'YOUR_APP_CLIENT_ID', // Replace with your HitAPI Client ID (UUID)
    requestLogging: {
        enabled: true,
        logQueryParams: true,
        logResponseHeaders: true,
        maskQueryParams: [/token/i, /api_?key/i, /password/i],
        maskHeaders: [/authorization/i, /cookie/i],
        maskBodyFields: [/password/i, /secret/i, /credit_?card/i],
        excludePaths: [/^\/health/, /^\/metrics/],
    },
});

// 3. Define your routes
app.get('/api/users', (req, res) => {
    // Optionally tag the request with an API consumer / tenant
    setConsumer(req, 'tenant_acme_corp');

    res.json([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
    ]);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

### CommonJS

If your project uses CommonJS:

```javascript
const express = require('express');
const { useHitAPI, setConsumer } = require('@hitapi/js/express');

const app = express();
app.use(express.json());

useHitAPI(app, {
    clientId: 'YOUR_APP_CLIENT_ID',
});

app.get('/api/test', (req, res) => {
    setConsumer(req, 'tenant_123');
    res.json({ message: 'Hello World' });
});

app.listen(3000);
```

---

## 🔑 Where to Get Your Client ID

1. Open your [HitAPI Dashboard](https://github.com/TheSolom/HitAPI) (cloud or self-hosted instance).
2. Navigate to **Apps** $\rightarrow$ **New Application**.
3. Name your application and copy the generated **Client ID** (UUID format, e.g. `65973e74-3b71-4392-bbfa-d108a8a5d9d8`).
4. Pass this Client ID to `useHitAPI(app, { clientId: '...' })`.

---

## 👥 Consumer & Tenant Tracking

Use the `setConsumer(req, ...)` helper inside any route handler or authentication middleware to attribute API requests to specific clients, API keys, or tenants.

### String Identifier

Tag requests with a simple identifier (such as an organization ID, user ID, or API key):

```typescript
app.get('/api/projects', (req, res) => {
    setConsumer(req, 'org_12345');
    res.json({ projects: [] });
});
```

### Rich Consumer Metadata (`ConsumerInfo`)

Provide rich metadata to organize and group consumers directly in the HitAPI dashboard:

```typescript
import { setConsumer } from '@hitapi/js/express';

app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        setConsumer(req, {
            identifier: 'cust_9876', // Unique consumer ID (Required)
            name: 'Acme Corporation', // Human-readable display name (Optional)
            group: 'Enterprise', // Customer tier or group (Optional)
        });
    }

    next();
});
```

---

## ⚙️ Configuration Reference

### `HitAPIConfig`

Options passed into `useHitAPI(app, config)`:

| Option           | Type                            | Default      | Description                                                                  |
| ---------------- | ------------------------------- | ------------ | ---------------------------------------------------------------------------- |
| `clientId`       | `string`                        | **Required** | The application Client ID (UUID format) obtained from your HitAPI dashboard. |
| `basePath`       | `string`                        | `undefined`  | Optional URL prefix for your API endpoints (e.g., `'/api/v1'`).              |
| `requestLogging` | `Partial<RequestLoggingConfig>` | `{}`         | Granular configuration for individual request logs.                          |
| `logger`         | `ILogger`                       | `console`    | Custom logger instance (e.g. `console`, `pino`, `winston`).                  |

### `RequestLoggingConfig`

Fine-tune what request and response details are captured:

| Option               | Type       | Default | Description                                                                       |
| -------------------- | ---------- | ------- | --------------------------------------------------------------------------------- |
| `enabled`            | `boolean`  | `false` | Enable or disable detailed request/response logging.                              |
| `logQueryParams`     | `boolean`  | `true`  | Capture URL query parameters.                                                     |
| `logRequestHeaders`  | `boolean`  | `false` | Capture incoming HTTP request headers.                                            |
| `logRequestBody`     | `boolean`  | `false` | Capture JSON request payloads.                                                    |
| `logResponseHeaders` | `boolean`  | `true`  | Capture outgoing HTTP response headers.                                           |
| `logResponseBody`    | `boolean`  | `false` | Capture response bodies.                                                          |
| `logException`       | `boolean`  | `true`  | Capture unhandled error messages and stack traces.                                |
| `captureLogs`        | `boolean`  | `false` | Correlate application console/logger statements with requests.                    |
| `maskQueryParams`    | `RegExp[]` | `[]`    | Array of regex patterns to redact sensitive query parameters.                     |
| `maskHeaders`        | `RegExp[]` | `[]`    | Array of regex patterns to redact sensitive header values.                        |
| `maskBodyFields`     | `RegExp[]` | `[]`    | Array of regex patterns to redact sensitive JSON keys in request/response bodies. |
| `excludePaths`       | `RegExp[]` | `[]`    | Array of regex patterns for route paths completely excluded from logging.         |

---

## 🛡️ Data Privacy & Sensitive Field Masking

HitAPI enforces privacy by sanitizing sensitive data **in-memory on your application server before transmission**.

Any field matching the provided regular expressions is replaced with `[Filtered]`:

```typescript
useHitAPI(app, {
    clientId: 'YOUR_APP_CLIENT_ID',
    requestLogging: {
        enabled: true,
        // Redact specific query parameters
        maskQueryParams: [/token/i, /api_?key/i, /password/i, /secret/i],
        // Redact security headers
        maskHeaders: [/authorization/i, /cookie/i, /x-api-key/i],
        // Redact sensitive JSON payload properties (supports nested keys)
        maskBodyFields: [
            /password/i,
            /pin/i,
            /ssn/i,
            /cvv/i,
            /credit_?card/i,
            /secret/i,
        ],
    },
});
```

---

## 🚫 Excluding Endpoints

Prevent health checks, metrics probes, or static files from polluting your API analytics using `excludePaths`:

```typescript
useHitAPI(app, {
    clientId: 'YOUR_APP_CLIENT_ID',
    requestLogging: {
        excludePaths: [
            /^\/healthz?$/,
            /^\/metrics$/,
            /^\/ready$/,
            /^\/favicon\.ico$/,
        ],
    },
});
```

---

## 📝 Custom Loggers

By default, the SDK outputs internal diagnostics and warnings via the standard `console`. You can supply your own logger implementing `ILogger` (such as [Pino](https://github.com/pinojs/pino) or [Winston](https://github.com/winstonjs/winston)):

```typescript
import pino from 'pino';
import { useHitAPI } from '@hitapi/js/express';

const logger = pino({ level: 'info' });

useHitAPI(app, {
    clientId: 'YOUR_APP_CLIENT_ID',
    logger,
});
```

---

## 🔬 How It Works

1. **Route Registration**: On server startup, HitAPI inspects your Express router stack to detect endpoints, paths, and HTTP methods.
2. **Request Interception**: Incoming requests are timed, response status codes are captured, and request bodies/headers are sanitized.
3. **In-Memory Buffering**: Telemetry data is pushed to a high-speed in-memory double-ended queue (`Denque`).
4. **Batch Synchronization**: Every 60 seconds (or 10 seconds during initial bootstrap), an asynchronous worker flushes and compresses the telemetry batch to the HitAPI ingestion endpoint.
5. **Zero Thread Blocking**: Telemetry transmission occurs asynchronously using non-blocking I/O—if the ingestion service is temporarily unreachable, your application performance is completely insulated.

---

## ❓ Frequently Asked Questions (FAQ)

### Why don't I see requests immediately in the dashboard?

To guarantee that monitoring never slows down your application, HitAPI buffers metrics in memory and transmits them in batches. The **first batch synchronizes 10 seconds after server startup**, and subsequent flushes occur **every 60 seconds**.

### Does HitAPI capture sensitive customer data?

No. By default, request bodies and request headers are **not captured** (`false`). When you choose to enable them, HitAPI's regex masking rules scrub tokens, authorization headers, passwords, and credit card numbers **locally on your server** before anything is sent over the network.

### What happens if the HitAPI ingestion service is temporarily down?

Your application will experience **zero disruption**. The SDK catches network errors gracefully, retries with exponential backoff, and drops telemetry if buffers reach capacity so your app's memory remains protected.

---

## 🧪 Development & Testing

Within the monorepo root:

```bash
# Build the SDK
npm run build --workspace=packages/sdk/js

# Run SDK unit tests
npm run test:sdk

# Run tests in watch mode
npm test --workspace=packages/sdk/js -- --watch

# Lint SDK source code
npm run lint --workspace=packages/sdk/js
```

---

## 📄 License

This library is licensed under the terms of the [MIT License](https://github.com/TheSolom/HitAPI/blob/main/packages/sdk/js/LICENSE.txt).

# HitAPI - API Analytics and Monitoring Platform

A complete, open-source observability platform built with NestJS and Node.js, focused on API monitoring and analytics without the operational overhead of traditional observability tools.

## 📋 **Project Overview**

- **Real-time API monitoring** & analytics
- **Request/response logging** with detailed tracing
- **Performance metrics** (response times, error rates, Apdex scores)
- **Consumer tracking** & API usage analytics
- **Alerting system** with multiple notification channels
- **Team collaboration** & multi-app management

## 🏗️ **Architecture**

### **Monorepo Structure**

```
HitAPI/
├── apps/
│   ├── api/                   # NestJS Backend API
├── packages/
│   ├── sdk/
│       ├── js/                # Official Node.js SDK
│   └── shared/                # Shared files
│   └── types/                 # TypeScript types
├── .husky/                    # Git hooks
├── LICENSE                    # MIT License
└── package.json               # Root workspace config
```

### **Technology Stack**

- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: PostgreSQL, Redis
- **Queue**: BullMQ
- **Infrastructure**: Docker, Swagger
- **SDK**: Node.js, Express middleware

## 🚀 **Quick Start**

### **Using the SDK in Your App**

```javascript
// Install the SDK
npm install @hitapi/js

// Express.js integration
import express from 'express';
import { useHitAPI, setConsumer } from '@hitapi/js/express';

const app = express();
useHitAPI(app, { clientId: '65973e74-3b71-4392-bbfa-d108a8a5d9d8' });

app.get('/api/test', (req, res) => {
    setConsumer(req, 'tester');
    res.send({ message: 'Hello World!' });
});

app.listen(3000, () => console.log('Server started on port 3000'));
```

## 🔧 **Development**

### **Workspace Commands**

```bash
# Install all dependencies
npm install

# Run all tests
npm test

# Build all packages
npm run build

# Run API in development mode
npm run dev --workspace=apps/api

# Run SDK tests
npm test --workspace=packages/sdk/js

# Lint all packages
npm run lint --workspaces
```

### **Development Workflow**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 **Roadmap**

### **Phase 1: Foundation** ✅

- [x] Authentication & user management
- [x] Team/workspace system
- [x] Application management

### **Phase 2: Data Collection** 🚧

- [x] Request logging infrastructure
- [x] Data ingestion API
- Node.js SDK development

### **Phase 3: Analytics** 🔄

- [ ] Traffic analytics dashboard
- [ ] Error tracking & aggregation
- [ ] Performance monitoring
- [ ] Consumer analytics

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

## 🙏 **Acknowledgments**

- Inspired by [Apitally.io](https://apitally.io)

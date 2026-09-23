services:
  - type: web
    name: baat
    runtime: node
    rootDir: .
    buildCommand: npm install && npm run install:backend && npm run build && npm run build:backend
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: baat-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: CLIENT_ORIGIN
        value: https://your-app-name.onrender.com

databases:
  - name: baat-db
    databaseName: baat
    user: baat

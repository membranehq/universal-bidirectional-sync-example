# Files Bidirectional Sync Example

This is an application showcasing how you can implement bidirectional sync of files

## Prerequisites

- Node.js 18+
- Integration.app workspace credentials (Workspace Key and Secret). [Get credentials](https://console.integration.app/settings/workspace) from the workspace settings.
- MongoDB connection string (We provide a docker-compose file to spin up a local MongoDB instance. See [Using mongodb via Docker](#using-mongodb-via-docker) for more details.)
- AWS credentials (for S3)

## Setup

### 1. **Clone repository & Install dependencies:**

```bash
npm install
# or
yarn install
```

### 2. **Set up environment variables file:**

```bash
# Copy the sample environment file
cp .env-sample .env
```

### 3. **Add your credentials to the `.env` file:**

> Note: The following credentials are optional but enable additional features:

- **AWS S3**: Enables file download and storage in S3

# Universal Bidirectional Sync Example

A comprehensive example application demonstrating how to use [Membrane](https://integration.app/) to build a bidirectional sync application that can sync objects to and from multiple integrations.

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A [Integration.app](https://integration.app/) account

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/membranehq/membrane-bidirectional-sync.git
cd membrane-bidirectional-sync
pnpm install
```

### 2. Import the elements into your workspace

This example uses the following integration elements:

- **[Data Sources](https://docs.integration.app/docs/data-sources#/)**: Pre-configured data models for Contacts, Companies, Users, Jobs, Job Applications, and other objects in our [Universal Data Model](https://docs.integration.app/docs/universal-data-models#/)
- **[Field Mappings](https://docs.integration.app/docs/field-mappings#/)**: Pre-configured field mappings for the Universal Data Model
- **[Integrations](https://docs.integration.app/docs/external-apps#/)**: These are third party apps like Hubspot, Salesforce, etc.
- **[Actions](https://docs.integration.app/docs/actions#/)**: Entities that represent a simple request to an integration. e.g `Create Contact`, `Update Contact`, ...

They can be imported into your workspace using the [Membrane CLI](https://www.npmjs.com/package/@membranehq/cli), to import the elements:

1. Install the Membrane CLI

```bash
npm install -g @membranehq/cli
```

2. Populate the config file with your workspace key and secret (This will open your browser to the workspace and get the workspace key and secret)

```bash
membrane init
```

3. Push the elements into your workspace

```bash
membrane push
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with your workspace key and secret

```env
# Integration.app Configuration
INTEGRATION_APP_WORKSPACE_KEY=your_workspace_key
INTEGRATION_APP_WORKSPACE_SECRET=your_workspace_secret
```

### 4. Configure Integrations

In your Membrane workspace:

1. Navigate to your [Integrations page](https://console.integration.app/w/0/external-apps/integrations)
2. For each integration you want to use, add the necessary credentials, some integrations like `Hubspot` use our [Auth Proxy](https://docs.integration.app/docs/auth-proxy#/) so providing adding credentials isn't required.

### 5. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔗 Links

- [Membrane Docs](https://docs.integration.app/)
- [Membrane Platform](https://integration.app/)
- [API Documentation](https://docs.integration.app/docs/api)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

class MCPClient {
  private static instance: MCPClient;
  private client: Client | null = null;
  private connecting: Promise<Client> | null = null;

  private constructor() { }

  static getInstance() {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  async connect() {
    // Return existing client if already connected
    if (this.client) {
      return this.client;
    }

    // Wait for ongoing connection if already connecting
    if (this.connecting) {
      return this.connecting;
    }

    // Start new connection
    this.connecting = this._connect();
    
    try {
      this.client = await this.connecting;
      return this.client;
    } finally {
      this.connecting = null;
    }
  }

  private async _connect(): Promise<Client> {
    // Spawn MCP server (mongodb-mcp-server)
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "mongodb-mcp-server@latest", "--readOnly"],
      env: {
        ...process.env,
        MDB_MCP_CONNECTION_STRING: process.env.mongo_uri!,
      }
    });

    const client = new Client(
      {
        name: "instaviz-mcp-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
    console.log("✓ MCP Connected to MongoDB");

    return client;
  }

  async call(toolName: string, args: any = {}) {
    try {
      const client = await this.connect();

      console.log(`Calling MCP tool: ${toolName}`);
      console.log('Arguments:', JSON.stringify(args, null, 2));

      const result = await client.callTool({
        name: toolName,
        arguments: args,
      });

      console.log(`MCP tool ${toolName} completed successfully`);
      
      // Check if result has content
      if (result && result.content) {
        console.log('Result type:', typeof result.content);
        console.log('Result preview:', JSON.stringify(result.content).slice(0, 200));
      }
      
      return result;
      
    } catch (err: any) {
      console.error(` MCP tool call failed for ${toolName}:`, err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack?.slice(0, 200)
      });
      throw err;
    }
  }

  async listTools() {
    try {
      const client = await this.connect();
      const tools = await client.listTools();

      const toolDetails = tools.tools.map((t: any) => ({
        name: t.name,
        description: t.description || 'No description',
        inputSchema: t.inputSchema
      }));

      console.log("MCP Available Tools:", toolDetails.map(t => t.name).join(', '));
      return toolDetails;
      
    } catch (err) {
      console.error('Failed to list MCP tools:', err);
      return [];
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.close();
        console.log("MCP client disconnected");
      } catch (err) {
        console.error("Error disconnecting MCP client:", err);
      }
      this.client = null;
    }
  }
}

export default MCPClient.getInstance();
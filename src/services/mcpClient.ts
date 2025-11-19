import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

class MCPClient {
  private static instance: MCPClient;
  private client: Client | null = null;

  private constructor() { }

  static getInstance() {
    if (!MCPClient.instance) MCPClient.instance = new MCPClient();
    return MCPClient.instance;
  }

  async connect() {
    if (this.client) return this.client;

    // Spawn MCP server (mongodb-mcp-server)
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "mongodb-mcp-server@latest", "--readOnly"],
      env: {
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

    console.log("MCP Connected ");

    this.client = client;
    return client;
  }

  async call(toolName: string, args: any = {}) {
    const client = await this.connect();

    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });

    return result;
  }

  async listTools() {
    const client = await this.connect();
    const tools = await client.listTools();
    console.log('Available MCP tools:', JSON.stringify(tools, null, 2));
    return tools;
  }
}

export default MCPClient.getInstance();

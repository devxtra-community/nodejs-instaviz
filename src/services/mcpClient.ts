// import { Client } from '@modelcontextprotocol/sdk/client/index.js';
// import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
// import { Tool, ListToolsResult, CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// interface MongoDBDocument {
//   [key: string]: any;
// }

// interface InsertResult {
//   insertedCount: number;
//   results: any[];
// }

// interface MCPClientConfig {
//   name?: string;
//   version?: string;
//   mongodbUri?: string;
// }

// class MongoDBMCPClient {
//   private client: Client | null;
//   private transport: StdioClientTransport | null;
//   private tools: Tool[];
//   private config: MCPClientConfig;

//   constructor(config: MCPClientConfig = {}) {
//     this.client = null;
//     this.transport = null;
//     this.tools = [];
//     this.config = {
//       name: config.name || 'csv-insights-app',
//       version: config.version || '1.0.0',
//       mongodbUri: config.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb',
//     };
//   }

//   /**
//    * Connect to MongoDB MCP server
//    */
//   async connect(): Promise<boolean> {
//     try {
//       // Create the MCP client
//       this.client = new Client(
//         {
//           name: this.config.name!,
//           version: this.config.version!,
//         },
//         {
//           capabilities: {},
//         },
//       );

//       // Create transport to connect to MongoDB MCP server
//       // Option 1: If MongoDB MCP server is already running as a separate process
//       this.transport = new StdioClientTransport({
//         command: 'npx',
//         args: ['-y', '@modelcontextprotocol/server-mongodb', this.config.mongodbUri!],
//       });

//       // Option 2: If you have a local MongoDB MCP server file
//       // this.transport = new StdioClientTransport({
//       //   command: 'node',
//       //   args: ['./mongodb-mcp-server.js']
//       // });

//       // Connect client to transport
//       await this.client.connect(this.transport);

//       console.log('✅ Connected to MongoDB MCP server');

//       // List available tools
//       const toolsList: ListToolsResult = await this.client.listTools();
//       this.tools = toolsList.tools;

//       console.log(
//         `📋 Found ${this.tools.length} tools:`,
//         this.tools.map(t => t.name),
//       );

//       return true;
//     } catch (error) {
//       console.error('❌ Failed to connect to MongoDB MCP:', error);
//       throw error;
//     }
//   }

//   /**
//    * Check if client is connected
//    */
//   isConnected(): boolean {
//     return this.client !== null;
//   }

//   /**
//    * Get list of available tools
//    */
//   getTools(): Tool[] {
//     return this.tools;
//   }

//   /**
//    * Call a tool
//    */
//   async callTool(toolName: string, args: Record<string, any>): Promise<any> {
//     if (!this.client) {
//       throw new Error('MCP client not connected. Call connect() first.');
//     }

//     try {
//       const result: CallToolResult = await this.client.callTool({
//         name: toolName,
//         arguments: args,
//       });

//       // Parse the response
//       if (result.content && result.content.length > 0) {
//         const firstContent = result.content[0];

//         // Check if it's a text content type
//         if (firstContent.type === 'text' && 'text' in firstContent) {
//           try {
//             return JSON.parse(firstContent.text);
//           } catch {
//             // If JSON parse fails, return the text as is
//             return firstContent.text;
//           }
//         }
//       }

//       return result;
//     } catch (error) {
//       console.error(`Failed to call tool ${toolName}:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Insert documents into collection
//    */
//   async insertMany(collection: string, documents: MongoDBDocument[]): Promise<InsertResult> {
//     const results: any[] = [];

//     for (const doc of documents) {
//       const result = await this.callTool('mongodb_insert', {
//         collection,
//         document: doc,
//       });
//       results.push(result);
//     }

//     return { insertedCount: results.length, results };
//   }

//   /**
//    * Insert single document into collection
//    */
//   async insertOne(collection: string, document: MongoDBDocument): Promise<any> {
//     return await this.callTool('mongodb_insert', {
//       collection,
//       document,
//     });
//   }

//   /**
//    * Find documents in collection
//    */
//   async find(
//     collection: string,
//     query: Record<string, any> = {},
//     limit: number = 100,
//   ): Promise<MongoDBDocument[]> {
//     return await this.callTool('mongodb_find', {
//       collection,
//       query,
//       limit,
//     });
//   }

//   /**
//    * Find one document in collection
//    */
//   async findOne(
//     collection: string,
//     query: Record<string, any> = {},
//   ): Promise<MongoDBDocument | null> {
//     const results = await this.find(collection, query, 1);
//     return results.length > 0 ? results[0] : null;
//   }

//   /**
//    * Run aggregation pipeline
//    */
//   async aggregate(collection: string, pipeline: Record<string, any>[]): Promise<any[]> {
//     return await this.callTool('mongodb_aggregate', {
//       collection,
//       pipeline,
//     });
//   }

//   /**
//    * Update documents
//    */
//   async updateMany(
//     collection: string,
//     filter: Record<string, any>,
//     update: Record<string, any>,
//   ): Promise<any> {
//     return await this.callTool('mongodb_update', {
//       collection,
//       filter,
//       update,
//     });
//   }

//   /**
//    * Update one document
//    */
//   async updateOne(
//     collection: string,
//     filter: Record<string, any>,
//     update: Record<string, any>,
//   ): Promise<any> {
//     return await this.updateMany(collection, filter, update);
//   }

//   /**
//    * Delete documents
//    */
//   async deleteMany(collection: string, filter: Record<string, any>): Promise<any> {
//     return await this.callTool('mongodb_delete', {
//       collection,
//       filter,
//     });
//   }

//   /**
//    * Delete one document
//    */
//   async deleteOne(collection: string, filter: Record<string, any>): Promise<any> {
//     return await this.deleteMany(collection, filter);
//   }

//   /**
//    * List all collections
//    */
//   async listCollections(): Promise<string[]> {
//     return await this.callTool('mongodb_list_collections', {});
//   }

//   /**
//    * Count documents in collection
//    */
//   async count(collection: string, query: Record<string, any> = {}): Promise<number> {
//     const pipeline = [{ $match: query }, { $count: 'total' }];

//     const result = await this.aggregate(collection, pipeline);
//     return result.length > 0 ? result[0].total : 0;
//   }

//   /**
//    * Disconnect from MCP server
//    */
//   async disconnect(): Promise<void> {
//     if (this.client) {
//       await this.client.close();
//       this.client = null;
//       this.transport = null;
//       console.log('🔌 Disconnected from MongoDB MCP server');
//     }
//   }
// }

// export default MongoDBMCPClient;
// export type { MongoDBDocument, InsertResult, MCPClientConfig };

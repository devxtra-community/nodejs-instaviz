import type { FunctionDeclaration } from "@google/generative-ai";
import { SchemaType } from "@google/generative-ai";

export const mcpToolDeclarations: FunctionDeclaration[] = [
  {
    name: "aggregate",
    description: "Execute MongoDB aggregation pipeline to compute chart data",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        database: {
          type: SchemaType.STRING,
          description: "Database name"
        },
        collection: {
          type: SchemaType.STRING,
          description: "Collection name"
        },
        pipeline: {
          type: SchemaType.ARRAY,
          description: "MongoDB aggregation pipeline stages",
          items: {
            type: SchemaType.OBJECT,
            description: "Single pipeline stage",
            properties: {}   // <-- REQUIRED but valid empty object
          }
        }
      },
      required: ["database", "collection", "pipeline"]
    }
  },

  {
    name: "find",
    description: "Query MongoDB collection to fetch documents",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        database: {
          type: SchemaType.STRING,
          description: "Database name"
        },
        collection: {
          type: SchemaType.STRING,
          description: "Collection name"
        },
        query: {
          type: SchemaType.OBJECT,
          description: "MongoDB query filter",
          properties: {}  // <-- empty but valid shape
        }
      },
      required: ["database", "collection", "query"]
    }
  }
];

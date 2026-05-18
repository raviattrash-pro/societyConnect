import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Base URL for the SocietyConnect Spring Boot backend
const API_BASE_URL = "http://localhost:8080/api";

const server = new Server(
  {
    name: "societyconnect-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_categories",
        description: "List all available service categories in SocietyConnect (e.g. Plumber, Electrician).",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_services",
        description: "Search for available services based on query, category, or rating.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search keyword for service or provider name" },
            categoryId: { type: "number", description: "ID of the category to filter by" },
            minRating: { type: "number", description: "Minimum rating out of 5 (e.g. 4.0)" }
          },
        },
      },
      {
        name: "get_provider_details",
        description: "Get full details, reviews, and services offered by a specific provider.",
        inputSchema: {
          type: "object",
          properties: {
            providerId: { type: "number", description: "The ID of the provider to fetch details for" }
          },
          required: ["providerId"],
        },
      },
      {
        name: "check_group_discounts",
        description: "Check for active group booking discounts in specific buildings or categories.",
        inputSchema: {
          type: "object",
          properties: {
            buildingName: { type: "string", description: "Filter by building (e.g. Tower A)" },
            categoryId: { type: "number", description: "Filter by service category" }
          },
        },
      },
      {
        name: "broadcast_emergency",
        description: "Alert nearby providers for critical emergencies like pipe bursts or electrical fires.",
        inputSchema: {
          type: "object",
          properties: {
            serviceType: { type: "string", enum: ["PLUMBING", "ELECTRICAL", "MEDICAL"], description: "The type of emergency" },
            location: { type: "string", description: "Specific flat/wing details" }
          },
          required: ["serviceType", "location"],
        },
      }
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "list_categories") {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "search_services") {
      const params = new URLSearchParams();
      if (args.query) params.append("query", args.query);
      if (args.categoryId) params.append("categoryId", args.categoryId);
      if (args.minRating) params.append("minRating", args.minRating);

      const response = await axios.get(`${API_BASE_URL}/services?${params.toString()}`);
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "get_provider_details") {
      const response = await axios.get(`${API_BASE_URL}/providers/${args.providerId}`);
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }
    
    if (name === "check_group_discounts") {
      // Logic would fetch from a new discounts endpoint
      const response = await axios.get(`${API_BASE_URL}/discounts/active`);
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "broadcast_emergency") {
      const response = await axios.post(`${API_BASE_URL}/emergency/broadcast`, args);
      return {
        content: [{ type: "text", text: "Emergency alert broadcasted to all nearby providers!" }],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    return {
      content: [{ type: "text", text: `Error calling API: ${errorMsg}` }],
      isError: true,
    };
  }
});

// Start the server using stdio transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SocietyConnect MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});

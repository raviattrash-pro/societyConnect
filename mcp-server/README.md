# SocietyConnect MCP Server

This is the Model Context Protocol (MCP) server for **SocietyConnect**. It acts as a bridge, exposing the SocietyConnect Spring Boot backend to AI assistants like Claude Desktop.

When connected, AI assistants can:
1. List all available service categories.
2. Search for local service providers by name, category, or rating.
3. Fetch detailed provider profiles and reviews.

## Prerequisites
- Node.js installed on your machine.
- SocietyConnect Spring Boot Backend running on `http://localhost:8080`.

## Installation

1. Navigate to this directory:
   ```bash
   cd D:\HyperlocalCommunityServicePlatform\mcp-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Connecting to Claude Desktop

To allow Claude Desktop to use SocietyConnect tools natively, you need to update its configuration file.

1. Open the Claude Desktop configuration file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the `societyconnect` server configuration to the `mcpServers` object:

```json
{
  "mcpServers": {
    "societyconnect": {
      "command": "node",
      "args": ["D:/HyperlocalCommunityServicePlatform/mcp-server/index.js"]
    }
  }
}
```

3. Restart Claude Desktop.
4. Open a chat and say: *"Can you check SocietyConnect for a plumber?"* or *"List all the categories in SocietyConnect."* Claude will securely fetch the live data from your local backend!

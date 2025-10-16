# Google ADK Agent Extension

This is a Gemini CLI extension for interacting with ADK (Agent Development Kit) agents.

## Features

### MCP Server Tools

This extension provides an MCP server with the following tools:

*   `list_adks`: Fetches the list of available ADK servers.
*   `list_adk_agents`: Fetches a list of available agents from a specific ADK server.
*   `create_session`: Creates a new session for a specified agent.
*   `send_message_to_agent`: Sends a message to an agent session and gets the result.

### Custom Commands

This extension provides the following custom commands:

*   `/adk-ext:list_adks`: A shortcut to list available ADK servers.
*   `/adk-ext:list_adk_agent`: A shortcut to list available agents from a specific ADK server.
*   `/adk-ext:agent_chat`: A command to interact with an agent in a chat-like manner.

## Installation

You can install this extension from its Git repository:

```bash
gemini extensions install <repository-url>
```

## Usage

After installation, you can use the custom commands in your Gemini CLI session.

**Example:**

1.  List available ADKs:
    ```
    /adk-ext:list_adks
    ```

2.  List agents for an ADK:
    ```
    /adk-ext:list_adk_agent
    ```
    (You will be prompted for the ADK server URL)

3.  Chat with an agent:
    ```
    /adk-ext:agent_chat
    ```
    (You will be prompted for the required parameters)

You can also directly use the tools provided by the MCP server in your prompts.

## Development

### Prerequisites

*   Node.js
*   TypeScript
*   Gemini CLI

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd google-adk-agent-extension
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the extension:**
    ```bash
    npm run build
    ```

4.  **Link for local development:**
    ```bash
    gemini extensions link .
    ```

After linking, restart your Gemini CLI session to use the local version of the extension.


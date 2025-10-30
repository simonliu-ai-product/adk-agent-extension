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
*   `/adk-ext:config_add_server`: Add a new ADK server configuration.
*   `/adk-ext:config_list_servers`: List all ADK server configurations.
*   `/adk-ext:config_remove_server`: Remove an ADK server configuration.
*   `/adk-ext:create_agent`: Create a new agent.
*   `/adk-ext:deploy_agent`: Deploy an agent.
*   `/adk-ext:evaluate_agent`: Evaluate an agent.
*   `/adk-ext:interactive_chat`: A command to interact with an agent in a chat-like manner.
*   `/adk-ext:list_agent_tools`: List all tools for an agent.
*   `/adk-ext:scan_safety`: Scan for safety issues.
*   `/adk-ext:visualize`: Visualize the agent system schema.

## Installation

You can install this extension from its Git repository:

```bash
gemini extensions install https://github.com/simonliu-ai-product/adk-agent-extension
```

## Usage

After installation, you can use the custom commands in your Gemini CLI session.
For more detailed usage instructions and examples, please refer to the [Usage Guide](doc/en/usage.md).

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

## TODO List

*   [ ] Add a demo video and organize more complete documentation.
*   [ ] Create ADK Agent Tools via LLM model and integrate into ADK project settings.
*   [ ] Integrate OpenAPI Tools via LLM model and integrate into ADK project settings.
*   [ ] Integrate MCP Server via LLM model and integrate into ADK project settings.

## Configuration

### `adk_agent_list.json`

This file is used to configure the list of available ADK agents. It should be placed in the root of the extension directory.

The file should contain a JSON object with an `agents` key, which is an array of agent objects. Each agent object should have a `name` and a `url`.

**Example `adk_agent_list.json`:**

```json
{
  "agents": [
    {
      "name": "your-agent-name",
      "url": "your-agent-url"
    }
  ]
}
```

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
    or
    ```bash
    gemini extensions install .
    ```

After linking, restart your Gemini CLI session to use the local version of the extension.

## Acknowledgement

- Thanks [APMIC](https://www.apmic.ai/) give me the support to finish the Open-Source Project.
- Thanks to [Thomas Chong](https://github.com/thomas-chong) for his contributions to this project.

## About the Author
Simon Liu
APMIC MLOps Engineer x Google Developer Expert (GDE) in AI

A technology enthusiast in the field of artificial intelligence solutions, focusing on assisting enterprises in implementing generative AI, MLOps, and Large Language Model (LLM) technologies to drive digital transformation and practical technological implementation.

Currently also a Google Developer Expert (GDE) in the GenAI field, actively participating in technology communities, promoting the application and development of AI technology through technical articles, speeches, and practical experience sharing. To date, he has published over a hundred technical articles on platforms like Medium, covering topics such as generative AI, RAG, and AI Agents, and has served as a speaker at numerous technical seminars, sharing practical applications of AI and generative AI.

Related Links:
APMIC Official Website: https://www.apmic.ai/
Personal Social Media Links: https://simonliuyuwei.my.canva.site/link-in-bio
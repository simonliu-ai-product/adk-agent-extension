# Google ADK Agent Extension Usage Guide

This document provides detailed information on how to install, configure, and use the Google ADK Agent Gemini CLI Extension.

## Overview

This extension provides a series of tools and commands that allow you to interact directly with ADK (Agent Development Kit) agents within the Gemini CLI, including managing, creating, deploying, evaluating, and visualizing your AI agents.

## 1. Installation

You can install this extension from its Git repository using the `gemini extensions install` command:

```bash
gemini extensions install https://github.com/simonliu-ai-product/adk-agent-extension
```

## 2. Configuration

After installation, you need to configure the list of available ADK agent servers.

### 2.1. The `adk_agent_list.json` File

The core configuration file for this extension is `adk_agent_list.json`, which should be placed in the root directory of the extension. This file contains your list of ADK servers.

**File Format Example:**

```json
{
  "agents": [
    {
      "name": "your-agent-name",
      "url": "your-agent-url"
    },
    {
      "name": "another-agent",
      "url": "another-agent-url"
    }
  ]
}
```

### 2.2. Managing Server Configuration

You can use the following commands to manage the server list in `adk_agent_list.json`:

*   **List Servers**
    ```bash
    /adk-ext:config_list_servers
    ```

*   **Add a Server**
    ```bash
    /adk-ext:config_add_server <server_name> <server_url>
    ```
    **Example:**
    ```bash
    /adk-ext:config_add_server my-adk-server https://my-adk-server.com
    ```

*   **Remove a Server**
    ```bash
    /adk-ext:config_remove_server <server_name>
    ```
    **Example:**
    ```bash
    /adk-ext:config_remove_server my-adk-server
    ```

## 3. Detailed Command Reference

Below is a detailed explanation of all available custom commands.

---

### 3.1. `/adk-ext:list_adks`

*   **Function:** Lists all ADK servers configured in `adk_agent_list.json`.
*   **Arguments:** None.
*   **Natural Language Example:**
    ```
    List all ADK servers
    ```
*   **Usage Example:**
    ```
    /adk-ext:list_adks
    ```

---

### 3.2. `/adk-ext:list_adk_agent`

*   **Function:** Lists all available agents on a specified ADK server.
*   **Arguments:**
    *   `adk_server_url` (optional): The URL of the ADK server. If not provided, you will be prompted to select from the configured list.
*   **Natural Language Example:**
    ```
    List all ADK agents
    List ADK agents on https://your-adk-server.com
    ```
*   **Usage Example:**
    ```
    /adk-ext:list_adk_agent
    ```
    or
    ```
    /adk-ext:list_adk_agent https://your-adk-server.com
    ```

---

### 3.3. `/adk-ext:agent_chat`

*   **Function:** Interacts with a specified agent in a chat-like manner. This is a multi-step command that automatically handles session creation and message sending.
*   **Arguments:**
    *   `agent_name` (optional): The name of the agent you want to chat with. If not provided, you will be prompted to choose one.
*   **Natural Language Example:**
    ```
    Chat with an agent
    Chat with my-agent
    ```
*   **Usage Example:**
    ```
    /adk-ext:agent_chat
    ```
    or
    ```
    /adk-ext:agent_chat my-agent
    ```

---

### 3.4. `/adk-ext:interactive_chat`

*   **Function:** Starts an interactive chat session, allowing you to have a continuous conversation with an agent until you type `/exit`.
*   **Arguments:**
    *   `--adk_server_url`: The URL of the ADK server.
    *   `--agent_name`: The name of the agent.
*   **Natural Language Example:**
    ```
    Start an interactive chat with my-agent on https://your-adk-server.com
    ```
*   **Usage Example:**
    ```
    /adk-ext:interactive_chat --adk_server_url https://your-adk-server.com --agent_name my-agent
    ```

---

### 3.5. `/adk-ext:create_agent`

*   **Function:** Creates a new ADK agent project structure in the specified directory.
*   **Arguments:**
    *   `agent_name`: The name of the new agent.
    *   `directory_path` (optional): The directory to create the project in. Defaults to the current directory.
*   **Natural Language Example:**
    ```
    Create a new agent named my-new-agent
    Create a new agent named my-new-agent in the ./my-projects directory
    ```
*   **Usage Example:**
    ```
    /adk-ext:create_agent my-new-agent
    ```
    or
    ```
    /adk-ext:create_agent my-new-agent ./my-projects
    ```

---

### 3.6. `/adk-ext:deploy_agent`

*   **Function:** Deploys your ADK agent to a specified platform.
*   **Arguments:**
    *   `agent_path`: The local path to the agent project.
    *   `--target`: The deployment target, either `cloud-run` or `gke`.
    *   `--project`: Your Google Cloud project ID.
    *   `--location`: Your Google Cloud region.
*   **Natural Language Example:**
    ```
    Deploy the agent at ./my-agent to cloud-run with project ID my-gcp-project and location us-central1
    ```
*   **Usage Example:**
    ```
    /adk-ext:deploy_agent ./my-agent --target cloud-run --project my-gcp-project --location us-central1
    ```

---

### 3.7. `/adk-ext:evaluate_agent`

*   **Function:** Evaluates your agent using the `adk eval` command.
*   **Arguments:**
    *   `agent_path`: The local path to the agent project.
    *   `eval_set_path`: The path to the evaluation dataset.
*   **Natural Language Example:**
    ```
    Evaluate the agent at ./my-agent using ./eval-data.json
    ```
*   **Usage Example:**
    ```
    /adk-ext:evaluate_agent ./my-agent ./eval-data.json
    ```

---

### 3.8. `/adk-ext:list_agent_tools`

*   **Function:** Lists all the tools available to a specified agent.
*   **Arguments:**
    *   `agent_path`: The local path to the agent project.
*   **Natural Language Example:**
    ```
    List all tools available to the agent at ./my-agent
    ```
*   **Usage Example:**
    ```
    /adk-ext:list_agent_tools ./my-agent
    ```

---

### 3.9. `/adk-ext:scan_safety`

*   **Function:** Scans your agent's code for potential security vulnerabilities.
*   **Arguments:**
    *   `agent_path`: The local path to the agent project.
*   **Natural Language Example:**
    ```
    Scan the agent at ./my-agent for safety vulnerabilities
    ```
*   **Usage Example:**
    ```
    /adk-ext:scan_safety ./my-agent
    ```

---

### 3.10. `/adk-ext:visualize`

*   **Function:** Generates a Mermaid diagram to visualize the agent's system structure.
*   **Arguments:**
    *   `agent_path`: The local path to the agent project.
*   **Natural Language Example:**
    ```
    Visualize the agent system at ./my-agent
    ```
*   **Usage Example:**
    ```
    /adk-ext:visualize ./my-agent
    ```

## 4. Core Tools (Advanced Usage)

In addition to the custom commands, this extension also provides a series of core tools that allow for more flexible interaction with ADK through prompts.

*   `list_adks`: Lists configured ADK servers.
*   `list_adk_agents`: Fetches the list of agents from a specified URL.
*   `create_session`: Creates a new session for a specified agent.
*   `send_message_to_agent`: Sends a single message to an agent and gets the result.
*   `stream_message_to_agent`: Sends a message to an agent and gets a streamed response.
*   `create_agent`: Creates a new ADK agent project.
*   `deploy_agent`: Deploys an ADK agent.
*   `evaluate_agent`: Evaluates an ADK agent.
*   `list_agent_tools`: Lists an agent's tools.
*   `manage_chat_session`: Manages an interactive chat session.
*   `add_adk_server`: Adds an ADK server to the configuration file.
*   `remove_adk_server`: Removes an ADK server from the configuration file.
*   `list_adk_servers`: Lists all configured ADK servers.
*   `visualize_agent_system`: Generates a Mermaid diagram of the agent system.
*   `scan_agent_safety`: Scans an agent for security vulnerabilities.

## 5. Development

If you wish to modify or extend this project, please refer to the steps below.

### Prerequisites

*   Node.js
*   TypeScript
*   Gemini CLI

### Setup Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/simonliu-ai-product/adk-agent-extension
    cd adk-agent-extension
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

After linking, restart your Gemini CLI to use your local version of the extension.

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const server = new McpServer({
  name: 'google-adk-agent-server',
  version: '1.0.0',
});

// Tool 1: list_adks
server.registerTool(
  'list_adks',
  {
    description:
      'Fetches the list of available ADK servers from adk_agent_list.json.',
    inputSchema: z.object({}).shape,
  },
  async () => {
    try {
      const agentListPath = path.resolve(process.cwd(), 'adk_agent_list.json');
      const fileContent = fs.readFileSync(agentListPath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (parsed.agents && Array.isArray(parsed.agents)) {
        const adkServers: { name: string; url: string }[] = parsed.agents;
        if (adkServers.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: No ADK servers found in adk_agent_list.json.',
              },
            ],
          };
        }
        return {
          content: [
            { type: 'text', text: JSON.stringify(adkServers, null, 2) },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Invalid format for adk_agent_list.json. It should have an "agents" array.',
            },
          ],
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Error reading or parsing adk_agent_list.json: ${message}`,
          },
        ],
      };
    }
  }
);

// Tool 2: list_agents
server.registerTool(
  'list_adk_agents',
  {
    description: 'Fetches a list of available agents from a specific ADK server.',
    inputSchema: z.object({
      adk_server_url: z.string().url().describe('The URL of the ADK server.'),
    }).shape,
  },
  async (input) => {
    try {
      const url = `${input.adk_server_url}/list-apps`;
      const apiResponse = await fetch(url);
      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`);
      }
      const agents = await apiResponse.json();
      return {
        content: [{ type: 'text', text: JSON.stringify(agents, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'text', text: `Failed to list agents: ${message}` }],
      };
    }
  }
);

// Tool 3: create_session
server.registerTool(
  'create_session',
  {
    description:
      'Creates a new session for a specified agent on a specific ADK server.',
    inputSchema: z.object({
      adk_server_url: z.string().url().describe('The URL of the ADK server.'),
      agent_name: z.string().describe('The name of the agent.'),
    }).shape,
  },
  async (input) => {
    try {
      const apiResponse = await fetch(
        `${input.adk_server_url}/apps/${input.agent_name}/users/gemini-cli/sessions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`);
      }
      const session = await apiResponse.json();
      return {
        content: [{ type: 'text', text: JSON.stringify(session) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          { type: 'text', text: `Failed to create session: ${message}` },
        ],
      };
    }
  }
);

// Tool 4: send_message_to_agent
server.registerTool(
  'send_message_to_agent',
  {
    description: 'Sends a message to an agent session and gets the result.',
    inputSchema: z.object({
      adk_server_url: z.string().url().describe('The URL of the ADK server.'),
      agent_name: z.string().describe('The name of the agent.'),
      session_id: z.string().describe('The session ID to use.'),
      message: z.string().describe('The user\'s message to the agent.'),
    }).shape,
  },
  async (input) => {
    try {
      const apiResponse = await fetch(`${input.adk_server_url}/run_sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: input.agent_name,
          userId: 'gemini-cli',
          sessionId: input.session_id,
          newMessage: {
            parts: [{ text: input.message }],
            role: 'user',
          },
          streaming: false,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`);
      }

      const responseText = await apiResponse.text();
      const lines = responseText.trim().split('\n');
      const dataLines = lines.filter((line) => line.startsWith('data: '));
      let finalResponse = 'No final text response found.';
      for (const line of dataLines) {
        const jsonStr = line.substring(5);
        try {
          const data = JSON.parse(jsonStr);
          if (data.content?.parts?.[0]?.text) {
            finalResponse = data.content.parts[0].text;
          }
        } catch (e) {
          // Ignore
        }
      }

      return {
        content: [{ type: 'text', text: finalResponse }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          { type: 'text', text: `Failed to send message: ${message}` },
        ],
      };
    }
  }
);

console.log('ADK Agent MCP Server starting...');
const transport = new StdioServerTransport();
await server.connect(transport);
console.log('Server connected.');
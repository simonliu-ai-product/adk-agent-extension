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

// Tool 2: list_adk_agents
const listAdkAgentsSchema = z.object({
  adk_server_url: z.string().url().describe('The URL of the ADK server.'),
});
server.registerTool(
  'list_adk_agents',
  {
    description: 'Fetches a list of available agents from a specific ADK server.',
    inputSchema: listAdkAgentsSchema.shape,
  },
  async (input: z.infer<typeof listAdkAgentsSchema>) => {
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
const createSessionSchema = z.object({
  adk_server_url: z.string().url().describe('The URL of the ADK server.'),
  agent_name: z.string().describe('The name of the agent.'),
});
server.registerTool(
  'create_session',
  {
    description:
      'Creates a new session for a specified agent on a specific ADK server.',
    inputSchema: createSessionSchema.shape,
  },
  async (input: z.infer<typeof createSessionSchema>) => {
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
const sendMessageSchema = z.object({
  adk_server_url: z.string().url().describe('The URL of the ADK server.'),
  agent_name: z.string().describe('The name of the agent.'),
  session_id: z.string().describe('The session ID to use.'),
  message: z.string().describe('The user\'s message to the agent.'),
});
server.registerTool(
  'send_message_to_agent',
  {
    description: 'Sends a message to an agent session and gets the result.',
    inputSchema: sendMessageSchema.shape,
  },
  async (input: z.infer<typeof sendMessageSchema>) => {
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

const streamMessageSchema = z.object({
  adk_server_url: z.string().url(),
  agent_name: z.string(),
  session_id: z.string(),
  message: z.string(),
});

// Tool 5: stream_message_to_agent
server.registerTool(
  'stream_message_to_agent',
  {
    description: 'Sends a message to an agent and streams the response.',
    inputSchema: streamMessageSchema.shape,
  },
  async (input: z.infer<typeof streamMessageSchema>) => {
    try {
      const response = await fetch(`${input.adk_server_url}/run_sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: input.agent_name,
          userId: 'gemini-cli',
          sessionId: input.session_id,
          newMessage: { parts: [{ text: input.message }], role: 'user' },
          streaming: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.content && data.content.parts && data.content.parts[0].text) {
                fullResponse += data.content.parts[0].text;
              }
            } catch (e) {
              // Ignore lines that are not valid JSON
            }
          }
        }
      }

      return { content: [{ type: 'text', text: fullResponse }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }] };
    }
  },
);

const createAgentSchema = z.object({
  agent_name: z.string(),
  directory_path: z.string(),
});

// Tool 6: create_agent
server.registerTool(
  'create_agent',
  {
    description: 'Creates a new ADK agent project.',
    inputSchema: createAgentSchema.shape,
  },
  async (input: z.infer<typeof createAgentSchema>) => {
    try {
      const agentDir = path.join(input.directory_path, input.agent_name);
      fs.mkdirSync(agentDir, { recursive: true });

      const agentPyContent = `from google.adk.agents import Agent\nfrom google.adk.tools import google_search\n\nroot_agent = Agent(\n    name="${input.agent_name}",\n    model="gemini-1.5-flash",\n    instruction="You are a helpful assistant.",\n    tools=[google_search]
)
`;
      fs.writeFileSync(path.join(agentDir, 'agent.py'), agentPyContent);

      const initPyContent = `from . import agent\n`;
      fs.writeFileSync(path.join(agentDir, '__init__.py'), initPyContent);

      return { content: [{ type: 'text', text: `Agent '${input.agent_name}' created at ${agentDir}` }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }] };
    }
  },
);

const deployAgentSchema = z.object({
  agent_path: z.string(),
  target: z.enum(['cloud-run', 'gke']),
  project_id: z.string(),
  location: z.string(),
});

// Tool 7: deploy_agent
server.registerTool(
  'deploy_agent',
  {
    description: 'Deploys an ADK agent.',
    inputSchema: deployAgentSchema.shape,
  },
  async (input: z.infer<typeof deployAgentSchema>) => {
    let command;
    if (input.target === 'cloud-run') {
      command = `gcloud run deploy ${path.basename(input.agent_path)} --source ${input.agent_path} --project ${input.project_id} --region ${input.location} --allow-unauthenticated`;
    } else {
      // Logic for GKE deployment
      command = 'echo "GKE deployment not yet implemented"';
    }

    // This is a placeholder for where the run_shell_command would be called.
    // The actual implementation will require the run_shell_command tool to be available.
    return { content: [{ type: 'text', text: `Would run command: ${command}` }] };
  },
);

const evaluateAgentSchema = z.object({
  agent_path: z.string(),
  eval_set_path: z.string(),
});

// Tool 8: evaluate_agent
server.registerTool(
  'evaluate_agent',
  {
    description: 'Runs `adk eval` on a specified agent.',
    inputSchema: evaluateAgentSchema.shape,
  },
  async (input: z.infer<typeof evaluateAgentSchema>) => {
    const command = `adk eval ${input.agent_path} ${input.eval_set_path}`;
    // This is a placeholder for where the run_shell_command would be called.
    // The actual implementation will require the run_shell_command tool to be available.
    return { content: [{ type: 'text', text: `Would run command: ${command}` }] };
  },
);

const listAgentToolsSchema = z.object({
  agent_path: z.string(), // Assuming we need to access the source code
});

// Tool 9: list_agent_tools
server.registerTool(
  'list_agent_tools',
  {
    description: "Lists the tools available to a specific agent.",
    inputSchema: listAgentToolsSchema.shape,
  },
  async (input: z.infer<typeof listAgentToolsSchema>) => {
    try {
      const agentPyPath = path.join(input.agent_path, 'agent.py');
      const agentPyContent = fs.readFileSync(agentPyPath, 'utf-8');

      const toolsRegex = /tools=\[([\s\S]*?)\]/;
      const match = agentPyContent.match(toolsRegex);

      if (match && match[1]) {
        const toolNames = match[1].split(',').map(t => t.trim()).filter(t => t);
        return { content: [{ type: 'text', text: JSON.stringify(toolNames, null, 2) }] };
      } else {
        return { content: [{ type: 'text', text: 'No tools found for this agent.' }] };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }] };
    }
  },
);

const chatSessions = new Map<string, string>();

const manageChatSessionSchema = z.object({
  action: z.enum(['start', 'message', 'end']),
  conversation_id: z.string().optional(),
  adk_server_url: z.string().url().optional(),
  agent_name: z.string().optional(),
  message: z.string().optional(),
});

// Tool 10: manage_chat_session
server.registerTool(
  'manage_chat_session',
  {
    description: 'Manages an interactive chat session.',
    inputSchema: manageChatSessionSchema.shape,
  },
  async (input: z.infer<typeof manageChatSessionSchema>) => {
    switch (input.action) {
      case 'start': {
        if (!input.adk_server_url || !input.agent_name) {
          return { content: [{ type: 'text', text: 'Error: adk_server_url and agent_name are required to start a session.' }] };
        }
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
          const conversation_id = `conv_${Date.now()}`;
          chatSessions.set(conversation_id, session.sessionId);
          return { content: [{ type: 'text', text: `Session started with ID: ${conversation_id}` }] };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return { content: [{ type: 'text', text: `Failed to create session: ${message}` }] };
        }
      }
      case 'message': {
        if (!input.conversation_id || !input.message) {
          return { content: [{ type: 'text', text: 'Error: conversation_id and message are required to send a message.' }] };
        }
        const sessionId = chatSessions.get(input.conversation_id);
        if (!sessionId) {
          return { content: [{ type: 'text', text: 'Error: Invalid conversation_id.' }] };
        }
        // This part is complex, as we need the adk_server_url and agent_name again.
        // For now, we will assume they are passed in again.
        if (!input.adk_server_url || !input.agent_name) {
          return { content: [{ type: 'text', text: 'Error: adk_server_url and agent_name are required to send a message.' }] };
        }
        try {
          const apiResponse = await fetch(`${input.adk_server_url}/run_sse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appName: input.agent_name,
              userId: 'gemini-cli',
              sessionId: sessionId,
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
      case 'end': {
        if (!input.conversation_id) {
          return { content: [{ type: 'text', text: 'Error: conversation_id is required to end a session.' }] };
        }
        chatSessions.delete(input.conversation_id);
        return { content: [{ type: 'text', text: 'Session ended.' }] };
      }
    }
  },
);

const addAdkServerSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

// Tool 11: add_adk_server
server.registerTool(
  'add_adk_server',
  {
    description: 'Adds a new ADK server to the configuration.',
    inputSchema: addAdkServerSchema.shape,
  },
  async (input: z.infer<typeof addAdkServerSchema>) => {
    try {
      const agentListPath = path.resolve(process.cwd(), 'adk_agent_list.json');
      let adkConfig: { agents: { name: string; url: string }[] } = { agents: [] };
      if (fs.existsSync(agentListPath)) {
        const fileContent = fs.readFileSync(agentListPath, 'utf-8');
        adkConfig = JSON.parse(fileContent);
      }

      adkConfig.agents.push({ name: input.name, url: input.url });
      fs.writeFileSync(agentListPath, JSON.stringify(adkConfig, null, 2));

      return { content: [{ type: 'text', text: `Server '${input.name}' added successfully.` }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }] };
    }
  },
);

const removeAdkServerSchema = z.object({
  name: z.string(),
});

// Tool 12: remove_adk_server
server.registerTool(
  'remove_adk_server',
  {
    description: 'Removes an ADK server from the configuration.',
    inputSchema: removeAdkServerSchema.shape,
  },
  async (input: z.infer<typeof removeAdkServerSchema>) => {
    try {
      const agentListPath = path.resolve(process.cwd(), 'adk_agent_list.json');
      if (!fs.existsSync(agentListPath)) {
        return { content: [{ type: 'text', text: 'Configuration file not found.' }] };
      }

      const fileContent = fs.readFileSync(agentListPath, 'utf-8');
      const adkConfig = JSON.parse(fileContent);

      adkConfig.agents = adkConfig.agents.filter((agent: {name: string}) => agent.name !== input.name);
      fs.writeFileSync(agentListPath, JSON.stringify(adkConfig, null, 2));

      return { content: [{ type: 'text', text: `Server '${input.name}' removed successfully.` }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }] };
    }
  },
);

const listAdkServersSchema = z.object({});

// Tool 13: list_adk_servers
server.registerTool(
  'list_adk_servers',
  {
    description:
      'Fetches the list of available ADK servers from adk_agent_list.json.',
    inputSchema: listAdkServersSchema.shape,
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

const visualizeAgentSystemSchema = z.object({
  agent_path: z.string(),
});

// Tool 14: visualize_agent_system
server.registerTool(
  'visualize_agent_system',
  {
    description: 'Generates a Mermaid diagram of a multi-agent system.',
    inputSchema: visualizeAgentSystemSchema.shape,
  },
  async (input: z.infer<typeof visualizeAgentSystemSchema>) => {
    try {
      const generateMermaid = (agentPath: string, agentName: string) => {
        const agentPyPath = path.join(agentPath, 'agent.py');
        if (!fs.existsSync(agentPyPath)) return '';

        const agentPyContent = fs.readFileSync(agentPyPath, 'utf-8');
        const subAgentsRegex = /sub_agents=\[([\s\S]*?)\]/;
        const match = agentPyContent.match(subAgentsRegex);

        let mermaidString = `graph TD;\n  ${agentName}(${agentName});\n`;

        if (match && match[1]) {
          const subAgentNames = match[1].split(',').map(t => t.trim()).filter(t => t);
          for (const subAgentName of subAgentNames) {
            mermaidString += `  ${agentName} --> ${subAgentName};\n`;
            // This is a simplified example. A real implementation would need to
            // resolve the path to the sub-agent's code and recursively call
            // this function.
          }
        }
        return mermaidString;
      };

      const rootAgentName = path.basename(input.agent_path);
      const mermaid = generateMermaid(input.agent_path, rootAgentName);

      return { content: [{ type: 'text', text: mermaid }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }] };
    }
  },
);

const scanAgentSafetySchema = z.object({
  agent_path: z.string(),
});

// Tool 15: scan_agent_safety
server.registerTool(
  'scan_agent_safety',
  {
    description: 'Scans an agent for potential security vulnerabilities.',
    inputSchema: scanAgentSafetySchema.shape,
  },
  async (input: z.infer<typeof scanAgentSafetySchema>) => {
    try {
      const findings = [];
      const agentPyPath = path.join(input.agent_path, 'agent.py');
      const agentPyContent = fs.readFileSync(agentPyPath, 'utf-8');

      // 1. Check for dangerous functions
      const dangerousFunctions = ['eval(', 'exec(', 'os.system('];
      for (const func of dangerousFunctions) {
        if (agentPyContent.includes(func)) {
          findings.push({ 
            file: agentPyPath, 
            line: agentPyContent.split(func)[0].split('\n').length, 
            issue: `Use of dangerous function: ${func}` 
          });
        }
      }

      // 2. Check for hardcoded secrets (simple example)
      const secretRegex = /(api_key|password|secret)['"\s=:]+['"\w-]{16,}/i;
      if (secretRegex.test(agentPyContent)) {
        findings.push({
          file: agentPyPath,
          line: -1, // More complex to get line number for regex
          issue: 'Potential hardcoded secret found.' 
        });
      }

      // ... other checks

      return { content: [{ type: 'text', text: JSON.stringify(findings, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }] };
    }
  },
);

console.log('ADK Agent MCP Server starting...');
const transport = new StdioServerTransport();
await server.connect(transport);
console.log('Server connected.');

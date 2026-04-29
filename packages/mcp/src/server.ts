#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validate } from "@signalql/sdk";
import postgres from "postgres";
import { z } from "zod";

const eventCatalog: Record<string, { description: string; sampleProperties: string[] }> = {
  signup: { description: "User completed signup", sampleProperties: ["source"] },
  onboarding_complete: { description: "Onboarding flow finished", sampleProperties: [] },
  view_item: { description: "Item viewed", sampleProperties: ["sku"] },
  purchase: { description: "Purchase completed", sampleProperties: ["amount", "plan"] },
  activated: { description: "Activation milestone reached", sampleProperties: [] },
};

const portableSchema = {
  version: "v0.1",
  tables: {
    events: {
      columns: {
        event_name: "text",
        user_id: "text | null",
        session_id: "text | null",
        timestamp: "timestamptz",
        properties: "jsonb | null",
      },
    },
    users: { columns: { user_id: "text", traits: "jsonb | null" } },
    sessions: {
      columns: {
        session_id: "text",
        user_id: "text | null",
        started_at: "timestamptz",
        ended_at: "timestamptz | null",
      },
    },
  },
};

const runSchema = z.object({
  query: z.string().min(1),
  execute: z.boolean().optional(),
});
const runInputSchema = runSchema.shape;

const eventNameSchema = z.object({
  event_name: z.string().min(1),
});
const eventNameInputSchema = eventNameSchema.shape;

const start = async () => {
  const server = new McpServer({ name: "signalql", version: "0.1.0" });
  const registerTool = server.registerTool.bind(server) as (
    name: string,
    config: {
      description: string;
      inputSchema: unknown;
    },
    cb: (args: Record<string, unknown>) => Promise<{ content: Array<{ type: "text"; text: string }> }>
  ) => void;

  registerTool(
    "run_signalql",
    {
      description: "Parse, compile, and optionally execute SignalQL with safe parameters",
      inputSchema: runInputSchema,
    },
    async ({ query, execute }) => {
      const v = validate(String(query), { dialect: "postgres" });
      if (!v.ok) {
        return { content: [{ type: "text" as const, text: v.error.message }] };
      }
      const payload = {
        sql: v.output.sql.trim(),
        params: v.output.params,
        ast: v.output.ast,
      };
      if (Boolean(execute)) {
        const url = process.env.DATABASE_URL;
        if (!url) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Compiled only (set DATABASE_URL to execute):\n${JSON.stringify(payload, null, 2)}`,
              },
            ],
          };
        }
        const sql = postgres(url, { max: 1 });
        try {
          const rows = await sql.unsafe(v.output.sql, v.output.params as never[]);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ ...payload, rows }, null, 2),
              },
            ],
          };
        } finally {
          await sql.end({ timeout: 2 });
        }
      }
      return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
    }
  );

  registerTool(
    "get_schema",
    {
      description: "Return portable SignalQL analytics model metadata",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text" as const, text: JSON.stringify(portableSchema, null, 2) }],
    })
  );

  registerTool(
    "list_events",
    {
      description: "List known event names for schema-aware prompting",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(Object.keys(eventCatalog).sort(), null, 2),
        },
      ],
    })
  );

  registerTool(
    "describe_event",
    {
      description: "Describe an event’s intent and sample properties",
      inputSchema: eventNameInputSchema,
    },
    async ({ event_name }) => {
      const eventName = String(event_name);
      const meta = eventCatalog[eventName];
      if (!meta) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Unknown event "${eventName}". Use list_events.`,
            },
          ],
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ event_name: eventName, ...meta }, null, 2) }],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

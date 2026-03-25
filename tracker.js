#!/usr/bin/env node

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = rest[i + 1];

    if (!value || value.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = value;
    i += 1;
  }

  return { command, options };
}

function requireOption(options, key, command) {
  if (!options[key]) {
    throw new Error(`Missing required option --${key} for command "${command}"`);
  }

  return options[key];
}

function nowIso() {
  return new Date().toISOString();
}

function validateCategory(category) {
  if (!category) {
    return "";
  }

  const normalized = String(category).trim().toLowerCase();

  if (normalized !== "strategic" && normalized !== "tactical") {
    throw new Error('Category must be "Strategic" or "Tactical"');
  }

  return normalized[0].toUpperCase() + normalized.slice(1);
}

async function sendPayload(webhookUrl, payload) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload, null, 2)
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Webhook error ${response.status}: ${text}`);
  }

  console.log(text);
}

function buildPayload(command, options) {
  switch (command) {
    case "start":
      return {
        action: "start",
        entry: {
          activity: requireOption(options, "activity", command),
          startTime: options.start || nowIso(),
          category: validateCategory(requireOption(options, "category", command)),
          reason: requireOption(options, "reason", command),
          notes: options.notes || ""
        }
      };

    case "stop":
      return {
        action: "stop",
        entry: {
          endTime: options.end || nowIso(),
          notes: options.notes || ""
        }
      };

    case "log-complete":
      return {
        action: "log_complete",
        entry: {
          activity: requireOption(options, "activity", command),
          startTime: requireOption(options, "start", command),
          endTime: requireOption(options, "end", command),
          category: validateCategory(requireOption(options, "category", command)),
          reason: requireOption(options, "reason", command),
          notes: options.notes || ""
        }
      };

    case "delete-latest":
      return {
        action: "delete_latest",
        entry: {}
      };

    default:
      throw new Error(
        'Unknown command. Use "start", "stop", "log-complete", or "delete-latest".'
      );
  }
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const webhookUrl = options.webhook || process.env.WEBHOOK_URL;

  if (!command) {
    throw new Error(
      'Missing command. Use "start", "stop", "log-complete", or "delete-latest".'
    );
  }

  if (!webhookUrl) {
    throw new Error("Missing webhook URL. Pass --webhook or set WEBHOOK_URL.");
  }

  const payload = buildPayload(command, options);
  console.log("Sending payload:");
  console.log(JSON.stringify(payload, null, 2));
  await sendPayload(webhookUrl, payload);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

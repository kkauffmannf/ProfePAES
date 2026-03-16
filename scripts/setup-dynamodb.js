const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    });
}

const client = new DynamoDBClient({
  region: process.env.BEDROCK_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID,
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY,
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE || "profe-paes-students";

async function createTable() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`✅ Table "${TABLE_NAME}" already exists.`);
    return;
  } catch {
    // Table doesn't exist, create it
  }

  try {
    await client.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        AttributeDefinitions: [{ AttributeName: "student_id", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "student_id", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      })
    );
    console.log(`✅ Table "${TABLE_NAME}" created successfully.`);
    console.log("   Billing mode: PAY_PER_REQUEST (no fixed cost, only pay for what you use)");
  } catch (err) {
    console.error("❌ Error creating table:", err.message);
    process.exit(1);
  }
}

createTable();

import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ORDER_COUNTER_FILE = path.join(process.cwd(), "data", "order-counter.json");

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Get current date in MMDD format
function getDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}${day}`;
}

// Read order counter from file
async function readOrderCounter(): Promise<{
  date: string;
  count: number;
}> {
  try {
    if (existsSync(ORDER_COUNTER_FILE)) {
      const data = await readFile(ORDER_COUNTER_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading order counter:", error);
  }
  // Default: return current date with count 0
  return { date: getDateString(), count: 0 };
}

// Write order counter to file
async function writeOrderCounter(counter: { date: string; count: number }) {
  try {
    await ensureDataDirectory();
    await writeFile(ORDER_COUNTER_FILE, JSON.stringify(counter, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing order counter:", error);
    throw error;
  }
}

// Generate order number
async function generateOrderNumber(): Promise<string> {
  const currentDate = getDateString();
  const counter = await readOrderCounter();

  // If it's a new day, reset the counter
  if (counter.date !== currentDate) {
    counter.date = currentDate;
    counter.count = 0;
  }

  // Increment the counter
  counter.count += 1;

  // Save the updated counter
  await writeOrderCounter(counter);

  // Format: MMDD + 4-digit order number
  const orderNumber = `${currentDate}${String(counter.count).padStart(4, "0")}`;

  return orderNumber;
}

export async function GET(req: NextRequest) {
  try {
    const orderNumber = await generateOrderNumber();
    return NextResponse.json({ orderNumber }, { status: 200 });
  } catch (error) {
    console.error("Error generating order number:", error);
    return NextResponse.json(
      { error: "Failed to generate order number" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ORDER_COUNTER_FILE = path.join(process.cwd(), "data", "order-counter.json");
const LOCK_FILE = path.join(process.cwd(), "data", ".order-counter.lock");

// Simple file-based lock mechanism
let lockPromise: Promise<void> | null = null;

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    try {
      await mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create data directory:", error);
      throw error;
    }
  }
}

// Get current date in MMDD format
function getDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}${day}`;
}

// Acquire lock
async function acquireLock(): Promise<void> {
  while (lockPromise) {
    await lockPromise;
  }
  
  lockPromise = (async () => {
    try {
      await ensureDataDirectory();
      // Try to create lock file
      let attempts = 0;
      while (attempts < 10) {
        try {
          await writeFile(LOCK_FILE, Date.now().toString(), { flag: "wx" });
          return;
        } catch (error: any) {
          if (error.code === "EEXIST") {
            // Lock exists, wait a bit and retry
            await new Promise((resolve) => setTimeout(resolve, 50));
            attempts++;
          } else {
            throw error;
          }
        }
      }
      throw new Error("Failed to acquire lock after 10 attempts");
    } catch (error) {
      console.error("Error acquiring lock:", error);
      throw error;
    }
  })();
  
  await lockPromise;
}

// Release lock
async function releaseLock(): Promise<void> {
  try {
    if (existsSync(LOCK_FILE)) {
      await writeFile(LOCK_FILE, "", { flag: "w" }).catch(() => {});
      // Try to remove lock file (may fail in some environments, that's ok)
      try {
        const { unlink } = await import("fs/promises");
        await unlink(LOCK_FILE).catch(() => {});
      } catch {}
    }
  } catch (error) {
    console.error("Error releasing lock:", error);
  } finally {
    lockPromise = null;
  }
}

// Read order counter from file
async function readOrderCounter(): Promise<{
  date: string;
  count: number;
}> {
  try {
    if (existsSync(ORDER_COUNTER_FILE)) {
      const data = await readFile(ORDER_COUNTER_FILE, "utf-8");
      const parsed = JSON.parse(data);
      // Validate the data structure
      if (parsed && typeof parsed.date === "string" && typeof parsed.count === "number") {
        return parsed;
      }
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
    const data = JSON.stringify(counter, null, 2);
    await writeFile(ORDER_COUNTER_FILE, data, "utf-8");
    
    // Verify the write succeeded by reading it back
    const verify = await readFile(ORDER_COUNTER_FILE, "utf-8");
    const verified = JSON.parse(verify);
    if (verified.date !== counter.date || verified.count !== counter.count) {
      throw new Error("Write verification failed - data mismatch");
    }
  } catch (error) {
    console.error("Error writing order counter:", error);
    console.error("Counter data:", counter);
    throw error;
  }
}

// Generate order number with locking to prevent race conditions
async function generateOrderNumber(): Promise<string> {
  await acquireLock();
  
  try {
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

    console.log(`Generated order number: ${orderNumber} (date: ${counter.date}, count: ${counter.count})`);

    return orderNumber;
  } finally {
    await releaseLock();
  }
}

export async function GET(req: NextRequest) {
  try {
    const orderNumber = await generateOrderNumber();
    return NextResponse.json({ orderNumber }, { status: 200 });
  } catch (error) {
    console.error("Error generating order number:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    
    // Fallback: Generate order number with timestamp to ensure uniqueness
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    const fallbackOrderNumber = `${month}${day}${timestamp}`;
    
    console.warn(`Using fallback order number: ${fallbackOrderNumber}`);
    
    return NextResponse.json(
      { 
        orderNumber: fallbackOrderNumber,
        warning: "Used fallback order number due to file system error"
      },
      { status: 200 }
    );
  }
}


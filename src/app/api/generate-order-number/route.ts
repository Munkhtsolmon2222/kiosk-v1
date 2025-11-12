import { NextRequest, NextResponse } from "next/server";

// Get current date in MMDD format
function getDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}${day}`;
}

// Generate a random 4-digit number
function generateRandom4Digits(): string {
  // Generate random number between 1000 and 9999
  const random = Math.floor(Math.random() * 9000) + 1000;
  return String(random);
}

// Generate order number: MMDD + random 4 digits
function generateOrderNumber(): string {
  const currentDate = getDateString();
  const randomDigits = generateRandom4Digits();
  const orderNumber = `${currentDate}${randomDigits}`;
  
  console.log(`Generated order number: ${orderNumber} (date: ${currentDate}, random: ${randomDigits})`);
  
  return orderNumber;
}

export async function GET(req: NextRequest) {
  try {
    const orderNumber = generateOrderNumber();
    return NextResponse.json({ orderNumber }, { status: 200 });
  } catch (error) {
    console.error("Error generating order number:", error);
    
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
        warning: "Used fallback order number due to error"
      },
      { status: 200 }
    );
  }
}

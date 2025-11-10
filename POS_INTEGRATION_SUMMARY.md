# POS Payment Integration Summary

## Overview

Successfully integrated GLMTPOS (IPPOS) card payment method into the kiosk application. This adds a third payment option alongside QPay and StorePay.

## Files Created/Modified

### 1. New API Route
- **`src/app/api/pos/request/route.ts`**
  - Handles all POS operations (Connection Check, Purchase, Settlement)
  - Converts JSON request to Base64
  - Communicates with POS service at `http://localhost:8500`
  - Decodes Base64 response
  - Returns structured response with response codes

### 2. New Email API Route
- **`src/app/api/send-email/route.ts`**
  - Server-side email sending endpoint
  - Used by POS payment flow for order notifications

### 3. Modified Components

#### `src/app/_components/paymentMethods.tsx`
- Added POS payment method to the list
- Label: "Карт" (Card)
- Description: "Картаар шууд төлбөр төлөх"
- Instructions for card insertion and PIN entry

#### `src/app/_components/cartDialog.tsx`
- Added POS payment state variables:
  - `posRequestId`: Tracks payment request ID
  - `posProcessing`: Indicates if payment is in progress
- Added POS payment functions:
  - `checkPOSConnection()`: Operation code 26 - Checks POS terminal connection
  - `processPOSPayment()`: Operation code 1 - Processes card payment
  - `sendPOSOrderEmail()`: Sends order confirmation email
- Updated payment flow to include POS option
- Added POS-specific UI in step 3 with loading spinner and status messages

## Payment Flow

### POS Payment Process

1. **User selects "Карт" payment method** (Step 2)
2. **User clicks "Үргэлжлүүлэх"** (Continue)
3. **Connection Check** (Operation 26)
   - Checks if POS terminal is connected
   - Shows: "POS терминалтай холбогдож байна..."
4. **If connected, proceed to Purchase** (Operation 1)
   - Shows: "Картаа оруулна уу..."
   - Sends purchase request with amount
   - Waits for POS response
5. **Handle Response**
   - **Success (Code 0)**: 
     - Send email notification
     - Clear cart
     - Show success message
     - Redirect to home after 3 seconds
   - **Error**: Display error message based on response code

## Supported Operations

### Operation Code 26: Check Connection
- Used to verify POS terminal is connected
- Called before processing payment
- Returns success (0) or error codes

### Operation Code 1: Purchase
- Main payment operation
- Requires amount in smallest currency unit
- Amount conversion: `amount * 100` (e.g., 1000 MNT → "100000")

### Operation Code 59: Settlement (Not yet implemented)
- Can be added for end-of-day settlement
- Currently not used in payment flow

## Amount Conversion

According to GLMTPOS specification:
- **Spec says**: "1000" in amount field = 10.00 төгрөг displayed in POS
- **Conversion**: `amount field value / 100 = display amount`
- **Implementation**: To charge 1000 MNT, send `"100000"` (1000 * 100)

## Response Code Handling

| Code | Meaning | User Message |
|------|---------|--------------|
| 0 | SUCCESS | "Төлбөр амжилттай!" |
| 1 | Command mode 201 | "Command mode 201" |
| 10 | Dclink error | "Dclink error" |
| 11 | Dclink error | "Dclink error" |
| A0 | Invalid request | "Буруу хүсэлт" |
| A1 | Invalid token | "Буруу токен" |
| 91 | Issuer system error | "Банкны системийн алдаа" |
| 99 | Other error | "Бусад алдаа" |

## Environment Variables

Add these to your `.env.local`:

```env
# POS Configuration
POS_SERVICE_URL=http://localhost:8500
POS_PORT_NO=1
POS_TERMINAL_ID=13133707

# Or use NEXT_PUBLIC_ prefix for client-side access
NEXT_PUBLIC_POS_PORT_NO=1
NEXT_PUBLIC_POS_TERMINAL_ID=13133707
```

**Note**: Currently using `NEXT_PUBLIC_*` for client-side access, but these could be moved to server-side only for better security.

## UI Features

### Payment Method Selection (Step 2)
- POS appears as third option
- Radio button selection
- Instructions displayed when selected

### Payment Processing (Step 3)
- Loading spinner during processing
- Status messages:
  - "POS терминалтай холбогдож байна..."
  - "Картаа оруулна уу..."
  - "Төлбөр амжилттай!" (on success)
  - Error messages (on failure)
- "Буцах" (Back) button disabled during processing

## Email Notifications

POS payments send order confirmation emails similar to QPay/StorePay:
- Order amount
- Delivery type (Хүргэлтээр / Бэлэнээр)
- Cart items with codes, prices, quantities
- Delivery address (if applicable)
- Customer contact information

## Integration Points

### Aligned with Existing Architecture

✅ **Follows same pattern as QPay/StorePay:**
- Payment method selection in `paymentMethods.tsx`
- Payment processing in `cartDialog.tsx`
- API routes in `src/app/api/pos/`
- Email notifications on success
- Cart clearing on success
- Redirect to home after success

✅ **Uses existing infrastructure:**
- Same cart dialog flow (3 steps)
- Same validation logic
- Same email system
- Same error handling patterns

## Testing Checklist

- [ ] POS service running on `localhost:8500`
- [ ] POS terminal connected to correct port
- [ ] Terminal ID configured correctly
- [ ] Test connection check (Operation 26)
- [ ] Test purchase with valid card (Operation 1)
- [ ] Test error handling
- [ ] Test email notification
- [ ] Test cart clearing
- [ ] Test VAT exclusion option
- [ ] Test with delivery option

## Future Enhancements

1. **Settlement Operation (59)**
   - Add end-of-day settlement functionality
   - Could be triggered from settings/admin panel

2. **Better Error Handling**
   - More detailed error messages
   - Retry mechanism for connection failures
   - Timeout handling

3. **Security Improvements**
   - Move POS config to server-side only
   - Add request validation
   - Add rate limiting

4. **UI Improvements**
   - Better loading states
   - Progress indicators
   - Card insertion animations

5. **Logging**
   - Log all POS transactions
   - Store transaction history
   - Error tracking

## Notes

- POS service must be running on the same machine or accessible network
- Default port is COM1 (portNo: "1")
- Default terminal ID is "13133707" (can be configured)
- Amount is converted to smallest currency unit (multiply by 100)
- All requests are Base64 encoded before sending to POS service
- Responses are Base64 decoded on the server side

---

*Integration completed following existing system architecture and design patterns.*


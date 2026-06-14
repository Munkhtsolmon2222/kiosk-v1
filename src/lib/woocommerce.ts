import type { CartItem } from "@/lib/cartReducer";

const DEFAULT_WC_STORE_URL = "https://erchuudiindelguur.mn";

export type KioskOrderFormData = {
  address?: string;
  phone?: string;
  email?: string;
  phone2?: string;
};

export type CreateKioskOrderParams = {
  paymentRef: string;
  paymentMethod: "qpay" | "storepay" | "pos";
  cartItems: CartItem[];
  amount: number;
  formData?: KioskOrderFormData;
  isDelivered?: boolean;
  kioskOrderNumber: string;
  customerEmail?: string;
};

export type CreateKioskOrderResult = {
  wooOrderId: number;
  wooOrderNumber: string;
  created: boolean;
};

function getWcCredentials() {
  const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
  const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("WooCommerce API keys are missing");
  }

  return { consumerKey, consumerSecret };
}

function getWcAuthHeader() {
  const { consumerKey, consumerSecret } = getWcCredentials();
  return Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
}

function getWcBaseUrl() {
  return (process.env.WC_STORE_URL || DEFAULT_WC_STORE_URL).replace(/\/$/, "");
}

export function cartItemsToLineItems(cartItems: CartItem[]) {
  return (cartItems ?? []).map((item) => {
    const productId = item.product_id ?? item.id;
    const lineItem: {
      product_id: number;
      quantity: number;
      variation_id?: number;
    } = {
      product_id: productId,
      quantity: Math.max(1, Number(item.quantity) || 1),
    };

    if (item.variation_id) {
      lineItem.variation_id = item.variation_id;
    }

    return lineItem;
  });
}

const paymentMethodTitles: Record<CreateKioskOrderParams["paymentMethod"], string> = {
  qpay: "QPay",
  storepay: "StorePay",
  pos: "POS Terminal",
};

async function findOrderByPaymentRef(paymentRef: string) {
  const auth = getWcAuthHeader();
  const url = `${getWcBaseUrl()}/wp-json/wc/v3/orders?meta_key=kiosk_payment_ref&meta_value=${encodeURIComponent(paymentRef)}&per_page=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    console.error("WooCommerce order lookup failed:", await response.text());
    return null;
  }

  const orders = await response.json();
  return Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
}

export async function createKioskOrder(
  params: CreateKioskOrderParams
): Promise<CreateKioskOrderResult> {
  const existing = await findOrderByPaymentRef(params.paymentRef);
  if (existing) {
    return {
      wooOrderId: existing.id,
      wooOrderNumber: String(existing.number ?? existing.id),
      created: false,
    };
  }

  const lineItems = cartItemsToLineItems(params.cartItems);
  if (lineItems.length === 0) {
    throw new Error("Cannot create WooCommerce order with no line items");
  }

  const email =
    params.customerEmail ||
    params.formData?.email ||
    "kiosk@erchuudiindelguur.mn";

  const customerNoteParts = [
    `Kiosk order: ${params.kioskOrderNumber}`,
    `Payment: ${paymentMethodTitles[params.paymentMethod]}`,
    params.isDelivered ? "Delivery: yes" : "Pickup: in store",
  ];

  if (params.formData?.phone2) {
    customerNoteParts.push(`Phone 2: ${params.formData.phone2}`);
  }

  const orderPayload = {
    payment_method: params.paymentMethod,
    payment_method_title: paymentMethodTitles[params.paymentMethod],
    set_paid: true,
    status: "processing",
    customer_note: customerNoteParts.join("\n"),
    billing: {
      first_name: "Kiosk",
      last_name: "Customer",
      email,
      phone: params.formData?.phone ?? "",
      address_1: params.formData?.address ?? "",
      country: "MN",
    },
    ...(params.isDelivered
      ? {
          shipping: {
            first_name: "Kiosk",
            last_name: "Customer",
            address_1: params.formData?.address ?? "",
            country: "MN",
          },
        }
      : {}),
    line_items: lineItems,
    meta_data: [
      { key: "kiosk_payment_ref", value: params.paymentRef },
      { key: "kiosk_order_number", value: params.kioskOrderNumber },
      { key: "kiosk_payment_method", value: params.paymentMethod },
      { key: "kiosk_total_amount", value: String(params.amount) },
    ],
  };

  const auth = getWcAuthHeader();
  const response = await fetch(`${getWcBaseUrl()}/wp-json/wc/v3/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("WooCommerce order creation failed:", errorText);
    throw new Error(`WooCommerce order creation failed: ${response.status}`);
  }

  const order = await response.json();
  console.log("✅ WooCommerce order created:", {
    id: order.id,
    number: order.number,
    paymentRef: params.paymentRef,
  });

  return {
    wooOrderId: order.id,
    wooOrderNumber: String(order.number ?? order.id),
    created: true,
  };
}

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

const paymentMethodTitles: Record<
  CreateKioskOrderParams["paymentMethod"],
  string
> = {
  qpay: "QPay",
  storepay: "StorePay",
  pos: "POS Terminal",
};

/** Consistent prefix so Vercel log search can use query: [Kiosk WC] */
function logKioskWc(
  message: string,
  data?: Record<string, unknown>,
  level: "info" | "error" = "info",
) {
  const line = data
    ? `[Kiosk WC] ${message} ${JSON.stringify(data)}`
    : `[Kiosk WC] ${message}`;
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

/*async function findOrderByPaymentRef(paymentRef: string) {
  const auth = getWcAuthHeader();
  const url = `${getWcBaseUrl()}/wp-json/wc/v3/orders?meta_key=kiosk_payment_ref&meta_value=${encodeURIComponent(paymentRef)}&per_page=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logKioskWc(
      "Order lookup failed",
      { paymentRef, status: response.status, error: errorText.slice(0, 500) },
      "error",
    );
    return null;
  }

  const orders = await response.json();
  return Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
}*/
async function findOrderByPaymentRef(paymentRef: string) {
  const auth = getWcAuthHeader();

  const url =
    `${getWcBaseUrl()}/wp-json/wc/v3/orders` +
    `?per_page=100&orderby=date&order=desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    logKioskWc(
      "Order lookup failed",
      {
        paymentRef,
        status: response.status,
        error: errorText.slice(0, 500),
      },
      "error",
    );

    return null;
  }

  const orders = await response.json();

  if (!Array.isArray(orders)) {
    return null;
  }

  const existingOrder = orders.find((order: any) => {
    if (!Array.isArray(order.meta_data)) {
      return false;
    }

    return order.meta_data.some(
      (meta: any) =>
        meta.key === "kiosk_payment_ref" &&
        String(meta.value) === String(paymentRef),
    );
  });

  return existingOrder ?? null;
}
export async function createKioskOrder(
  params: CreateKioskOrderParams,
): Promise<CreateKioskOrderResult> {
  const lineItems = cartItemsToLineItems(params.cartItems);

  logKioskWc("createKioskOrder start", {
    paymentRef: params.paymentRef,
    paymentMethod: params.paymentMethod,
    kioskOrderNumber: params.kioskOrderNumber,
    cartItemCount: params.cartItems?.length ?? 0,
    lineItems,
  });

  const existing = await findOrderByPaymentRef(params.paymentRef);
  if (existing) {
    logKioskWc("Order already exists (idempotent skip)", {
      paymentRef: params.paymentRef,
      wooOrderId: existing.id,
      wooOrderNumber: existing.number ?? existing.id,
    });
    return {
      wooOrderId: existing.id,
      wooOrderNumber: String(existing.number ?? existing.id),
      created: false,
    };
  }

  if (lineItems.length === 0) {
    logKioskWc(
      "Cannot create order: no line items",
      { paymentRef: params.paymentRef, cartItems: params.cartItems },
      "error",
    );
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

  logKioskWc("Posting order to WooCommerce", {
    paymentRef: params.paymentRef,
    lineItemCount: lineItems.length,
    amount: params.amount,
  });

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
    logKioskWc(
      "Order creation failed",
      {
        paymentRef: params.paymentRef,
        status: response.status,
        error: errorText.slice(0, 1000),
        lineItems,
      },
      "error",
    );
    throw new Error(`WooCommerce order creation failed: ${response.status}`);
  }

  const order = await response.json();
  logKioskWc("Order created successfully", {
    paymentRef: params.paymentRef,
    wooOrderId: order.id,
    wooOrderNumber: order.number ?? order.id,
    lineItems,
  });

  return {
    wooOrderId: order.id,
    wooOrderNumber: String(order.number ?? order.id),
    created: true,
  };
}

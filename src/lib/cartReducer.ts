export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock_status: string;
};

const cartStorageKey = "cart";

export const getCartItemKey = (item: Pick<CartItem, "id" | "stock_status">) =>
  `${item.id}|${item.stock_status ?? ""}`;

export const normalizeCartItems = (items: CartItem[]): CartItem[] => {
  const byKey = new Map<string, CartItem>();

  for (const raw of items ?? []) {
    if (!raw || typeof raw.id !== "number") continue;
    const quantity = Math.max(1, Number(raw.quantity) || 1);

    const normalized: CartItem = {
      ...raw,
      quantity,
      price: Number(raw.price) || 0,
      name: String(raw.name ?? ""),
      image: String(raw.image ?? ""),
      stock_status: String(raw.stock_status ?? ""),
    };

    const key = getCartItemKey(normalized);
    const existing = byKey.get(key);
    if (existing) {
      byKey.set(key, { ...existing, quantity: existing.quantity + normalized.quantity });
    } else {
      byKey.set(key, normalized);
    }
  }

  return Array.from(byKey.values());
};

export const calcTotalQuantity = (items: CartItem[]) =>
  (items ?? []).reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

export const calcTotalPrice = (items: CartItem[]) =>
  (items ?? []).reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

export type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "removeByKey"; key: string }
  | { type: "updateQuantity"; key: string; quantity: number }
  | { type: "clear" }
  | { type: "replaceAll"; items: CartItem[] };

export const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case "add": {
      const incoming = action.item;
      const quantity = Math.max(1, Number(incoming.quantity) || 1);
      const item: CartItem = { ...incoming, quantity };

      const key = getCartItemKey(item);
      const idx = state.findIndex((x) => getCartItemKey(x) === key);
      if (idx >= 0) {
        const next = [...state];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...state, item];
    }

    case "removeByKey":
      return state.filter((x) => getCartItemKey(x) !== action.key);

    case "updateQuantity": {
      const qty = Math.max(1, Number(action.quantity) || 1);
      return state.map((x) =>
        getCartItemKey(x) === action.key ? { ...x, quantity: qty } : x
      );
    }

    case "clear":
      return [];

    case "replaceAll":
      return normalizeCartItems(action.items);

    default:
      return state;
  }
};

export const getCartStorageKey = () => cartStorageKey;


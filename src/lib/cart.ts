export type CartItem = {
    productId: string;
    quantity: number;
    imageUrl?: string; // chosen variant (pqq.png vs pqq-single.png)
  };
  
  const KEY = "hcm_cart_v1";
  
  export function getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  }
  
  export function setCart(items: CartItem[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }
  
  export function addToCart(item: CartItem) {
    const cart = getCart();
    const idx = cart.findIndex(
      (x) => x.productId === item.productId && x.imageUrl === item.imageUrl
    );
    if (idx >= 0) cart[idx].quantity += item.quantity;
    else cart.push(item);
    setCart(cart);
  }
  
  export function updateQty(index: number, qty: number) {
    const cart = getCart();
    cart[index].quantity = Math.max(1, qty);
    setCart(cart);
  }
  
  export function removeItem(index: number) {
    const cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
  }
  
  export function clearCart() {
    setCart([]);
  }
  
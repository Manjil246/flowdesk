import mongoose from "mongoose";
import { BotSession } from "../models/bot-session.model";

/* ------------------------------------------------------------------ */
/*  Lean sub-types used by the repository callers                     */
/* ------------------------------------------------------------------ */

export type NumberedCategory = { n: number; id: string; name: string };
export type NumberedProduct = {
  n: number;
  id: string;
  name: string;
  basePrice: number;
};
export type NumberedColor = {
  n: number;
  id: string;
  name: string;
  imageUrl: string;
};
export type ProductDetailSnapshot = {
  productId: string;
  productName: string;
  description: string;
  fabric: string;
  occasions: string[];
  basePrice: number;
  currency: string;
  sizes: string[];
  colors: NumberedColor[];
};
export type CartItem = {
  n: number;
  productId: string;
  colorId: string;
  productName: string;
  size: string;
  colorName: string;
  colorN: number;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  currency: string;
};
export type CheckoutLocation = {
  lat?: number;
  lng?: number;
  name?: string;
  address?: string;
  raw: string;
  isManual: boolean;
};
export type BotSessionLean = {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  categories: NumberedCategory[];
  products: NumberedProduct[];
  productDetail: ProductDetailSnapshot | null;
  selectedSize: string | null;
  selectedColorN: number | null;
  imageSent: boolean;
  cart: CartItem[];
  checkoutLocation: CheckoutLocation | null;
  checkoutPhone: string | null;
  checkoutStarted: boolean;
  orderPlacedAt?: Date | null;
  sessionStartedAt: Date;
};

export type ResolvedSelections = {
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  size: string;
  imageUrl: string;
  unitPrice: number;
  currency: string;
};

/* ------------------------------------------------------------------ */
/*  Repository                                                         */
/* ------------------------------------------------------------------ */

export class BotSessionRepository {
  /** Upsert – create if missing, return the lean document. */
  async getOrCreate(conversationId: string): Promise<BotSessionLean> {
    const doc = await BotSession.findOneAndUpdate(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $setOnInsert: {
          conversationId: new mongoose.Types.ObjectId(conversationId),
          categories: [],
          products: [],
          productDetail: null,
          selectedSize: null,
          selectedColorN: null,
          imageSent: false,
          cart: [],
          checkoutLocation: null,
          checkoutPhone: null,
          checkoutStarted: false,
          orderPlacedAt: null,
          sessionStartedAt: new Date(),
        },
      },
      { upsert: true, new: true, lean: true },
    );
    return doc as unknown as BotSessionLean;
  }

  /**
   * Replace the categories menu and clear everything downstream
   * (products, detail, selections).
   */
  async setCategoriesMenu(
    conversationId: string,
    categories: NumberedCategory[],
  ): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $set: {
          categories,
          products: [],
          productDetail: null,
          selectedSize: null,
          selectedColorN: null,
          imageSent: false,
          orderPlacedAt: null,
          sessionStartedAt: new Date(),
        },
      },
    );
  }

  /**
   * Replace the products menu and clear detail + selections.
   */
  async setProductsMenu(
    conversationId: string,
    products: NumberedProduct[],
  ): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $set: {
          products,
          productDetail: null,
          selectedSize: null,
          selectedColorN: null,
          imageSent: false,
        },
      },
    );
  }

  /**
   * Set the product detail snapshot and clear size/color selections.
   */
  async setProductDetail(
    conversationId: string,
    detail: ProductDetailSnapshot,
  ): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $set: {
          productDetail: detail,
          selectedSize: null,
          selectedColorN: null,
          imageSent: false,
        },
      },
    );
  }

  async setSize(conversationId: string, size: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { selectedSize: size, imageSent: false } },
    );
  }

  async setColor(conversationId: string, colorN: number): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { selectedColorN: colorN, imageSent: false } },
    );
  }

  async markImageSent(conversationId: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { imageSent: true } },
    );
  }

  async restartShopping(conversationId: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $unset: {
          products: "",
          productDetail: "",
          selectedSize: "",
          selectedColorN: "",
          imageSent: "",
          orderPlacedAt: "",
          cart: "",
          checkoutLocation: "",
          checkoutPhone: "",
        },
        $set: {
          checkoutStarted: false,
          sessionStartedAt: new Date(),
        },
      },
    );
  }

  async changeProduct(conversationId: string): Promise<void> {
    await this.clearActiveSelection(conversationId);
  }

  async clearActiveSelection(conversationId: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $set: {
          productDetail: null,
          selectedSize: null,
          selectedColorN: null,
          imageSent: false,
        },
      },
    );
  }

  async resetAfterOrder(conversationId: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $unset: {
          products: "",
          productDetail: "",
          selectedSize: "",
          selectedColorN: "",
          imageSent: "",
          cart: "",
          checkoutLocation: "",
          checkoutPhone: "",
        },
        $set: {
          orderPlacedAt: new Date(),
          checkoutStarted: false,
          sessionStartedAt: new Date(),
        },
      },
    );
  }

  async addToCart(
    conversationId: string,
    quantity: number,
  ): Promise<CartItem | null> {
    const session = await this.getOrCreate(conversationId);
    const selections = this.resolveSelections(session);
    if (!selections) return null;
    if (session.selectedColorN == null) return null;

    const cartItem: CartItem = {
      n: (session.cart?.length ?? 0) + 1,
      productId: selections.productId,
      colorId: selections.colorId,
      productName: selections.productName,
      size: selections.size,
      colorName: selections.colorName,
      colorN: session.selectedColorN,
      unitPrice: selections.unitPrice,
      quantity,
      imageUrl: selections.imageUrl,
      currency: selections.currency || "NPR",
    };

    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $push: { cart: cartItem },
        $set: {
          productDetail: null,
          selectedSize: null,
          selectedColorN: null,
          imageSent: false,
        },
      },
    );
    return cartItem;
  }

  async removeFromCart(conversationId: string, itemN: number): Promise<void> {
    const session = await this.getOrCreate(conversationId);
    const remaining = (session.cart ?? [])
      .filter((item) => item.n !== itemN)
      .map((item, idx) => ({ ...item, n: idx + 1 }));

    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { cart: remaining } },
    );
  }

  async clearCart(conversationId: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { cart: [] } },
    );
  }

  async setCheckoutLocation(
    conversationId: string,
    location: CheckoutLocation,
  ): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { checkoutLocation: location } },
    );
  }

  async setCheckoutPhone(conversationId: string, phone: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { checkoutPhone: phone } },
    );
  }

  async clearCheckout(conversationId: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      {
        $set: {
          checkoutLocation: null,
          checkoutPhone: null,
          checkoutStarted: false,
        },
      },
    );
  }

  async setCheckoutStarted(conversationId: string): Promise<void> {
    await BotSession.updateOne(
      { conversationId: new mongoose.Types.ObjectId(conversationId) },
      { $set: { checkoutStarted: true } },
    );
  }

  async get(conversationId: string): Promise<BotSessionLean | null> {
    const doc = await BotSession.findOne({
      conversationId: new mongoose.Types.ObjectId(conversationId),
    }).lean();
    return (doc as unknown as BotSessionLean) ?? null;
  }

  /**
   * Resolve full selections from session state.
   * Returns null if any required piece is missing.
   */
  resolveSelections(session: BotSessionLean): ResolvedSelections | null {
    const detail = session.productDetail;
    if (!detail) return null;

    const size = session.selectedSize;
    if (!size) return null;

    const colorN = session.selectedColorN;
    if (colorN == null) return null;

    const color = detail.colors.find((c) => c.n === colorN);
    if (!color) return null;

    return {
      productId: detail.productId,
      productName: detail.productName,
      colorId: color.id,
      colorName: color.name,
      size,
      imageUrl: color.imageUrl,
      unitPrice: detail.basePrice,
      currency: detail.currency,
    };
  }

  /**
   * Resolve a color from session state (for preview or after selection).
   * If `colorN` is provided, use that number; otherwise use `selectedColorN`.
   */
  resolveColor(
    session: BotSessionLean,
    colorN?: number,
  ): { productId: string; colorId: string; colorName: string; imageUrl: string } | null {
    const detail = session.productDetail;
    if (!detail) return null;

    const n = colorN ?? session.selectedColorN;
    if (n == null) {
      const first = detail.colors[0];
      if (!first) return null;
      return {
        productId: detail.productId,
        colorId: first.id,
        colorName: first.name,
        imageUrl: first.imageUrl,
      };
    }

    const color = detail.colors.find((c) => c.n === n);
    if (!color) return null;
    return {
      productId: detail.productId,
      colorId: color.id,
      colorName: color.name,
      imageUrl: color.imageUrl,
    };
  }
}

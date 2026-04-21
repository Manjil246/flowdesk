import { LADIES_FASHION_BOT_SYSTEM_PROMPT } from "../constants/ladies-fashion-bot-system-prompt";
import { LADIES_FASHION_WHATSAPP_TOOLS } from "../constants/whatsapp-bot-tools";
import {
  BOT_AUTO_REPLY_ENABLED,
  BOT_REPLY_HISTORY_LIMIT,
  OPENAI_API_KEY,
} from "../config/imports";
import {
  addToCartToolArgsSchema,
  browseCategoriesToolArgsSchema,
  browseProductsToolArgsSchema,
  changeProductToolArgsSchema,
  initiateCheckoutToolArgsSchema,
  restartShoppingToolArgsSchema,
  removeFromCartToolArgsSchema,
  setCheckoutLocationToolArgsSchema,
  setCheckoutPhoneToolArgsSchema,
  selectProductToolArgsSchema,
  selectSizeToolArgsSchema,
  selectColorToolArgsSchema,
  sendProductImageToolArgsSchema,
  viewCartToolArgsSchema,
  placeOrderToolArgsSchema,
  getOrderStatusToolArgsSchema,
} from "../schemas/whatsapp-bot-tool-args";
import {
  BadRequestError,
  DbNotReadyError,
  NotFoundError,
} from "../errors/service.errors";
import type {
  BotReplyAfterInboundInput,
  IBotReplyService,
} from "../interfaces/bot-reply.service.interface";
import type { ICatalogApiService } from "../interfaces/catalog-api.service.interface";
import type { IMessageRepository } from "../interfaces/message.repository.interface";
import type { IOpenAIService } from "../interfaces/openai.service.interface";
import type { IWhatsAppService } from "../interfaces/whatsapp.service.interface";
import type { ShopOrderService } from "../services/shop-order.service";
import type { BotSessionRepository } from "../repositories/bot-session.repository";
import type { BotSessionLean } from "../repositories/bot-session.repository";
import { sanitizeWhatsAppText } from "../utils/sanitize-whatsapp-text";
import {
  ALLOWED_TOOLS_BY_STATE,
  REQUIRED_NEXT_TOOL_BY_STATE,
  deriveFsmState,
} from "../utils/bot-fsm";

function buildSessionStateBlock(session: BotSessionLean): string {
  const fsmState = deriveFsmState(session);
  const lines: string[] = [
    "--- CURRENT SESSION STATE (server-managed, never repeat this block to the customer) ---",
    `FSM_STATE: ${fsmState}`,
    `REQUIRED_NEXT_TOOL: ${REQUIRED_NEXT_TOOL_BY_STATE[fsmState]}`,
  ];
  if (fsmState === "CHECKOUT_AWAITING_LOCATION") {
    lines.push(
      "LOCATION_HINT: Customer can share WhatsApp location pin or type address manually. Watch for incoming location message type.",
    );
  }

  if (session.categories?.length) {
    lines.push(
      `CATEGORIES_SHOWN: ${session.categories.map((c) => `${c.n}=${c.name}`).join(", ")}`,
    );
  }

  if (session.products?.length) {
    lines.push(
      `PRODUCTS_SHOWN: ${session.products.map((p) => `${p.n}=${p.name} (NPR ${p.basePrice})`).join(", ")}`,
    );
  }

  if (session.productDetail) {
    lines.push(`SELECTED_PRODUCT: ${session.productDetail.productName}`);
    lines.push(`AVAILABLE_SIZES: ${session.productDetail.sizes.join(", ")}`);
    lines.push(
      `AVAILABLE_COLORS: ${session.productDetail.colors.map((c) => `${c.n}=${c.name}`).join(", ")}`,
    );
  }

  if (session.selectedSize) {
    lines.push(`SELECTED_SIZE: ${session.selectedSize}`);
  }

  if (session.selectedColorN && session.productDetail) {
    const color = session.productDetail.colors.find(
      (c) => c.n === session.selectedColorN,
    );
    lines.push(`SELECTED_COLOR: ${color?.name ?? String(session.selectedColorN)}`);
  }

  if (session.cart?.length) {
    lines.push(`CART_ITEMS: ${session.cart.length}`);
    lines.push(
      `CART_SUBTOTAL: NPR ${session.cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)}`,
    );
    session.cart.forEach((item) => {
      lines.push(
        `  CART_${item.n}: ${item.productName} ${item.size} ${item.colorName} x${item.quantity} = NPR ${item.unitPrice * item.quantity}`,
      );
    });
  } else {
    lines.push("CART_ITEMS: 0");
  }

  if (session.checkoutLocation) {
    lines.push(`CHECKOUT_LOCATION: ${session.checkoutLocation.raw}`);
  }
  if (session.checkoutPhone) {
    lines.push(`CHECKOUT_PHONE: ${session.checkoutPhone}`);
  }

  lines.push("---");
  return lines.join("\n");
}

export class BotReplyService implements IBotReplyService {
  constructor(
    private readonly openAIService: IOpenAIService,
    private readonly whatsAppService: IWhatsAppService,
    private readonly messageRepository: IMessageRepository,
    private readonly catalogService: ICatalogApiService,
    private readonly shopOrderService: ShopOrderService,
    private readonly botSessionRepo: BotSessionRepository,
  ) {}

  async maybeReplyAfterInbound(
    input: BotReplyAfterInboundInput,
  ): Promise<void> {
    if (!BOT_AUTO_REPLY_ENABLED) return;
    if (!input.botMode) return;
    if (input.messageType !== "text" && input.messageType !== "location") return;
    if (!OPENAI_API_KEY.trim()) return;
    const userText = input.text.trim();
    if (!userText) return;

    try {
      const session = await this.botSessionRepo.getOrCreate(input.conversationId);
      const inboundState = deriveFsmState(session);
      if (
        input.messageType === "location" &&
        inboundState !== "CHECKOUT_AWAITING_LOCATION"
      ) {
        await this.whatsAppService.sendTextMessage({
          conversationId: input.conversationId,
          text: "लोकेशन पिन पायौँ। अहिले चलिरहेको चरण पूरा गरौं, चाहिनुपरे फेरि लोकेशन माग्छु।",
          senderRole: "bot",
        });
        return;
      }
      const history = await this.messageRepository.findRecentTextTurnsForChat(
        input.conversationId,
        BOT_REPLY_HISTORY_LIMIT,
        session.sessionStartedAt,
      );

      const sessionStateBlock = buildSessionStateBlock(session);
      const dynamicSystemContent = `${LADIES_FASHION_BOT_SYSTEM_PROMPT}\n\n${sessionStateBlock}`;

      const locationHint =
        input.messageType === "location" && input.locationData
          ? `\n\nINBOUND_LOCATION_DATA: ${JSON.stringify(input.locationData)}\nIf FSM_STATE is CHECKOUT_AWAITING_LOCATION, call set_checkout_location immediately using this structured data with isManual=false.\n`
          : "";
      const messages = [
        { role: "system" as const, content: dynamicSystemContent },
        ...history.map((t) => ({
          role: t.role,
          content: t.content,
        })),
        ...(locationHint ? [{ role: "system" as const, content: locationHint }] : []),
      ];

      const conversationId = input.conversationId;
      const runToolTrace: Array<{
        name: string;
        arguments: string;
        result: string;
      }> = [];

      await this.openAIService.runChatWithTools(messages, {
        tools: LADIES_FASHION_WHATSAPP_TOOLS,
        onToolCall: async (name, argsJson) => {
          const pushResult = (
            toolName: string,
            args: string,
            result: string,
          ) => {
            const argsPreview =
              args.length > 700 ? `${args.slice(0, 700)}...` : args;
            const resultPreview =
              result.length > 700 ? `${result.slice(0, 700)}...` : result;
            console.info(
              `[bot-reply][tool][${conversationId}] ${toolName} args=${argsPreview} result=${resultPreview}`,
            );
            runToolTrace.push({ name: toolName, arguments: args, result });
            return result;
          };

          console.info(
            `[bot-reply][tool-call][${conversationId}] ${name} rawArgs=${argsJson.length > 700 ? `${argsJson.slice(0, 700)}...` : argsJson}`,
          );

          const sessionNow = await this.botSessionRepo.getOrCreate(conversationId);
          const fsmState = deriveFsmState(sessionNow);
          const allowedTools = ALLOWED_TOOLS_BY_STATE[fsmState];
          if (!allowedTools.includes(name)) {
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: false,
                error: "invalid_state",
                reasonCode: `FSM_STATE_${fsmState}`,
                requiredNextTool: REQUIRED_NEXT_TOOL_BY_STATE[fsmState],
              }),
            );
          }

          let parsed: unknown;
          try {
            parsed = JSON.parse(argsJson) as unknown;
          } catch {
            return JSON.stringify({
              ok: false,
              error: "invalid_arguments_json",
            });
          }

          const catalogErr = (e: unknown) => {
            if (e instanceof DbNotReadyError) {
              return JSON.stringify({
                ok: false,
                error: "database_unavailable",
              });
            }
            if (e instanceof NotFoundError) {
              return JSON.stringify({ ok: false, error: "not_found" });
            }
            if (e instanceof BadRequestError) {
              return JSON.stringify({
                ok: false,
                error: "bad_request",
                message: e.message,
              });
            }
            const m = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ ok: false, error: m });
          };

          /* -------------------------------------------------------- */
          /*  browse_categories                                       */
          /* -------------------------------------------------------- */
          if (name === "browse_categories") {
            const payload =
              typeof parsed === "object" &&
              parsed !== null &&
              !Array.isArray(parsed)
                ? parsed
                : {};
            const checked =
              browseCategoriesToolArgsSchema.safeParse(payload);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            try {
              const categories = await this.catalogService.listCategories({
                active: true,
                skip: 0,
                limit: 100,
              });
              const numbered = categories.map((c, i) => ({
                n: i + 1,
                id: c.id,
                name: c.name,
              }));
              await this.botSessionRepo.setCategoriesMenu(
                conversationId,
                numbered,
              );
              const forLLM = numbered.map((c) => ({
                n: c.n,
                name: c.name,
              }));
              return pushResult(
                name,
                argsJson,
                JSON.stringify({ ok: true, categories: forLLM }),
              );
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          /* -------------------------------------------------------- */
          /*  browse_products                                         */
          /* -------------------------------------------------------- */
          if (name === "browse_products") {
            const checked = browseProductsToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const { categoryNumber, limit } = checked.data;
            try {
              const session = await this.botSessionRepo.getOrCreate(
                conversationId,
              );
              const cat = session.categories.find(
                (c) => c.n === categoryNumber,
              );
              if (!cat) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "invalid_category_number",
                    message: `No category with number ${categoryNumber}. Available: ${session.categories.map((c) => `${c.n}=${c.name}`).join(", ") || "none (call browse_categories first)"}`,
                  }),
                );
              }
              const products = await this.catalogService.listProducts({
                categoryId: cat.id,
                active: true,
                skip: 0,
                limit,
              });
              const numbered = products.map((p, i) => ({
                n: i + 1,
                id: p.id,
                name: p.name,
                basePrice: p.basePrice,
              }));
              await this.botSessionRepo.setProductsMenu(
                conversationId,
                numbered,
              );
              const forLLM = numbered.map((p) => ({
                n: p.n,
                name: p.name,
              }));
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: true,
                  categoryName: cat.name,
                  products: forLLM,
                }),
              );
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          /* -------------------------------------------------------- */
          /*  select_product                                          */
          /* -------------------------------------------------------- */
          if (name === "select_product") {
            const checked = selectProductToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const { productNumber } = checked.data;
            try {
              const session = await this.botSessionRepo.getOrCreate(
                conversationId,
              );
              const prod = session.products.find(
                (p) => p.n === productNumber,
              );
              if (!prod) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "invalid_product_number",
                    message: `No product with number ${productNumber}. Available: ${session.products.map((p) => `${p.n}=${p.name}`).join(", ") || "none (call browse_products first)"}`,
                  }),
                );
              }
              const detail = await this.catalogService.getProductDetail(
                prod.id,
              );
              const numberedColors = detail.colors
                .filter((c) => c.active)
                .map((c, i) => ({
                  n: i + 1,
                  id: c.id,
                  name: c.colorName || c.colorNameEn || `Color ${i + 1}`,
                  imageUrl: c.imageUrl,
                }));
              const snapshot = {
                productId: detail.product.id,
                productName: detail.product.name,
                description: detail.product.description,
                fabric: detail.product.fabric,
                occasions: detail.product.occasions,
                basePrice: detail.product.basePrice,
                currency: detail.product.currency,
                sizes: detail.product.allowedSizes,
                colors: numberedColors,
              };
              await this.botSessionRepo.setProductDetail(
                conversationId,
                snapshot,
              );

              const colorsForLLM = numberedColors.map((c) => ({
                n: c.n,
                name: c.name,
              }));

              const stockSummary: Record<
                string,
                Array<{ size: string; available: boolean; price: number | null }>
              > = {};
              for (const color of detail.colors.filter((c) => c.active)) {
                const cNum = numberedColors.find((nc) => nc.id === color.id);
                if (!cNum) continue;
                stockSummary[`color_${cNum.n}`] = color.stock
                  .filter((s) => s.active)
                  .map((s) => ({
                    size: s.size,
                    available: s.isAvailable,
                    price: s.price,
                  }));
              }

              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: true,
                  product: detail.product.name,
                  description: detail.product.description,
                  fabric: detail.product.fabric,
                  occasions: detail.product.occasions,
                  basePrice: detail.product.basePrice,
                  currency: detail.product.currency,
                  sizes: detail.product.allowedSizes,
                  colors: colorsForLLM,
                  stockByColor: stockSummary,
                }),
              );
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          /* -------------------------------------------------------- */
          /*  select_size                                             */
          /* -------------------------------------------------------- */
          if (name === "select_size") {
            const checked = selectSizeToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const { size } = checked.data;
            try {
              const session = await this.botSessionRepo.getOrCreate(
                conversationId,
              );
              if (!session.productDetail) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "no_product_selected",
                    message:
                      "Call select_product first before selecting a size.",
                  }),
                );
              }
              const validSizes = session.productDetail.sizes;
              const match = validSizes.find(
                (s) => s.toLowerCase() === size.toLowerCase(),
              );
              if (!match) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "invalid_size",
                    message: `"${size}" is not available. Valid sizes: ${validSizes.join(", ")}`,
                  }),
                );
              }
              await this.botSessionRepo.setSize(conversationId, match);
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: true,
                  size: match,
                  product: session.productDetail.productName,
                }),
              );
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          /* -------------------------------------------------------- */
          /*  select_color                                            */
          /* -------------------------------------------------------- */
          if (name === "select_color") {
            const checked = selectColorToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const { colorNumber } = checked.data;
            try {
              const session = await this.botSessionRepo.getOrCreate(
                conversationId,
              );
              if (!session.productDetail) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "no_product_selected",
                    message:
                      "Call select_product first before selecting a colour.",
                  }),
                );
              }
              const color = session.productDetail.colors.find(
                (c) => c.n === colorNumber,
              );
              if (!color) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "invalid_color_number",
                    message: `No colour with number ${colorNumber}. Available: ${session.productDetail.colors.map((c) => `${c.n}=${c.name}`).join(", ")}`,
                  }),
                );
              }
              await this.botSessionRepo.setColor(conversationId, colorNumber);
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: true,
                  colorNumber,
                  colorName: color.name,
                  product: session.productDetail.productName,
                }),
              );
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          /* -------------------------------------------------------- */
          /*  send_product_image                                      */
          /* -------------------------------------------------------- */
          if (name === "send_product_image") {
            const checked = sendProductImageToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            try {
              const session = await this.botSessionRepo.getOrCreate(
                conversationId,
              );
              const resolved = this.botSessionRepo.resolveColor(
                session,
                checked.data.colorNumber,
              );
              if (!resolved) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "no_product_or_color",
                    message:
                      "No product selected or no colour available. Call select_product (and optionally select_color) first.",
                  }),
                );
              }
              const { productId, colorId, imageUrl } = resolved;
              if (!imageUrl) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "missing_image_url",
                  }),
                );
              }
              const mediaRef = `${productId}:${colorId}`;
              try {
                const sent = await this.whatsAppService.sendImageByLink({
                  conversationId,
                  imageUrl,
                  mediaRef,
                  senderRole: "bot",
                  toolTrace: [...runToolTrace],
                });
                await this.botSessionRepo.markImageSent(conversationId);
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: true,
                    sent: true,
                    waMessageId: sent.waMessageId,
                  }),
                );
              } catch (e: unknown) {
                const m = e instanceof Error ? e.message : String(e);
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({ ok: false, error: m }),
                );
              }
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          /* -------------------------------------------------------- */
          /*  add_to_cart                                             */
          /* -------------------------------------------------------- */
          if (name === "add_to_cart") {
            const checked = addToCartToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const cartItem = await this.botSessionRepo.addToCart(
              conversationId,
              checked.data.quantity,
            );
            if (!cartItem) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "no_active_selection",
                  instruction:
                    "Active selection is incomplete. Ensure product, size, and color are selected before adding to cart.",
                }),
              );
            }
            const session = await this.botSessionRepo.getOrCreate(conversationId);
            const cartTotal = session.cart.reduce(
              (sum, i) => sum + i.unitPrice * i.quantity,
              0,
            );
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                addedItem: {
                  productName: cartItem.productName,
                  size: cartItem.size,
                  colorName: cartItem.colorName,
                  unitPrice: cartItem.unitPrice,
                  quantity: cartItem.quantity,
                  lineTotal: cartItem.unitPrice * cartItem.quantity,
                },
                cartItemCount: session.cart.length,
                cartSubtotal: cartTotal,
              }),
            );
          }

          /* -------------------------------------------------------- */
          /*  view_cart                                                */
          /* -------------------------------------------------------- */
          if (name === "view_cart") {
            const checked = viewCartToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const session = await this.botSessionRepo.getOrCreate(conversationId);
            if (!session.cart?.length) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({ ok: true, empty: true, items: [] }),
              );
            }
            const items = session.cart.map((item) => ({
              n: item.n,
              productName: item.productName,
              size: item.size,
              colorName: item.colorName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.unitPrice * item.quantity,
            }));
            const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
            const deliveryCharge = 150;
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                empty: false,
                items,
                subtotal,
                deliveryCharge,
                grandTotal: subtotal + deliveryCharge,
                currency: "NPR",
              }),
            );
          }

          /* -------------------------------------------------------- */
          /*  remove_from_cart                                        */
          /* -------------------------------------------------------- */
          if (name === "remove_from_cart") {
            const checked = removeFromCartToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const session = await this.botSessionRepo.getOrCreate(conversationId);
            const item = session.cart.find((i) => i.n === checked.data.itemNumber);
            if (!item) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({ ok: false, error: "item_not_found" }),
              );
            }
            await this.botSessionRepo.removeFromCart(
              conversationId,
              checked.data.itemNumber,
            );
            const updated = await this.botSessionRepo.getOrCreate(conversationId);
            const cartTotal = updated.cart.reduce(
              (sum, i) => sum + i.unitPrice * i.quantity,
              0,
            );
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                removedItem: item.productName,
                cartItemCount: updated.cart.length,
                cartSubtotal: cartTotal,
                cartEmpty: updated.cart.length === 0,
              }),
            );
          }

          /* -------------------------------------------------------- */
          /*  initiate_checkout                                       */
          /* -------------------------------------------------------- */
          if (name === "initiate_checkout") {
            const checked = initiateCheckoutToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            const session = await this.botSessionRepo.getOrCreate(conversationId);
            if (!session.cart?.length) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "cart_empty",
                  instruction:
                    "Cart is empty. Customer must add items before checkout.",
                }),
              );
            }
            await this.botSessionRepo.clearActiveSelection(conversationId);
            await this.botSessionRepo.setCheckoutStarted(conversationId);
            try {
              await this.whatsAppService.sendLocationRequestMessage({
                conversationId,
                bodyText:
                  "डेलिभरीको लागि आफ्नो location share गर्नुहोस् — तलको बटन थिच्नुस्, वा आफ्नो ठेगाना text मा लेख्न सक्नुहुन्छ।",
                senderRole: "bot",
                toolTrace: [...runToolTrace],
              });
            } catch {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "location_request_send_failed",
                  instruction:
                    "Failed to send location request. Ask customer to type their address manually instead.",
                }),
              );
            }
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                instruction:
                  "Location request message has been sent to the customer with a native WhatsApp location button. Wait for the customer to share their location. Do not send another text asking for location — it was already sent.",
                locationRequestSent: true,
              }),
            );
          }

          /* -------------------------------------------------------- */
          /*  set_checkout_location                                   */
          /* -------------------------------------------------------- */
          if (name === "set_checkout_location") {
            const checked = setCheckoutLocationToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            await this.botSessionRepo.setCheckoutLocation(conversationId, {
              lat: checked.data.lat,
              lng: checked.data.lng,
              name: checked.data.name,
              address: checked.data.address,
              raw: checked.data.raw,
              isManual: checked.data.isManual,
            });
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                locationSaved: checked.data.raw,
                isManual: checked.data.isManual,
                instruction: "Location saved. Now ask for phone number.",
              }),
            );
          }

          /* -------------------------------------------------------- */
          /*  set_checkout_phone                                      */
          /* -------------------------------------------------------- */
          if (name === "set_checkout_phone") {
            const checked = setCheckoutPhoneToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            await this.botSessionRepo.setCheckoutPhone(
              conversationId,
              checked.data.phone,
            );
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                phoneSaved: checked.data.phone,
                instruction:
                  "Phone saved. Now show final billing recap and ask for confirmation before calling place_order.",
              }),
            );
          }

          /* -------------------------------------------------------- */
          /*  place_order                                             */
          /* -------------------------------------------------------- */
          if (name === "place_order") {
            const checked = placeOrderToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            try {
              const session = await this.botSessionRepo.getOrCreate(
                conversationId,
              );
              if (!session.cart?.length) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "cart_empty",
                  }),
                );
              }
              if (!session.checkoutLocation) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "no_location",
                  }),
                );
              }
              if (!session.checkoutPhone) {
                return pushResult(
                  name,
                  argsJson,
                  JSON.stringify({
                    ok: false,
                    error: "no_phone",
                  }),
                );
              }
              const items = session.cart.map((item) => ({
                productId: item.productId,
                colorId: item.colorId,
                size: item.size,
                quantity: item.quantity,
                productName: item.productName,
                colorName: item.colorName,
              }));
              const saved = await this.shopOrderService.createFromBotTool(
                conversationId,
                {
                  customerOrderPhone: session.checkoutPhone,
                  deliveryLocation: session.checkoutLocation.raw,
                  deliveryLocationLat: session.checkoutLocation.lat,
                  deliveryLocationLng: session.checkoutLocation.lng,
                  locationVerified: !session.checkoutLocation.isManual,
                  currency: "NPR",
                  items,
                },
              );
              await this.botSessionRepo.resetAfterOrder(conversationId);
              return pushResult(
                name,
                argsJson,
                JSON.stringify({ ok: true, ...saved }),
              );
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          /* -------------------------------------------------------- */
          /*  get_order_status                                        */
          /* -------------------------------------------------------- */
          if (name === "get_order_status") {
            const checked = getOrderStatusToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            try {
              const status =
                await this.shopOrderService.getOrderStatusForCustomer(
                  conversationId,
                  checked.data.orderReference,
                );
              return pushResult(name, argsJson, JSON.stringify(status));
            } catch (e: unknown) {
              return pushResult(name, argsJson, catalogErr(e));
            }
          }

          if (name === "restart_shopping") {
            const checked = restartShoppingToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            await this.botSessionRepo.restartShopping(conversationId);
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                message: "Session reset. Ready to browse again.",
              }),
            );
          }

          if (name === "change_product") {
            const checked = changeProductToolArgsSchema.safeParse(parsed);
            if (!checked.success) {
              return pushResult(
                name,
                argsJson,
                JSON.stringify({
                  ok: false,
                  error: "validation_failed",
                  ...checked.error.flatten(),
                }),
              );
            }
            await this.botSessionRepo.changeProduct(conversationId);
            return pushResult(
              name,
              argsJson,
              JSON.stringify({
                ok: true,
                message:
                  "Product cleared. Please select a product number from the list.",
              }),
            );
          }

          return JSON.stringify({ ok: false, error: `unknown_tool:${name}` });
        },
        onContentFallback: async (text) => {
          const cleaned = sanitizeWhatsAppText(text);
          if (!cleaned) return;
          await this.whatsAppService.sendTextMessage({
            conversationId,
            text: cleaned,
            senderRole: "bot",
            toolTrace: runToolTrace.length ? [...runToolTrace] : undefined,
          });
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[bot-reply] failed:", msg);
    }
  }
}

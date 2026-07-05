import type { Request, Response } from "express";
import { BadRequestError, DbNotReadyError, NotFoundError } from "../errors/service.errors";
import { reverseGeocode } from "../services/reverse-geocode.service";
import type { ShopOrderService } from "../services/shop-order.service";
import type {
  CreateWebOrderBody,
  ReverseGeocodeQuery,
  TrackWebOrderQuery,
} from "../validationSchemas/shop.VSchema";

export class ShopController {
  constructor(private readonly shopOrderService?: ShopOrderService) {}

  reverseGeocode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lng } = req.validatedQuery as ReverseGeocodeQuery;
      const result = await reverseGeocode(lat, lng);
      res.json(result);
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("[shop] reverse-geocode", e);
      res.status(502).json({ error: "Address lookup failed" });
    }
  };

  createOrder = async (req: Request, res: Response): Promise<void> => {
    if (!this.shopOrderService) {
      res.status(503).json({ error: "Order service unavailable" });
      return;
    }
    try {
      const body = req.body as CreateWebOrderBody;
      const order = await this.shopOrderService.createFromWeb(body);
      res.status(201).json({ order });
    } catch (e) {
      if (e instanceof BadRequestError) {
        res.status(400).json({ error: e.message });
        return;
      }
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[shop] create-order", e);
      res.status(500).json({ error: "Failed to place order" });
    }
  };

  trackOrder = async (req: Request, res: Response): Promise<void> => {
    if (!this.shopOrderService) {
      res.status(503).json({ error: "Order service unavailable" });
      return;
    }
    try {
      const { orderReference, email } = req.validatedQuery as TrackWebOrderQuery;
      const order = await this.shopOrderService.trackForWebCustomer(
        orderReference,
        email,
      );
      res.json({ order });
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.status(404).json({ error: e.message });
        return;
      }
      if (e instanceof DbNotReadyError) {
        res.status(503).json({ error: e.message });
        return;
      }
      console.error("[shop] track-order", e);
      res.status(500).json({ error: "Failed to track order" });
    }
  };
}

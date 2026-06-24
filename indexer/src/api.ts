import express, { Request, Response } from "express";
import {
  getFreelancerStats,
  getInvoiceById,
  getInvoiceHistory,
  getLPStats,
  getProtocolStats,
  getTopLPs,
  queryInvoices,
} from "./db";
import { cacheGet, cacheSet } from "./cache";
import { createApiRateLimiter } from "./rateLimit";

/**
 * Build and return the Express application.
 * Calling this as a factory (rather than exporting a singleton) makes
 * the app trivially injectable in tests.
 */
export function createApp(): express.Application {
  const app = express();
  // Trust the first hop's X-Forwarded-For (e.g. Railway's proxy) so
  // per-IP rate limiting sees real client IPs rather than the proxy's.
  app.set("trust proxy", 1);
  app.use(createApiRateLimiter());
  app.use(express.json());

  // ── GET /health ────────────────────────────────────────────────────────────
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // ── GET /invoices ──────────────────────────────────────────────────────────
  // Supported query parameters (all optional, ANDed together):
  //   ?status=Pending|Funded|Paid|Defaulted
  //   ?freelancer=G...
  //   ?payer=G...
  //   ?funder=G...
  app.get("/invoices", async (req: Request, res: Response) => {
    const { status, freelancer, payer, funder } = req.query;

    const s = typeof status === "string" ? status : "";
    const fl = typeof freelancer === "string" ? freelancer : "";
    const pa = typeof payer === "string" ? payer : "";
    const fu = typeof funder === "string" ? funder : "";
    const cacheKey = `invoices:${s}:${fl}:${pa}:${fu}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const invoices = queryInvoices({
      status: s || undefined,
      freelancer: fl || undefined,
      payer: pa || undefined,
      funder: fu || undefined,
    });

    const result = { invoices };
    await cacheSet(cacheKey, JSON.stringify(result));
    res.json(result);
  });

  app.get("/stats", (_req: Request, res: Response) => {
    res.json(getProtocolStats());
  });

  app.get("/lps/top", (req: Request, res: Response) => {
    const rawLimit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;
    const period =
      typeof req.query.period === "string" ? req.query.period : "all";

    if (!["all", "week", "month"].includes(period)) {
      res
        .status(400)
        .json({ error: "Invalid period - expected all, week, or month" });
      return;
    }

    res.json(getTopLPs(limit, period));
  });

  app.get("/lps/:address/stats", (req: Request, res: Response) => {
    res.json(getLPStats(req.params.address));
  });

  app.get("/freelancers/:address/stats", (req: Request, res: Response) => {
    res.json(getFreelancerStats(req.params.address));
  });

  app.get("/history/:address", (req: Request, res: Response) => {
    const role =
      typeof req.query.role === "string" ? req.query.role : "freelancer";

    if (role !== "freelancer" && role !== "payer" && role !== "funder") {
      res.status(400).json({
        error: "Invalid role - expected freelancer, payer, or funder",
      });
      return;
    }

    res.json(getInvoiceHistory(req.params.address, role));
  });

  // ── GET /invoice/:id ───────────────────────────────────────────────────────
  app.get("/invoice/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id <= 0) {
      res
        .status(400)
        .json({ error: "Invalid invoice ID - must be a positive integer" });
      return;
    }

    const cacheKey = `invoice:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const invoice = getInvoiceById(id);
    if (!invoice) {
      res.status(404).json({ error: `Invoice #${id} not found` });
      return;
    }

    const result = { invoice };
    await cacheSet(cacheKey, JSON.stringify(result));
    res.json(result);
  });

  return app;
}

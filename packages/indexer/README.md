# @iln/indexer

> Horizon event indexer utility for the Invoice Liquidity Network protocol.

Reconstructing protocol state from events (LP earnings history, reputation
timelines, volume charts) requires fetching and parsing thousands of Horizon
transaction records. `ILNEventIndexer` encapsulates all of this complexity
behind a clean, typed API.

## Installation

```bash
# from the monorepo root
pnpm add @iln/indexer
```

## Quick start

```ts
import { ILNEventIndexer } from "@iln/indexer";

const indexer = new ILNEventIndexer(
  "C...<your-iln-contract-id>",
  { horizonUrl: "https://horizon.stellar.org" }
);

// All events for a specific invoice
const invoiceEvents = await indexer.getEventsForInvoice("invoice-001");

// All events for a Stellar address, optionally filtered by type
const lpEvents = await indexer.getEventsForAddress("G...", [
  "LiquidityAdded",
  "LiquidityRemoved",
]);

// All events since a timestamp
const recent = await indexer.getEventsSince("2025-01-01T00:00:00Z");

// Real-time stream via Horizon SSE
const sub = indexer.subscribe((event) => {
  console.log(event.type, event.txHash);
});

// Stop streaming
sub.close();
```

## API

### `new ILNEventIndexer(contractId, options?, fetchFn?)`

| Parameter    | Type             | Default                          |
|--------------|------------------|----------------------------------|
| `contractId` | `string`         | required                         |
| `options.horizonUrl` | `string` | `https://horizon.stellar.org`    |
| `options.pageSize`   | `number` | `200`                            |
| `options.timeoutMs`  | `number` | `30_000`                         |
| `fetchFn`    | `FetchFn`        | `globalThis.fetch`               |

### `.getEventsForInvoice(id) → Promise<ContractEvent[]>`

Returns all events whose first topic matches `id`.

### `.getEventsForAddress(address, types?) → Promise<ContractEvent[]>`

Returns all events for a Stellar address. Optionally filter by event types.

### `.getEventsSince(timestamp) → Promise<ContractEvent[]>`

Returns all events at or after the given timestamp (Unix seconds or ISO-8601).

### `.subscribe(callback, onError?) → SubscriptionHandle`

Opens a Horizon SSE stream. Calls `callback(event)` for every new event.
Call `.close()` on the returned handle to stop the stream.

## Development

```bash
# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint
```

## Architecture

```
packages/indexer/
├── src/
│   ├── index.ts          # Public exports
│   ├── indexer.ts        # ILNEventIndexer class
│   ├── horizon-client.ts # HTTP + pagination + SSE
│   ├── parse.ts          # parseContractEvent adapter
│   └── types.ts          # Shared TypeScript types
└── __tests__/
    └── indexer.test.ts   # Full test suite (mocked Horizon)
```
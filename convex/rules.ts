import { Doc } from "./_generated/dataModel";
import { DataModel } from "./_generated/dataModel";
import { DatabaseReader } from "./_generated/server";
import { Rules } from "convex-helpers/server/rowLevelSecurity";

/**
 * Context available to RLS rule functions.
 *
 * - `user`: The resolved authenticated user, or null if not authenticated.
 * - `db`: The ORIGINAL unwrapped database reader, so rules can look up
 *   related documents without recursive RLS checks.
 */
export type RuleCtx = {
  user: Doc<"users"> | null;
  db: DatabaseReader;
};

/**
 * Centralized Row Level Security rules for all tables.
 *
 * These rules are applied automatically when using the `queryWithRLS`
 * and `mutationWithRLS` custom function builders from `./functions.ts`.
 *
 * Public/webhook endpoints use standard `query`/`mutation` from
 * `_generated/server` and bypass these rules intentionally.
 *
 * Rule semantics:
 * - `read`: Controls document visibility via db.get() and db.query()
 * - `modify`: Controls db.patch(), db.replace(), db.delete()
 * - `insert`: Controls db.insert()
 */
export const rules: Rules<RuleCtx, DataModel> = {
  // ─── Users ─────────────────────────────────────────────
  // Read/write only own record.
  // User creation (upsert) and webhook mutations use standard
  // mutation builder, bypassing RLS.
  users: {
    read: async ({ user }, doc) => {
      if (!user) return false;
      return doc._id === user._id;
    },
    modify: async ({ user }, doc) => {
      if (!user) return false;
      return doc._id === user._id;
    },
    insert: async ({ user }, _doc) => {
      // User creation happens via upsert (standard mutation),
      // but allow if authenticated (for safety)
      return user !== null;
    },
  },

  // ─── Retros ────────────────────────────────────────────
  // Read/write only own retros (by userId).
  // `getByCode` uses standard query, bypassing RLS.
  retros: {
    read: async ({ user }, doc) => {
      if (!user) return false;
      return doc.userId === user._id;
    },
    modify: async ({ user }, doc) => {
      if (!user) return false;
      return doc.userId === user._id;
    },
    insert: async ({ user }, _doc) => {
      return user !== null;
    },
  },

  // ─── Entries ───────────────────────────────────────────
  // Read/modify only if the authenticated user owns the parent retro.
  // Entry creation by participants uses standard mutation, bypassing RLS.
  entries: {
    read: async ({ user, db }, doc) => {
      if (!user) return false;
      const retro = await db.get(doc.retroId);
      if (!retro) return false;
      return retro.userId === user._id;
    },
    modify: async ({ user, db }, doc) => {
      if (!user) return false;
      const retro = await db.get(doc.retroId);
      if (!retro) return false;
      return retro.userId === user._id;
    },
    // No insert rule — entries are created via public mutation
  },

  // ─── Votes ─────────────────────────────────────────────
  // Read/modify only if the authenticated user owns the parent retro
  // (through entry → retro chain).
  // Vote creation/removal by participants uses standard mutation.
  votes: {
    read: async ({ user, db }, doc) => {
      if (!user) return false;
      const entry = await db.get(doc.entryId);
      if (!entry) return false;
      const retro = await db.get(entry.retroId);
      if (!retro) return false;
      return retro.userId === user._id;
    },
    modify: async ({ user, db }, doc) => {
      if (!user) return false;
      const entry = await db.get(doc.entryId);
      if (!entry) return false;
      const retro = await db.get(entry.retroId);
      if (!retro) return false;
      return retro.userId === user._id;
    },
  },

  // ─── Subscriptions ────────────────────────────────────
  // Read/write only own subscription records.
  // Webhook mutations (create/update/cancel) use standard mutation.
  subscriptions: {
    read: async ({ user }, doc) => {
      if (!user) return false;
      return doc.userId === user._id;
    },
    modify: async ({ user }, doc) => {
      if (!user) return false;
      return doc.userId === user._id;
    },
    // No insert rule — subscriptions are created via webhook
  },
};

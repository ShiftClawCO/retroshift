import { mutation } from "./_generated/server";
import { queryWithRLS } from "./functions";
import { v } from "convex/values";

// ─── Authenticated endpoints (RLS-protected) ──────────────
// These read endpoints are used by the retro owner on the dashboard.
// RLS ensures only the retro owner can see votes (via entry → retro chain).

/**
 * List votes by entry.
 * Previously had NO auth check — now secured via RLS.
 */
export const listByEntry = queryWithRLS({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    return await ctx.db
      .query("votes")
      .withIndex("by_entry", (q) => q.eq("entryId", args.entryId))
      .collect();
  },
});

/**
 * List votes for multiple entries (batch).
 * Previously had NO auth check — now secured via RLS.
 */
export const listByEntries = queryWithRLS({
  args: { entryIds: v.array(v.id("entries")) },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    const allVotes = [];
    for (const entryId of args.entryIds) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_entry", (q) => q.eq("entryId", entryId))
        .collect();
      allVotes.push(...votes);
    }
    return allVotes;
  },
});

/**
 * Get vote by participant for an entry.
 * Previously had NO auth check — now secured via RLS.
 */
export const getByParticipant = queryWithRLS({
  args: {
    entryId: v.id("entries"),
    participantId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return null;

    return await ctx.db
      .query("votes")
      .withIndex("by_participant", (q) =>
        q.eq("entryId", args.entryId).eq("participantId", args.participantId)
      )
      .first();
  },
});

/**
 * Get vote summary for an entry.
 * Previously had NO auth check — now secured via RLS.
 */
export const getSummary = queryWithRLS({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
    if (!ctx.user) return { upvotes: 0, downvotes: 0, total: 0, count: 0 };

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_entry", (q) => q.eq("entryId", args.entryId))
      .collect();

    let upvotes = 0;
    let downvotes = 0;

    for (const vote of votes) {
      if (vote.value > 0) upvotes++;
      else if (vote.value < 0) downvotes++;
    }

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
      count: votes.length,
    };
  },
});

// ─── Public endpoints (no RLS) ─────────────────────────────
// These are used by anonymous participants to vote.
// Participants are identified by participantId (client-generated UUID).

/**
 * Upsert vote (create or update).
 * Public — for participants. No RLS.
 * Validates entry exists and retro is not closed.
 */
export const upsert = mutation({
  args: {
    entryId: v.id("entries"),
    participantId: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify entry exists
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Entry not found");
    }

    // Check if retro is closed
    const retro = await ctx.db.get(entry.retroId);
    if (!retro) {
      throw new Error("Retro not found");
    }
    if (retro.isClosed) {
      throw new Error("RETRO_CLOSED");
    }

    // Find existing vote
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_participant", (q) =>
        q.eq("entryId", args.entryId).eq("participantId", args.participantId)
      )
      .first();

    // If value is 0, remove the vote
    if (args.value === 0) {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
      return null;
    }

    // Clamp value to -1 or 1
    const value = args.value > 0 ? 1 : -1;

    if (existing) {
      // Update existing vote
      await ctx.db.patch(existing._id, { value });
      return existing._id;
    } else {
      // Create new vote
      return await ctx.db.insert("votes", {
        entryId: args.entryId,
        participantId: args.participantId,
        value,
        createdAt: Date.now(),
      });
    }
  },
});

/**
 * Remove vote.
 * Public — for participants. No RLS.
 */
export const remove = mutation({
  args: {
    entryId: v.id("entries"),
    participantId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_participant", (q) =>
        q.eq("entryId", args.entryId).eq("participantId", args.participantId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

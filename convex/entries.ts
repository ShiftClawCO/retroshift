import { mutation } from "./_generated/server";
import { queryWithRLS, mutationWithRLS } from "./functions";
import { v } from "convex/values";

// Free tier limits
const FREE_MAX_PARTICIPANTS = 10;
const FREE_LINK_VALIDITY_DAYS = 7;

// ─── Authenticated endpoints (RLS-protected) ──────────────

/**
 * List entries by retro (real-time).
 * RLS ensures only the retro owner can see entries.
 * Previously had NO auth check — now secured.
 */
export const listByRetro = queryWithRLS({
  args: { retroId: v.id("retros") },
  handler: async (ctx, args) => {
    if (!ctx.user) return [];

    // RLS-wrapped db: only returns entries for retros owned by ctx.user
    return await ctx.db
      .query("entries")
      .withIndex("by_retro", (q) => q.eq("retroId", args.retroId))
      .order("asc")
      .collect();
  },
});

/**
 * Count unique participants for a retro.
 * RLS ensures only the retro owner can see participant data.
 * Previously had NO auth check — now secured.
 */
export const countParticipants = queryWithRLS({
  args: { retroId: v.id("retros") },
  handler: async (ctx, args) => {
    if (!ctx.user) return 0;

    // RLS-wrapped db: only returns entries for owned retros
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_retro", (q) => q.eq("retroId", args.retroId))
      .collect();

    const uniqueParticipants = new Set<string>();
    entries.forEach((entry) => {
      if (entry.participantId) {
        uniqueParticipants.add(entry.participantId);
      }
    });

    return uniqueParticipants.size;
  },
});

/**
 * Delete entry (owner only).
 * RLS mutation validates the user owns the parent retro.
 */
export const remove = mutationWithRLS({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    // RLS-wrapped db.get: returns null if user doesn't own the retro
    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Entry not found");

    // Delete votes for this entry (RLS validates ownership on each)
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_entry", (q) => q.eq("entryId", args.id))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ─── Public endpoints (no RLS) ─────────────────────────────
// These are used by anonymous participants to submit feedback.
// No authentication required — participants are identified by participantId.

/**
 * Create entry (public — for participants).
 * Uses standard mutation: no RLS, no auth required.
 * Validates retro exists, is open, and free tier limits.
 */
export const create = mutation({
  args: {
    retroId: v.id("retros"),
    category: v.string(),
    content: v.string(),
    participantId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get retro (raw db — no RLS)
    const retro = await ctx.db.get(args.retroId);
    if (!retro) {
      throw new Error("Retro not found");
    }

    // Check if retro is closed
    if (retro.isClosed) {
      throw new Error("RETRO_CLOSED");
    }

    // Get retro owner to check plan
    const owner = await ctx.db.get(retro.userId);
    if (!owner) {
      throw new Error("Owner not found");
    }

    // FREE TIER CHECKS
    if (owner.plan === "free") {
      // Check 1: Link validity (7 days)
      const daysSinceCreation = Math.floor(
        (Date.now() - retro.createdAt) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreation > FREE_LINK_VALIDITY_DAYS) {
        throw new Error("LINK_EXPIRED");
      }

      // Check 2: Participant limit (10 unique participants)
      const entries = await ctx.db
        .query("entries")
        .withIndex("by_retro", (q) => q.eq("retroId", args.retroId))
        .collect();

      const uniqueParticipants = new Set<string>();
      entries.forEach((entry) => {
        if (entry.participantId) {
          uniqueParticipants.add(entry.participantId);
        }
      });

      // If this is a new participant, check the limit
      if (!uniqueParticipants.has(args.participantId)) {
        if (uniqueParticipants.size >= FREE_MAX_PARTICIPANTS) {
          throw new Error("PARTICIPANT_LIMIT");
        }
      }
    }

    // Create entry
    return await ctx.db.insert("entries", {
      retroId: args.retroId,
      category: args.category,
      content: args.content.trim(),
      participantId: args.participantId,
      createdAt: Date.now(),
    });
  },
});

/**
 * Batch create entries (multiple categories at once).
 * Public — for participants. No RLS.
 */
export const createBatch = mutation({
  args: {
    retroId: v.id("retros"),
    entries: v.array(
      v.object({
        category: v.string(),
        content: v.string(),
      })
    ),
    participantId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get retro
    const retro = await ctx.db.get(args.retroId);
    if (!retro) {
      throw new Error("Retro not found");
    }

    // Check if retro is closed
    if (retro.isClosed) {
      throw new Error("RETRO_CLOSED");
    }

    // Get retro owner to check plan
    const owner = await ctx.db.get(retro.userId);
    if (!owner) {
      throw new Error("Owner not found");
    }

    // FREE TIER CHECKS
    if (owner.plan === "free") {
      // Check 1: Link validity (7 days)
      const daysSinceCreation = Math.floor(
        (Date.now() - retro.createdAt) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreation > FREE_LINK_VALIDITY_DAYS) {
        throw new Error("LINK_EXPIRED");
      }

      // Check 2: Participant limit
      const existingEntries = await ctx.db
        .query("entries")
        .withIndex("by_retro", (q) => q.eq("retroId", args.retroId))
        .collect();

      const uniqueParticipants = new Set<string>();
      existingEntries.forEach((entry) => {
        if (entry.participantId) {
          uniqueParticipants.add(entry.participantId);
        }
      });

      if (!uniqueParticipants.has(args.participantId)) {
        if (uniqueParticipants.size >= FREE_MAX_PARTICIPANTS) {
          throw new Error("PARTICIPANT_LIMIT");
        }
      }
    }

    // Create all entries
    const createdIds = [];
    for (const entry of args.entries) {
      if (entry.content.trim()) {
        const id = await ctx.db.insert("entries", {
          retroId: args.retroId,
          category: entry.category,
          content: entry.content.trim(),
          participantId: args.participantId,
          createdAt: Date.now(),
        });
        createdIds.push(id);
      }
    }

    return createdIds;
  },
});

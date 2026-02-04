import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List votes by entry
export const listByEntry = query({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_entry", (q) => q.eq("entryId", args.entryId))
      .collect();
  },
});

// List votes for multiple entries (batch)
export const listByEntries = query({
  args: { entryIds: v.array(v.id("entries")) },
  handler: async (ctx, args) => {
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

// Get vote by participant for an entry
export const getByParticipant = query({
  args: {
    entryId: v.id("entries"),
    participantId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_participant", (q) =>
        q.eq("entryId", args.entryId).eq("participantId", args.participantId)
      )
      .first();
  },
});

// Upsert vote (create or update)
export const upsert = mutation({
  args: {
    entryId: v.id("entries"),
    participantId: v.string(),
    value: v.number(), // 1 for upvote, -1 for downvote, 0 to remove
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

// Remove vote
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

// Get vote summary for an entry
export const getSummary = query({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
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

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Free tier limits
const FREE_MAX_RETROS = 3;

// Helper to get current user
async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q: any) => q.eq("workosId", identity.subject))
    .first();

  if (!user) throw new Error("User not found");
  return user;
}

// Generate random access code
function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// List user's retros
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("retros")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get retro by access code (public)
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("retros")
      .withIndex("by_access_code", (q) => q.eq("accessCode", args.code.toUpperCase()))
      .first();
  },
});

// Get retro by ID
export const getById = query({
  args: { id: v.id("retros") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Count user's active retros
export const countByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .first();

    if (!user) return 0;

    const retros = await ctx.db
      .query("retros")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isClosed"), false))
      .collect();

    return retros.length;
  },
});

// Create retro
export const create = mutation({
  args: {
    title: v.string(),
    format: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Check free tier limit
    if (user.plan === "free") {
      const activeRetros = await ctx.db
        .query("retros")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("isClosed"), false))
        .collect();

      if (activeRetros.length >= FREE_MAX_RETROS) {
        throw new Error("RETRO_LIMIT_REACHED");
      }
    }

    // Generate unique access code
    let accessCode = generateAccessCode();
    let existing = await ctx.db
      .query("retros")
      .withIndex("by_access_code", (q) => q.eq("accessCode", accessCode))
      .first();

    while (existing) {
      accessCode = generateAccessCode();
      existing = await ctx.db
        .query("retros")
        .withIndex("by_access_code", (q) => q.eq("accessCode", accessCode))
        .first();
    }

    const now = Date.now();
    const retroId = await ctx.db.insert("retros", {
      userId: user._id,
      title: args.title,
      format: args.format,
      accessCode,
      isClosed: false,
      createdAt: now,
      updatedAt: now,
    });

    // Return the full retro object with accessCode for redirect
    return { retroId, accessCode };
  },
});

// Update retro
export const update = mutation({
  args: {
    id: v.id("retros"),
    title: v.optional(v.string()),
    format: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const retro = await ctx.db.get(args.id);

    if (!retro || retro.userId !== user._id) {
      throw new Error("Retro not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.format !== undefined) updates.format = args.format;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Close/reopen retro
export const toggleClose = mutation({
  args: { id: v.id("retros") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const retro = await ctx.db.get(args.id);

    if (!retro || retro.userId !== user._id) {
      throw new Error("Retro not found");
    }

    await ctx.db.patch(args.id, {
      isClosed: !retro.isClosed,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// Delete retro
export const remove = mutation({
  args: { id: v.id("retros") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const retro = await ctx.db.get(args.id);

    if (!retro || retro.userId !== user._id) {
      throw new Error("Retro not found");
    }

    // Delete all entries and votes for this retro
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_retro", (q) => q.eq("retroId", args.id))
      .collect();

    for (const entry of entries) {
      // Delete votes for this entry
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_entry", (q) => q.eq("entryId", entry._id))
        .collect();

      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }

      await ctx.db.delete(entry._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

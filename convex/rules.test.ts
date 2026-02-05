/**
 * Unit tests for Row Level Security rules.
 *
 * These tests validate the rule functions directly, without requiring
 * a running Convex backend. Each rule is a pure async function that
 * takes a context and a document and returns a boolean.
 *
 * Run with: npx tsx convex/rules.test.ts
 */

import { rules, type RuleCtx } from "./rules";

// ─── Test helpers ──────────────────────────────────────────

type TestDoc = Record<string, any>;

// Mock user docs
const userAlice: TestDoc = {
  _id: "users:alice123" as any,
  _creationTime: Date.now(),
  workosId: "wos_alice",
  email: "alice@example.com",
  plan: "free",
  createdAt: Date.now(),
};

const userBob: TestDoc = {
  _id: "users:bob456" as any,
  _creationTime: Date.now(),
  workosId: "wos_bob",
  email: "bob@example.com",
  plan: "pro",
  createdAt: Date.now(),
};

// Mock retro docs
const retroAlice: TestDoc = {
  _id: "retros:retro_a" as any,
  _creationTime: Date.now(),
  userId: "users:alice123" as any,
  title: "Alice's Retro",
  format: "start-stop-continue",
  accessCode: "ABC123",
  isClosed: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const retroBob: TestDoc = {
  _id: "retros:retro_b" as any,
  _creationTime: Date.now(),
  userId: "users:bob456" as any,
  title: "Bob's Retro",
  format: "mad-sad-glad",
  accessCode: "XYZ789",
  isClosed: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Mock entry docs
const entryInAliceRetro: TestDoc = {
  _id: "entries:entry_1" as any,
  _creationTime: Date.now(),
  retroId: "retros:retro_a" as any,
  category: "start",
  content: "Test entry",
  participantId: "participant_1",
  createdAt: Date.now(),
};

const entryInBobRetro: TestDoc = {
  _id: "entries:entry_2" as any,
  _creationTime: Date.now(),
  retroId: "retros:retro_b" as any,
  category: "mad",
  content: "Another entry",
  participantId: "participant_2",
  createdAt: Date.now(),
};

// Mock vote docs
const voteOnAliceEntry: TestDoc = {
  _id: "votes:vote_1" as any,
  _creationTime: Date.now(),
  entryId: "entries:entry_1" as any,
  participantId: "participant_1",
  value: 1,
  createdAt: Date.now(),
};

const voteOnBobEntry: TestDoc = {
  _id: "votes:vote_2" as any,
  _creationTime: Date.now(),
  entryId: "entries:entry_2" as any,
  participantId: "participant_2",
  value: -1,
  createdAt: Date.now(),
};

// Mock subscription docs
const subscriptionAlice: TestDoc = {
  _id: "subscriptions:sub_a" as any,
  _creationTime: Date.now(),
  userId: "users:alice123" as any,
  stripeSubscriptionId: "sub_stripe_a",
  stripePriceId: "price_a",
  status: "active",
  currentPeriodEnd: Date.now() + 86400000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const subscriptionBob: TestDoc = {
  _id: "subscriptions:sub_b" as any,
  _creationTime: Date.now(),
  userId: "users:bob456" as any,
  stripeSubscriptionId: "sub_stripe_b",
  stripePriceId: "price_b",
  status: "active",
  currentPeriodEnd: Date.now() + 86400000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Mock database reader that returns docs by ID
function mockDb(docs: TestDoc[]): any {
  return {
    get: async (id: string) => docs.find((d) => d._id === id) || null,
  };
}

// Build rule context
function ctxFor(
  user: TestDoc | null,
  extraDocs: TestDoc[] = []
): RuleCtx {
  return {
    user: user as any,
    db: mockDb([
      userAlice,
      userBob,
      retroAlice,
      retroBob,
      entryInAliceRetro,
      entryInBobRetro,
      voteOnAliceEntry,
      voteOnBobEntry,
      subscriptionAlice,
      subscriptionBob,
      ...extraDocs,
    ]),
  };
}

// ─── Test runner ───────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

// ─── Tests ─────────────────────────────────────────────────

async function runTests() {
  console.log("\n🔒 Row Level Security Tests\n");

  // ── Users ────────────────────────────────────────────
  console.log("Users:");

  await test("Unauthenticated cannot read users", async () => {
    const ctx = ctxFor(null);
    const result = await rules.users!.read!(ctx, userAlice as any);
    assert(result === false, "should deny read");
  });

  await test("Alice can read own user record", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.users!.read!(ctx, userAlice as any);
    assert(result === true, "should allow read");
  });

  await test("Alice cannot read Bob's user record", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.users!.read!(ctx, userBob as any);
    assert(result === false, "should deny read");
  });

  await test("Alice can modify own user record", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.users!.modify!(ctx, userAlice as any);
    assert(result === true, "should allow modify");
  });

  await test("Alice cannot modify Bob's user record", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.users!.modify!(ctx, userBob as any);
    assert(result === false, "should deny modify");
  });

  // ── Retros ───────────────────────────────────────────
  console.log("\nRetros:");

  await test("Unauthenticated cannot read retros", async () => {
    const ctx = ctxFor(null);
    const result = await rules.retros!.read!(ctx, retroAlice as any);
    assert(result === false, "should deny read");
  });

  await test("Alice can read own retros", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.retros!.read!(ctx, retroAlice as any);
    assert(result === true, "should allow read");
  });

  await test("Alice cannot read Bob's retros", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.retros!.read!(ctx, retroBob as any);
    assert(result === false, "should deny read");
  });

  await test("Alice can modify own retros", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.retros!.modify!(ctx, retroAlice as any);
    assert(result === true, "should allow modify");
  });

  await test("Alice cannot modify Bob's retros", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.retros!.modify!(ctx, retroBob as any);
    assert(result === false, "should deny modify");
  });

  await test("Authenticated user can insert retros", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.retros!.insert!(ctx, retroAlice as any);
    assert(result === true, "should allow insert");
  });

  await test("Unauthenticated cannot insert retros", async () => {
    const ctx = ctxFor(null);
    const result = await rules.retros!.insert!(ctx, retroAlice as any);
    assert(result === false, "should deny insert");
  });

  // ── Entries ──────────────────────────────────────────
  console.log("\nEntries:");

  await test("Unauthenticated cannot read entries", async () => {
    const ctx = ctxFor(null);
    const result = await rules.entries!.read!(ctx, entryInAliceRetro as any);
    assert(result === false, "should deny read");
  });

  await test("Alice (retro owner) can read entries in her retro", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.entries!.read!(ctx, entryInAliceRetro as any);
    assert(result === true, "should allow read");
  });

  await test("Alice cannot read entries in Bob's retro", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.entries!.read!(ctx, entryInBobRetro as any);
    assert(result === false, "should deny read");
  });

  await test("Bob can read entries in his retro", async () => {
    const ctx = ctxFor(userBob);
    const result = await rules.entries!.read!(ctx, entryInBobRetro as any);
    assert(result === true, "should allow read");
  });

  await test("Alice can modify entries in her retro", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.entries!.modify!(ctx, entryInAliceRetro as any);
    assert(result === true, "should allow modify");
  });

  await test("Alice cannot modify entries in Bob's retro", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.entries!.modify!(ctx, entryInBobRetro as any);
    assert(result === false, "should deny modify");
  });

  // ── Votes ────────────────────────────────────────────
  console.log("\nVotes:");

  await test("Unauthenticated cannot read votes", async () => {
    const ctx = ctxFor(null);
    const result = await rules.votes!.read!(ctx, voteOnAliceEntry as any);
    assert(result === false, "should deny read");
  });

  await test("Alice (retro owner) can read votes on her retro's entries", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.votes!.read!(ctx, voteOnAliceEntry as any);
    assert(result === true, "should allow read");
  });

  await test("Alice cannot read votes on Bob's retro's entries", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.votes!.read!(ctx, voteOnBobEntry as any);
    assert(result === false, "should deny read");
  });

  await test("Bob can read votes on his retro's entries", async () => {
    const ctx = ctxFor(userBob);
    const result = await rules.votes!.read!(ctx, voteOnBobEntry as any);
    assert(result === true, "should allow read");
  });

  await test("Alice can modify votes on her retro's entries", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.votes!.modify!(ctx, voteOnAliceEntry as any);
    assert(result === true, "should allow modify");
  });

  await test("Alice cannot modify votes on Bob's retro's entries", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.votes!.modify!(ctx, voteOnBobEntry as any);
    assert(result === false, "should deny modify");
  });

  // ── Subscriptions ────────────────────────────────────
  console.log("\nSubscriptions:");

  await test("Unauthenticated cannot read subscriptions", async () => {
    const ctx = ctxFor(null);
    const result = await rules.subscriptions!.read!(
      ctx,
      subscriptionAlice as any
    );
    assert(result === false, "should deny read");
  });

  await test("Alice can read own subscription", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.subscriptions!.read!(
      ctx,
      subscriptionAlice as any
    );
    assert(result === true, "should allow read");
  });

  await test("Alice cannot read Bob's subscription", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.subscriptions!.read!(
      ctx,
      subscriptionBob as any
    );
    assert(result === false, "should deny read");
  });

  await test("Alice can modify own subscription", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.subscriptions!.modify!(
      ctx,
      subscriptionAlice as any
    );
    assert(result === true, "should allow modify");
  });

  await test("Alice cannot modify Bob's subscription", async () => {
    const ctx = ctxFor(userAlice);
    const result = await rules.subscriptions!.modify!(
      ctx,
      subscriptionBob as any
    );
    assert(result === false, "should deny modify");
  });

  // ── Edge cases ───────────────────────────────────────
  console.log("\nEdge Cases:");

  await test("Entry with deleted retro is not readable", async () => {
    const orphanEntry: TestDoc = {
      _id: "entries:orphan" as any,
      _creationTime: Date.now(),
      retroId: "retros:nonexistent" as any,
      category: "start",
      content: "Orphan",
      participantId: "p1",
      createdAt: Date.now(),
    };
    const ctx = ctxFor(userAlice);
    const result = await rules.entries!.read!(ctx, orphanEntry as any);
    assert(result === false, "should deny read for orphan entry");
  });

  await test("Vote with deleted entry is not readable", async () => {
    const orphanVote: TestDoc = {
      _id: "votes:orphan" as any,
      _creationTime: Date.now(),
      entryId: "entries:nonexistent" as any,
      participantId: "p1",
      value: 1,
      createdAt: Date.now(),
    };
    const ctx = ctxFor(userAlice);
    const result = await rules.votes!.read!(ctx, orphanVote as any);
    assert(result === false, "should deny read for orphan vote");
  });

  // ── Summary ──────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

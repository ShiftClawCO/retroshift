-- Subscriptions table for LemonSqueezy integration
-- Stores subscription data synced via webhooks

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- LemonSqueezy identifiers
  lemon_squeezy_id TEXT UNIQUE NOT NULL,           -- subscription id from LS
  lemon_squeezy_customer_id TEXT NOT NULL,         -- customer id from LS
  lemon_squeezy_order_id TEXT,                     -- order id from LS
  lemon_squeezy_product_id TEXT NOT NULL,          -- product id from LS
  lemon_squeezy_variant_id TEXT NOT NULL,          -- variant id from LS
  
  -- Subscription details
  plan TEXT NOT NULL DEFAULT 'pro',                 -- 'pro' for now, expandable later
  status TEXT NOT NULL DEFAULT 'active',            -- active, cancelled, expired, paused, past_due
  
  -- Billing info
  billing_anchor INTEGER,                           -- day of month for billing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation info
  cancelled_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,                 -- when access actually ends after cancellation
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_squeezy_id ON subscriptions(lemon_squeezy_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent)
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
CREATE POLICY "Users can read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Payment links table for personalized client renewal invoices
CREATE TABLE IF NOT EXISTS payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  current_plan_label text,
  available_credit integer NOT NULL DEFAULT 0,       -- NGN
  loyalty_discount_percent integer NOT NULL DEFAULT 0,
  plans jsonb NOT NULL,                              -- PaymentLinkPlan[]
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paid', 'expired')),
  paid_plan_label text,
  paid_amount integer,                               -- NGN
  paystack_reference text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (access via service role only in API routes)
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment links"
  ON payment_links
  USING (true)
  WITH CHECK (true);

-- Seed: Beautyfindsng renewal 2026
INSERT INTO payment_links (
  slug,
  client_name,
  client_email,
  current_plan_label,
  available_credit,
  loyalty_discount_percent,
  plans
) VALUES (
  'beautyfindsng',
  'Beautyfindsng',
  'beautyfinds.ng@gmail.com',
  'Business Premium',
  200000,
  5,
  '[
    {
      "id": "basic_care",
      "name": "Basic Care",
      "is_current": false,
      "original_price": 500000,
      "after_discount": 450000,
      "after_credit": 275000,
      "features": [
        "Standard Hosting Server",
        "1-Year Domain Renewal",
        "Basic Security Protection",
        "Monthly Plugin Updates",
        "Monthly Backups",
        "Limited Product Uploads",
        "Basic Technical Support (48hrs response)"
      ]
    },
    {
      "id": "business_pro",
      "name": "Business Pro",
      "is_current": false,
      "original_price": 700000,
      "after_discount": 630000,
      "after_credit": 465000,
      "features": [
        "High-Performance Hosting",
        "1-Year Domain Renewal + Privacy Protection",
        "Advanced Security Protection",
        "Monthly Plugin Monitoring",
        "Weekly Backups",
        "Unlimited Product Uploads",
        "Priority Support"
      ]
    },
    {
      "id": "business_premium",
      "name": "Business Premium",
      "is_current": true,
      "original_price": 900000,
      "after_discount": 810000,
      "after_credit": 665000,
      "features": [
        "2X Faster High-Performance Server",
        "Full Domain Protection Suite",
        "Daily Plugin Monitoring",
        "Daily Offsite Backups",
        "Real-Time Threat Monitoring",
        "Unlimited Product Uploads & Edits",
        "Up to 3 Campaign Landing Pages Per Year",
        "Speed Optimization & Database Cleanup",
        "Dedicated 1-on-1 Technical Support",
        "Same-Day Emergency Response",
        "Monthly Website Performance Report"
      ]
    },
    {
      "id": "premium_pro",
      "name": "Premium Pro",
      "is_current": false,
      "original_price": 1500000,
      "after_discount": 1350000,
      "after_credit": 1225000,
      "features": [
        "Everything in Business Premium",
        "Paid Premium Pro Plugin Licenses",
        "Advanced Conversion Optimization Tools",
        "Premium SEO Suite Integration",
        "Advanced Analytics & Heatmap Tracking",
        "Email Marketing System Integration",
        "Quarterly Strategy Review Meetings",
        "Dedicated Growth Consultant"
      ]
    }
  ]'::jsonb
);

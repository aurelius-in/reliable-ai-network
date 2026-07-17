export interface Profile {
  id: string;
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  current_tier: "starter" | "growth" | "pro" | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
  created_at: string;
}

export interface Creation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
}

export interface GeneratedAsset {
  id: string;
  user_id: string;
  creation_id: string | null;
  type: string;
  content: unknown;
  created_at: string;
}

export interface IdeaAnalysis {
  score: number;
  score_reasoning: string;
  recommended_paths: {
    name: string;
    description: string;
    effort: "low" | "medium" | "high";
    revenue_potential: "low" | "medium" | "high";
  }[];
  quick_wins: string[];
  big_promise: string;
}

export interface PricingRecommendation {
  recommended_model: "one_time" | "subscription" | "freemium";
  model_reasoning: string;
  price_ranges: {
    model: string;
    label: string;
    low: number;
    high: number;
    sweet_spot: number;
    notes: string;
  }[];
  value_anchors: string[];
  sales_copy: {
    headline: string;
    subheadline: string;
    bullets: string[];
    cta: string;
  };
}

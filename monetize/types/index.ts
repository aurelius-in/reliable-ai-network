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

export interface ProgressLog {
  id: string;
  user_id: string;
  milestone: string;
  completed: boolean;
  date: string;
}

/* ------------------------------------------------------------------ */
/* Starter tools                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Growth tools                                                        */
/* ------------------------------------------------------------------ */

export interface FunnelStage {
  stage: "tripwire" | "core_offer" | "profit_maximizer";
  name: string;
  price: string;
  what_it_is: string;
  headline: string;
  pitch: string;
  bullets: string[];
  cta: string;
  conversion_tip: string;
}

export interface FunnelPlan {
  funnel_name: string;
  strategy_summary: string;
  stages: FunnelStage[];
  next_steps: string[];
}

export interface ContentBundle {
  linkedin_posts: { hook: string; body: string; hashtags: string[] }[];
  x_posts: string[];
  ad_variations: {
    angle: string;
    headline: string;
    primary_text: string;
    cta: string;
  }[];
  marketplace_listing: {
    platform: string;
    title: string;
    description: string;
    tags: string[];
  };
  email_sequence: { subject: string; preview_text: string; body: string }[];
}

/* ------------------------------------------------------------------ */
/* Pro tools                                                           */
/* ------------------------------------------------------------------ */

export type StrategyToolId =
  | "competitors"
  | "pricing_optimization"
  | "roadmap"
  | "ab_tests";

export interface CompetitorAnalysis {
  market_summary: string;
  competitors: {
    name: string;
    description: string;
    pricing: string;
    strength: string;
    weakness: string;
    your_edge: string;
  }[];
  positioning_moves: string[];
}

export interface PricingOptimization {
  diagnosis: string;
  recommended_move: string;
  experiments: {
    name: string;
    change: string;
    expected_impact: string;
    risk: "low" | "medium" | "high";
  }[];
}

export interface RoadmapPlan {
  north_star: string;
  phases: {
    period: string;
    theme: string;
    goals: string[];
    actions: { task: string; why: string }[];
    success_metric: string;
  }[];
}

export interface AbTestPlan {
  tests: {
    name: string;
    hypothesis: string;
    variant_a: string;
    variant_b: string;
    metric: string;
    duration: string;
    difficulty: "easy" | "medium" | "hard";
  }[];
  principles: string[];
}

export interface StrategyResults {
  competitors?: CompetitorAnalysis;
  pricing_optimization?: PricingOptimization;
  roadmap?: RoadmapPlan;
  ab_tests?: AbTestPlan;
}

/** Stored as generated_assets.content with type "dfy_request". */
export interface DfyRequestContent {
  asset_type: string;
  audience: string;
  goal: string;
  tone: string;
  notes: string;
  status: "queued" | "in_progress" | "delivered";
  requested_at: string;
}

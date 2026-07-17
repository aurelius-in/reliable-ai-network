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

/** Stored as generated_assets.content with type "buyer_profiles". */
export interface BuyerPersona {
  name: string;
  emoji: string;
  who: string;
  where_online: string[];
  pain_points: string[];
  desires: string[];
  objections: { objection: string; answer: string }[];
  reachability: "easy" | "medium" | "hard";
  reachability_why: string;
  positioning_line: string;
}

export interface BuyerProfilesResult {
  headline_insight: string;
  personas: BuyerPersona[];
  best_first_target: string;
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

/** Stored as generated_assets.content with type "traffic_plan". */
export interface TrafficChannel {
  name: string;
  emoji: string;
  why_it_fits: string;
  effort: number; // 1-5
  results_potential: number; // 1-5
  time_to_results: string;
  first_move: string;
  post_template: string;
}

export interface TrafficPlan {
  strategy_summary: string;
  channels: TrafficChannel[];
  weekly_plan: { day: string; action: string; channel: string; minutes: number }[];
  golden_rule: string;
}

/** Stored as generated_assets.content with type "launch_plan". */
export interface LaunchDay {
  day: number;
  title: string;
  action: string;
  script?: string;
  script_label?: string;
  time_needed: string;
}

export interface LaunchMilestone {
  day: number;
  target: string;
  if_behind: string;
}

export interface LaunchPlan {
  plan_name: string;
  strategy_summary: string;
  weeks: { theme: string; days: LaunchDay[] }[];
  milestones: LaunchMilestone[];
  contingency: { symptom: string; fix: string }[];
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

/** Stored as generated_assets.content with type "sales_kit". */
export interface SalesKit {
  strategy_note: string;
  opener_messages: { label: string; message: string }[];
  follow_up_sequence: {
    touch: number;
    wait: string;
    channel_note: string;
    message: string;
  }[];
  objection_scripts: { objection: string; response: string }[];
  call_agenda: { step: string; goal: string; say_this: string }[];
  golden_rule: string;
}

/** Stored as generated_assets.content with type "metrics_log". */
export interface MetricsEntry {
  week_label: string;
  visitors: number;
  signups: number;
  sales: number;
  revenue: number;
  logged_at: string;
  demo?: boolean;
}

/** Stored as generated_assets.content with type "metrics_analysis". */
export interface MetricsAnalysis {
  whats_working: { finding: string; evidence: string }[];
  bottleneck: { stage: string; diagnosis: string; why_it_matters: string };
  next_tests: {
    name: string;
    action: string;
    expected_result: string;
    difficulty: "easy" | "medium" | "hard";
  }[];
  encouragement: string;
}

/** Stored as generated_assets.content with type "revenue_streams". */
export interface RevenueStream {
  model: string;
  emoji: string;
  how_it_works: string;
  pros: string[];
  cons: string[];
  effort: "low" | "medium" | "high";
  timeline: string;
  revenue_shape: string;
}

export interface RevenueStreamsPlan {
  strategy_summary: string;
  streams: RevenueStream[];
  build_first: { model: string; reasoning: string; first_step: string };
  stack_later: string;
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

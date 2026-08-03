-- Product URL + scraped website evidence. Run in Supabase SQL editor.



alter table public.creations

  add column if not exists product_url text;



alter table public.creations

  add column if not exists website_context jsonb;



comment on column public.creations.product_url is 'Public product / marketing site URL';

comment on column public.creations.website_context is 'Cached scrape: title, meta, text excerpt for audit prompts';


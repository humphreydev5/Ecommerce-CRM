
-- Initial foundation for the standalone e-commerce CRM.
-- Customer, product, order and payment tables are intentionally
-- deferred to later implementation stages.

create table if not exists public.business_settings (
  id boolean primary key default true check (id = true),
  business_name text,
  currency text not null default 'NGN'
    check (currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'Africa/Lagos',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.business_settings is
  'Single-business configuration for the CRM';

alter table public.business_settings
  enable row level security;

-- No API access policies are created yet.
-- Access will be explicitly granted in a later stage,
-- after authentication and authorization are implemented.

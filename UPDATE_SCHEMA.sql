-- Run this in Supabase SQL Editor to enable Payment History

create table if not exists public.payments (
    id bigserial primary key,
    member_id bigint references public.members(id) on delete cascade,
    amount numeric default 0,
    month_year text not null, -- Format: 'YYYY-MM'
    date timestamp with time zone default now(),
    status text default 'Paid',
    created_at timestamp with time zone default now(),
    unique(member_id, month_year) -- One payment per month per member
);

-- Enable RLS
alter table public.payments enable row level security;

-- Policy
create policy "Enable all access for authenticated users (payments)"
on public.payments for all to authenticated using (true) with check (true);

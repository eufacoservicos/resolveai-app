-- ============================================
-- Migration v12: Make CPF/CNPJ required, add provider_type
-- ============================================

-- Add provider_type column (individual = autônomo/CPF, company = empresa/CNPJ)
alter table public.provider_profiles
  add column provider_type text not null default 'individual'
  check (provider_type in ('individual', 'company'));

-- Set a placeholder for existing providers without CPF
-- so the NOT NULL constraint can be applied.
-- These providers will be prompted to update their document on next login.
update public.provider_profiles
  set cpf = 'PENDING'
  where cpf is null;

-- Make CPF/CNPJ document required
alter table public.provider_profiles
  alter column cpf set not null;

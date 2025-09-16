-- Add unique constraint to cpf_rnm field in franqueados table
ALTER TABLE public.franqueados 
ADD CONSTRAINT franqueados_cpf_rnm_unique UNIQUE (cpf_rnm);
-- Add foreign key constraints to franqueados_unidades table
ALTER TABLE public.franqueados_unidades 
ADD CONSTRAINT fk_franqueados_unidades_franqueado_id 
FOREIGN KEY (franqueado_id) REFERENCES public.franqueados(id) ON DELETE CASCADE;

ALTER TABLE public.franqueados_unidades 
ADD CONSTRAINT fk_franqueados_unidades_unidade_id 
FOREIGN KEY (unidade_id) REFERENCES public.unidades(id) ON DELETE CASCADE;
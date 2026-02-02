-- Adicionar valores ao enum erp_sync_type para compatibilidade
ALTER TYPE erp_sync_type ADD VALUE IF NOT EXISTS 'auto';
ALTER TYPE erp_sync_type ADD VALUE IF NOT EXISTS 'manual';
-- Migração para adicionar campo CPF à tabela patients
-- Execute este SQL no seu banco de dados PostgreSQL

-- Adicionar coluna CPF à tabela patients (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'cpf'
    ) THEN
        ALTER TABLE patients ADD COLUMN cpf TEXT;
    END IF;
END $$;

-- Criar índice para melhorar performance de busca por CPF
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);

-- Comentário sobre a coluna
COMMENT ON COLUMN patients.cpf IS 'CPF do paciente (opcional)'; 
-- Exemplo de migração para adicionar campo CPF à tabela patients
-- Execute este SQL no seu banco de dados PostgreSQL

-- Adicionar coluna CPF à tabela patients
ALTER TABLE patients ADD COLUMN cpf TEXT;

-- Criar índice para melhorar performance de busca por CPF
CREATE INDEX idx_patients_cpf ON patients(cpf);

-- Exemplo de dados de teste (opcional)
-- UPDATE patients SET cpf = '123.456.789-00' WHERE id = 'exemplo-id'; 
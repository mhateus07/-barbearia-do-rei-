-- A Barbearia do Rei passou a se chamar Seu Barbeiro.
-- Só altera o nome se ele ainda for o original; nomes personalizados são preservados.
UPDATE settings SET value = 'Seu Barbeiro', "updatedAt" = CURRENT_TIMESTAMP
WHERE key = 'shop_name' AND value = 'Barbearia do Rei';

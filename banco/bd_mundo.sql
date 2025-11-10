DROP DATABASE IF EXISTS bd_mundo_maria;
CREATE DATABASE IF NOT EXISTS bd_mundo_maria;
USE bd_mundo_maria;

-- tabela paises
CREATE TABLE paises (
  id_pais INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  continente VARCHAR(50) NOT NULL,
  populacao BIGINT,
  idioma VARCHAR(100) NOT NULL
);

-- tabela cidades
CREATE TABLE cidades (
  id_cidade INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  populacao BIGINT,
  id_pais INT NOT NULL,
  FOREIGN KEY (id_pais) REFERENCES paises(id_pais)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- Dados de exemplo
INSERT INTO paises (nome, continente, populacao, idioma) VALUES
('Brasil', 'América do Sul', 214000000, 'Português'),
('Estados Unidos', 'América do Norte', 331000000, 'Inglês'),
('Coreia do Sul', 'Ásia', 52000000, 'Coreano'),
('China', 'Ásia', 1412000000, 'Mandarim'),
('Canadá', 'América do Norte', 39000000, 'Inglês/Francês'),
('Itália', 'Europa', 59000000, 'Italiano'),
('Países Baixos', 'Europa', 17500000, 'Holandês'),
('Chile', 'América do Sul', 19000000, 'Espanhol'),
('Inglaterra', 'Europa', 56000000, 'Inglês'),
('Alemanha', 'Europa', 83000000, 'Alemão'),
('Arábia Saudita', 'Ásia', 36000000, 'Árabe');

INSERT INTO cidades (nome, populacao, id_pais) VALUES
-- brasil
('São Paulo', 12252023, 1),
('Rio de Janeiro', 6748000, 1),
('Belo Horizonte', 2520000, 1),

-- estados unidos
('Nova Iorque', 8419600, 2),
('Los Angeles', 3980400, 2),
('Chicago', 2716000, 2),

-- coreia do sul
('Seul', 9733509, 3),
('Busan', 3448737, 3),
('Incheon', 2957026, 3),

-- china
('Pequim', 21540000, 4),
('Xangai', 24183300, 4),
('Guangzhou', 13500000, 4),

-- canadá
('Toronto', 2732000, 5),
('Vancouver', 675218, 5),
('Montreal', 1780000, 5),

-- itália
('Roma', 2873000, 6),
('Milão', 1366180, 6),
('Nápoles', 962003, 6),

-- países baixos
('Amsterdã', 821752, 7),
('Roterdã', 651446, 7),
('Haia', 544766, 7),

-- chile
('Santiago', 5743719, 8),
('Valparaíso', 295704, 8),
('Concepción', 223574, 8),

-- inglaterra
('Londres', 8982000, 9),
('Manchester', 547627, 9),
('Birmingham', 1141816, 9),

-- alemanha
('Berlim', 3769000, 10),
('Munique', 1471508, 10),
('Hamburgo', 1841179, 10),

-- arábia saudita
('Riad', 7500000, 11),
('Jeddah', 3976000, 11),
('Dammam', 1150000, 11);

ALTER TABLE cidades DROP FOREIGN KEY cidades_ibfk_1;

ALTER TABLE cidades 
ADD CONSTRAINT fk_cidades_paises 
FOREIGN KEY (id_pais) REFERENCES paises(id_pais) 
ON DELETE CASCADE;

drop database bd_mundo_maria;
create database if not exists bd_mundo_maria;
use bd_mundo_maria;

-- tabela paises
create table paises (
  id_pais int auto_increment primary key,
  nome varchar(120) not null,
  continente varchar(50) not null,
  populacao bigint,
  idioma varchar(100) not null
);

-- tabela cidades
create table cidades (
  id_cidade int auto_increment primary key,
  nome varchar(120) not null,
  populacao bigint,
  id_pais int not null,
  foreign key (id_pais) references paises(id_pais)
    on update cascade
    on delete restrict
);

insert into paises (nome, continente, populacao, idioma)
values
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

insert into cidades (nome, populacao, id_pais)
values
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

select * from paises;
select * from cidades; 



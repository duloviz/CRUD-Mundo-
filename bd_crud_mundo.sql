create database if not exists bd_mundo;
use bd_mundo;

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

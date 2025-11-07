# CRUD Mundo - Gerenciamento de Países e Cidades

**Nome do Aluno:** Maria Eduarda de Carvalho
**Nome do Projeto:** CRUD Mundo  
**Tecnologias Utilizadas:** HTML, CSS, JavaScript, PHP, MySQL.  
**Descrição Detalhada:**  
Este projeto implementa um sistema CRUD completo para gerenciamento de dados geográficos de países e cidades. Inclui front-end responsivo com validações em JavaScript, back-end em PHP para operações no banco MySQL, e integrações com APIs externas (REST Countries para dados de países e OpenWeatherMap para clima de cidades). O banco de dados garante integridade referencial (exclusão de países só se não houver cidades associadas). Funcionalidades extras incluem pesquisa dinâmica e estatísticas simples.

## Funcionalidades
- **CRUD Países:** Inserir, listar, editar, excluir países (com campos: ID, nome, continente, população, idioma).
- **CRUD Cidades:** Inserir, listar, editar, excluir cidades associadas a países (com campos: ID, nome, população, ID do país).
- **Integrações de API:** 
  - REST Countries: Enriquecimento de dados de países (bandeira, moeda, capital).
  - OpenWeatherMap: Exibição de clima em tempo real para cidades.
- **Extras:** Pesquisa dinâmica por nome (países/cidades), estatísticas (cidade mais populosa por país, total de cidades por continente).
- **Validações:** Campos obrigatórios, confirmação de exclusão, tratamento de erros.

## Instalação
1. **Pré-requisitos:** Servidor local (ex.: XAMPP) com PHP e MySQL habilitados.
2. **Banco de Dados:** Execute o script SQL fornecido no arquivo `bd_mundo.sql` (ou copie do enunciado) no MySQL para criar o banco `bd_mundo` e inserir dados iniciais.
3. **Configuração:** Edite `backend/config.php` com suas credenciais de banco (host, usuário, senha).
4. **APIs Externas:** 
   - Cadastre-se em [REST Countries](https://restcountries.com/) (gratuito, sem chave).
   - Cadastre-se em [OpenWeatherMap](https://openweathermap.org/api) e obtenha uma chave API gratuita. Adicione a chave em `backend/api.php` (variável `$apiKey`).
5. **Execução:** Coloque a pasta `crud_mundo` na raiz do servidor web (ex.: htdocs no XAMPP). Acesse `http://localhost/crud_mundo/index.html`.

## Uso
- Navegue pelas páginas HTML para gerenciar países e cidades.
- Use a pesquisa dinâmica nas listas.
- Visualize estatísticas na página inicial.
- Para exclusão: Confirme via alerta JavaScript.

## Controle de Versionamento
- Repositório GitHub: [(https://github.com/duloviz/CRUD-Mundo-)]
- Branches: `main` (estável), `dev` (desenvolvimento).
- Commits: Descritivos, ex.: "Add CRUD for countries" ou "Integrate REST Countries API".

## Critérios de Avaliação Atendidos
- Estrutura organizada (front/back-end separados).
- HTML semântico, CSS responsivo, JS para validações.
- PHP eficiente com queries SQL corretas.
- Integridade referencial no DB (RESTRICT on delete).
- Tratamento de erros e boas práticas.

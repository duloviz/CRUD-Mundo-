# 🌍 CRUD Mundo — Gerenciamento de Países e Cidades

**Autora:** Maria Eduarda de Carvalho  
**Tecnologias:** HTML, CSS, JavaScript, PHP, MySQL  
**APIs Externas:** REST Countries + OpenWeatherMap  
**Descrição:**  
O CRUD Mundo é um sistema desenvolvido para gerenciar dados de *países* e *cidades* com interface simples e intuitiva.  
Ele permite cadastrar, listar, editar e excluir países e cidades, além de exibir clima em tempo real e bandeiras.

---

## ✨ Funcionalidades

### 🏳️ Países
- Cadastrar novo país
- Listar países com bandeira
- Editar e excluir país
- Validação para impedir excluir país com cidades vinculadas

### 🏙️ Cidades
- Cadastrar nova cidade vinculada a um país
- Listar cidades com temperatura atual (API OpenWeather)
- Editar e excluir cidade
- Exibição automática do clima

### 📊 Página Inicial (Dashboard)
- Total de cidades cadastradas
- Cidade mais populosa
- País mais populoso
- Número de cidades por continente

---

## 🔗 Integrações com API

| API | Uso | Link |
|-----|-----|------|
| **REST Countries** | Busca bandeira do país | https://restcountries.com/ |
| **OpenWeatherMap** | Mostra clima atual da cidade | https://openweathermap.org/api |

> 💡 Para usar clima, você precisa obter sua chave gratuita no OpenWeatherMap.

No arquivo `js/script.js`, defina sua chave:
```javascript
const API_KEY_WEATHER = "SUA_CHAVE_AQUI";

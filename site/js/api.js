// URLs dos arquivos PHP no backend
const backendPaises = "backend/paises.php";
const backendCidades = "backend/cidades.php";

// Função para LER dados (países ou cidades)
async function apiRead(entity) {
    try {
        console.log(`🔍 Buscando ${entity}...`);
        
        // Escolhe a URL certa
        const url = entity === "paises" ? backendPaises : backendCidades;
        const fullUrl = `${url}?action=read`;
        
        // Faz requisição para o PHP
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        // Converte resposta para JSON
        const data = await response.json();
        console.log(`✅ ${entity} carregados:`, data);
        
        return data;
        
    } catch (error) {
        console.error(`❌ Erro ao carregar ${entity}:`, error);
        return [];
    }
}

// Função para CRIAR novo registro
async function apiCreate(entity, formData) {
    try {
        formData.append("action", "create");
        const url = entity === "paises" ? backendPaises : backendCidades;
        
        // Envia dados via POST
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao criar ${entity}:`, error);
        return { success: false, error: "Erro de conexão" };
    }
}

// Função para ATUALIZAR registro
async function apiUpdate(entity, formData) {
    try {
        formData.append("action", "update");
        const url = entity === "paises" ? backendPaises : backendCidades;
        
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao atualizar ${entity}:`, error);
        return { success: false, error: "Erro de conexão" };
    }
}

// Função para EXCLUIR registro
async function apiDelete(entity, id) {
    try {
        const data = new FormData();
        data.append("action", "delete");
        // Escolhe o campo ID correto
        data.append(entity === "paises" ? "id_pais" : "id_cidade", id);
        
        const url = entity === "paises" ? backendPaises : backendCidades;
        const response = await fetch(url, {
            method: "POST",
            body: data
        });
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao excluir ${entity}:`, error);
        return { success: false, error: "Erro de conexão" };
    }
}

// Funções para mostrar/ocultar elementos na tela
function show(selector) { 
    const element = document.querySelector(selector);
    if (element) {
        element.classList.remove("hidden");
    }
}

function hide(selector) { 
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add("hidden");
    }
}

// Mostra notificações na tela
function showNotification(message, type = 'success') {
    // Remove notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove após 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Busca bandeira de um país
async function fetchBandeira(nomePais) {
    try {
        const response = await fetch(`backend/api_bandeira.php?nome=${encodeURIComponent(nomePais)}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar bandeira:', error);
        return null;
    }
}

// Busca clima de uma cidade
async function fetchClima(cidadeNome) {
    try {
        const response = await fetch(`backend/api.php?cidade=${encodeURIComponent(cidadeNome)}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar clima:', error);
        return null;
    }
}

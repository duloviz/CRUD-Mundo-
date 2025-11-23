// Array para guardar todas as cidades
let allCidades = [];
// Array para cidades filtradas pela busca
let cidadesFiltradas = null;

// Quando a página carrega
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página de cidades carregada");
    loadCidades(); // Carrega cidades do banco
    setupEventListeners(); // Configura eventos
});

// Configura os eventos da página
function setupEventListeners() {
    // Evento de busca - filtra enquanto digita
    const searchInput = document.getElementById('search-cidade');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            filterCidades(term); // Filtra cidades
        });
    }

    // Evento do formulário de adicionar cidade
    const addForm = document.getElementById('form-cidade');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede recarregar página
            handleAddCidade(e); // Processa o formulário
        });
    }

    // Evento do formulário de editar cidade
    const editForm = document.getElementById('form-edicao-cidade');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditCidade(e);
        });
    }
}

// Carrega cidades do backend
async function loadCidades() {
    try {
        console.log("📦 Carregando cidades...");
        const tbody = document.getElementById('tbody-cidades');
        // Mostra mensagem de carregamento
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">🔄 Carregando cidades...</td></tr>';
        
        // Busca cidades da API
        allCidades = await apiRead("cidades");
        console.log("✅ Cidades carregadas:", allCidades.length);
        
        // Mostra cidades na tabela primeiro
        renderCidades(allCidades);
        
        // Busca climas depois (mais demorado)
        loadClimaParaTodasCidades();
        
    } catch (error) {
        console.error("❌ Erro ao carregar cidades:", error);
        const tbody = document.getElementById('tbody-cidades');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #ef4444;">❌ Erro ao carregar cidades</td></tr>';
    }
}

// Busca clima para TODAS as cidades
async function loadClimaParaTodasCidades() {
    console.log("🌤️ Buscando dados do clima para TODAS as cidades...");
    
    // Cria uma cópia das cidades para processar
    const cidadesParaProcessar = [...allCidades];
    
    // Para cada cidade, busca seu clima
    for (let i = 0; i < cidadesParaProcessar.length; i++) {
        let cidade = cidadesParaProcessar[i];
        try {
            console.log(`🌡️ (${i + 1}/${cidadesParaProcessar.length}) Buscando clima: ${cidade.nome}`);
            // Chama API do clima
            const climaData = await fetchClima(cidade.nome);
            
            // Se encontrou clima, guarda nos dados da cidade
            if (climaData && !climaData.error && climaData.weather && climaData.main) {
                cidade.clima = `${climaData.weather[0].description} | ${Math.round(climaData.main.temp)}°C`;
                cidade.clima_detalhes = {
                    temperatura: Math.round(climaData.main.temp),
                    descricao: climaData.weather[0].description,
                    umidade: climaData.main.humidity
                };
                console.log(`✅ Clima encontrado para ${cidade.nome}: ${cidade.clima}`);
            } else {
                cidade.clima = '🌡️ Clima indisponível';
                cidade.clima_detalhes = null;
                console.log(`❌ Clima não disponível para ${cidade.nome}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar clima para ${cidade.nome}:`, error);
            cidade.clima = '❌ Erro ao buscar clima';
            cidade.clima_detalhes = null;
        }
        
        // ATUALIZA A TABELA mantendo o filtro atual
        if (cidadesFiltradas) {
            renderCidades(cidadesFiltradas);
        } else {
            renderCidades(allCidades);
        }
        
        // Pequena pausa entre requisições para não sobrecarregar a API
        if (i < cidadesParaProcessar.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    console.log("✅ Todos os climas foram carregados!");
}

// Mostra cidades na tabela HTML
function renderCidades(cidades) {
    const tbody = document.getElementById('tbody-cidades');
    
    // Se não tem cidades, mostra mensagem
    if (!cidades || cidades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">🏙️ Nenhuma cidade cadastrada</td></tr>';
        return;
    }

    // Constrói HTML da tabela
    let html = '';
    cidades.forEach(cidade => {
        // Define ícone e texto do clima
        let climaIcon = '🌤️';
        let climaText = '⏳ Carregando...';
        
        // Se já tem dados do clima
        if (cidade.clima) {
            climaText = cidade.clima;
            // Escolhe ícone baseado na temperatura
            if (cidade.clima_detalhes) {
                const temp = cidade.clima_detalhes.temperatura;
                if (temp > 30) climaIcon = '🔥';
                else if (temp > 20) climaIcon = '☀️';
                else if (temp > 10) climaIcon = '⛅';
                else if (temp > 0) climaIcon = '🌥️';
                else climaIcon = '❄️';
            } else if (cidade.clima.includes('indisponível')) {
                climaIcon = '❓';
            } else if (cidade.clima.includes('Erro')) {
                climaIcon = '❌';
            }
        }
        
        // Linha da tabela para cada cidade
        html += `
            <tr>
                <td>${cidade.id_cidade}</td>
                <td><strong>${cidade.nome}</strong></td>
                <td>${cidade.populacao ? cidade.populacao.toLocaleString('pt-BR') + ' hab.' : 'N/D'}</td>
                <td>${cidade.pais_nome}</td>
                <td style="cursor: help;" title="${cidade.clima_detalhes ? `Umidade: ${cidade.clima_detalhes.umidade}%` : 'Clima não disponível'}">
                    ${climaIcon} ${climaText}
                </td>
                <td>
                    <button class="btn" onclick="editCidade(${cidade.id_cidade})" style="margin: 2px;">✏️ Editar</button>
                    <button class="btn-secondary" onclick="deleteCidade(${cidade.id_cidade})" style="margin: 2px;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    });
    
    // Coloca o HTML na tabela
    tbody.innerHTML = html;
}

// Filtra cidades pelo termo de busca
function filterCidades(term) {
    if (!term) {
        // Se termo vazio, mostra todas as cidades
        cidadesFiltradas = null;
        renderCidades(allCidades);
        return;
    }
    
    // Filtra cidades que contenham o termo no nome ou no país
    cidadesFiltradas = allCidades.filter(cidade => 
        cidade.nome.toLowerCase().includes(term) ||
        cidade.pais_nome.toLowerCase().includes(term)
    );
    
    // Mostra apenas as cidades filtradas
    renderCidades(cidadesFiltradas);
}

// Função para carregar países no select (dropdown)
async function loadPaisesForSelect(selectId = "#select-pais") {
    try {
        // Busca países do backend
        const paises = await apiRead("paises");
        const select = document.querySelector(selectId);
        if (!select) return;
        
        // Limpa e adiciona opção padrão
        select.innerHTML = `<option value="">Selecione um país</option>`;
        // Adiciona cada país como opção
        paises.forEach(p => {
            select.innerHTML += `<option value="${p.id_pais}">${p.nome}</option>`;
        });
    } catch (error) {
        console.error("❌ Erro ao carregar países para select:", error);
        const select = document.querySelector(selectId);
        if (select) {
            select.innerHTML = `<option value="">Erro ao carregar países</option>`;
        }
    }
}

// Função para abrir o modal de adicionar cidade
async function abrirModalCidade() {
    // Carrega os países no select antes de mostrar o modal
    await loadPaisesForSelect();
    show('#modal-add-cidade'); // Mostra o modal
}

// Processa adição de nova cidade
async function handleAddCidade(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nome = formData.get('nome');
    
    try {
        console.log("➕ Adicionando cidade:", nome);
        // Envia dados para o backend
        const result = await apiCreate("cidades", formData);
        
        if (result.success) {
            showNotification('✅ Cidade adicionada com sucesso!');
            e.target.reset(); // Limpa formulário
            hide('#modal-add-cidade'); // Fecha modal
            await loadCidades(); // Recarrega lista
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao adicionar cidade'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao adicionar cidade', 'error');
    }
}

// Processa edição de cidade
async function handleEditCidade(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nome = formData.get('nome');
    
    try {
        console.log("✏️ Editando cidade:", nome);
        const result = await apiUpdate("cidades", formData);
        
        if (result.success) {
            showNotification('✅ Cidade atualizada com sucesso!');
            hide('#modal-edit-cidade');
            await loadCidades();
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao atualizar cidade'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao atualizar cidade', 'error');
    }
}

// Abre modal de edição com dados da cidade
async function editCidade(id) {
    console.log("📝 Editando cidade ID:", id);
    const cidade = allCidades.find(c => c.id_cidade == id);
    if (!cidade) {
        showNotification('❌ Cidade não encontrada', 'error');
        return;
    }

    // Preenche os campos básicos
    document.getElementById('edit-id-cidade').value = cidade.id_cidade;
    document.getElementById('edit-nome-cidade').value = cidade.nome;
    document.getElementById('edit-populacao-cidade').value = cidade.populacao || '';
    
    // ⚠️ CORREÇÃO: Espera carregar os países ANTES de mostrar o modal
    await loadPaisesForSelect("#edit-select-pais");
    
    // Agora sim seta o valor do país
    document.querySelector("#edit-select-pais").value = cidade.id_pais;

    // Só depois mostra o modal
    show('#modal-edit-cidade');
}

// Exclui uma cidade
async function deleteCidade(id) {
    const cidade = allCidades.find(c => c.id_cidade == id);
    if (!cidade) return;

    // Pede confirmação antes de excluir
    if (!confirm(`Tem certeza que deseja excluir a cidade "${cidade.nome}"?`)) {
        return;
    }

    try {
        console.log("🗑️ Excluindo cidade:", cidade.nome);
        const result = await apiDelete("cidades", id);
        
        if (result.success) {
            showNotification('✅ Cidade excluída com sucesso!');
            await loadCidades(); // Recarrega lista
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao excluir cidade'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao excluir cidade', 'error');
    }
}

// Função para buscar clima de uma cidade
async function fetchClima(cidadeNome) {
    try {
        // Chama a API do clima no backend
        const response = await fetch(`backend/api.php?cidade=${encodeURIComponent(cidadeNome)}`);
        return await response.json();
    } catch (error) {
        console.error('❌ Erro ao buscar clima:', error);
        return null;
    }
}

// Torna funções disponíveis globalmente (para o HTML poder chamar)
window.abrirModalCidade = abrirModalCidade;
window.editCidade = editCidade;
window.deleteCidade = deleteCidade;

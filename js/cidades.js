let allCidades = [];

document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página de cidades carregada");
    loadCidades();
    setupEventListeners();
});

function setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('search-cidade');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            filterCidades(term);
        });
    }

    // Formulário de adicionar
    const addForm = document.getElementById('form-cidade');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddCidade(e);
        });
    }

    // Formulário de editar
    const editForm = document.getElementById('form-edicao-cidade');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditCidade(e);
        });
    }
}

// Carrega as cidades
async function loadCidades() {
    try {
        console.log("📦 Carregando cidades...");
        const tbody = document.getElementById('tbody-cidades');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">🔄 Carregando cidades...</td></tr>';
        
        allCidades = await apiRead("cidades");
        console.log("✅ Cidades carregadas:", allCidades.length);
        
        // Buscar clima para as cidades
        await loadClimaParaCidades();
        
        renderCidades(allCidades);
    } catch (error) {
        console.error("❌ Erro ao carregar cidades:", error);
        const tbody = document.getElementById('tbody-cidades');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #ef4444;">❌ Erro ao carregar cidades</td></tr>';
    }
}

// Busca clima para as cidades
async function loadClimaParaCidades() {
    console.log("🌤️ Buscando dados do clima...");
    
    // Buscar clima apenas para as primeiras 5 cidades para não sobrecarregar
    const cidadesParaBuscar = allCidades.slice(0, 5);
    
    for (let cidade of cidadesParaBuscar) {
        try {
            const climaData = await fetchClima(cidade.nome);
            
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
        
        // Pequena pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Renderiza cidades na tabela
function renderCidades(cidades) {
    const tbody = document.getElementById('tbody-cidades');
    
    if (!cidades || cidades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">🏙️ Nenhuma cidade cadastrada</td></tr>';
        return;
    }

    let html = '';
    cidades.forEach(cidade => {
        // Determinar ícone do clima baseado na temperatura
        let climaIcon = '🌤️';
        if (cidade.clima_detalhes) {
            const temp = cidade.clima_detalhes.temperatura;
            if (temp > 30) climaIcon = '🔥';
            else if (temp > 20) climaIcon = '☀️';
            else if (temp > 10) climaIcon = '⛅';
            else if (temp > 0) climaIcon = '🌥️';
            else climaIcon = '❄️';
        }
        
        html += `
            <tr>
                <td>${cidade.id_cidade}</td>
                <td><strong>${cidade.nome}</strong></td>
                <td>${cidade.populacao ? cidade.populacao.toLocaleString('pt-BR') + ' hab.' : 'N/D'}</td>
                <td>${cidade.pais_nome}</td>
                <td class="clima-info" style="cursor: help;" title="${cidade.clima_detalhes ? `Umidade: ${cidade.clima_detalhes.umidade}%` : 'Clima não disponível'}">
                    ${climaIcon} ${cidade.clima || '🔄 Carregando clima...'}
                </td>
                <td>
                    <button class="btn" onclick="editCidade(${cidade.id_cidade})" style="margin: 2px;">✏️ Editar</button>
                    <button class="btn-secondary" onclick="deleteCidade(${cidade.id_cidade})" style="margin: 2px;">🗑️ Excluir</button>
                    ${cidade.clima_detalhes ? `<button class="btn" onclick="verClimaDetalhado(${cidade.id_cidade})" style="margin: 2px; padding: 6px 12px;">🌡️ Detalhes</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Filtra cidades
function filterCidades(term) {
    if (!term) {
        renderCidades(allCidades);
        return;
    }
    
    const filtered = allCidades.filter(cidade => 
        cidade.nome.toLowerCase().includes(term) ||
        cidade.pais_nome.toLowerCase().includes(term)
    );
    
    renderCidades(filtered);
}

// Carrega países para os selects
async function loadPaisesForSelect(selectId = "#select-pais") {
    try {
        const paises = await apiRead("paises");
        const select = document.querySelector(selectId);
        if (!select) return;
        
        select.innerHTML = `<option value="">Selecione um país</option>`;
        paises.forEach(p => {
            select.innerHTML += `<option value="${p.id_pais}">${p.nome}</option>`;
        });
    } catch (error) {
        console.error("❌ Erro ao carregar países para select:", error);
    }
}

// Adicionar cidade
async function handleAddCidade(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nome = formData.get('nome');
    
    try {
        console.log("➕ Adicionando cidade:", nome);
        const result = await apiCreate("cidades", formData);
        
        if (result.success) {
            showNotification('✅ Cidade adicionada com sucesso!');
            e.target.reset();
            hide('#modal-add-cidade');
            await loadCidades();
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao adicionar cidade'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao adicionar cidade', 'error');
    }
}

// Editar cidade
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

// Abrir modal de edição
async function editCidade(id) {
    console.log("📝 Editando cidade ID:", id);
    const cidade = allCidades.find(c => c.id_cidade == id);
    if (!cidade) {
        showNotification('❌ Cidade não encontrada', 'error');
        return;
    }

    document.getElementById('edit-id-cidade').value = cidade.id_cidade;
    document.getElementById('edit-nome-cidade').value = cidade.nome;
    document.getElementById('edit-populacao-cidade').value = cidade.populacao || '';
    
    // Carrega países no select antes de setar o valor
    await loadPaisesForSelect("#edit-select-pais");
    document.querySelector("#edit-select-pais").value = cidade.id_pais;

    show('#modal-edit-cidade');
}

// Excluir cidade
async function deleteCidade(id) {
    const cidade = allCidades.find(c => c.id_cidade == id);
    if (!cidade) return;

    if (!confirm(`Tem certeza que deseja excluir a cidade "${cidade.nome}"?`)) {
        return;
    }

    try {
        console.log("🗑️ Excluindo cidade:", cidade.nome);
        const result = await apiDelete("cidades", id);
        
        if (result.success) {
            showNotification('✅ Cidade excluída com sucesso!');
            await loadCidades();
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao excluir cidade'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao excluir cidade', 'error');
    }
}

// Ver clima detalhado
async function verClimaDetalhado(id) {
    const cidade = allCidades.find(c => c.id_cidade == id);
    if (!cidade) return;

    try {
        // Buscar clima atualizado
        const climaData = await fetchClima(cidade.nome);
        
        if (climaData && !climaData.error && climaData.weather && climaData.main) {
            const mensagem = `
🌤️ Clima em ${cidade.nome}, ${cidade.pais_nome}:

• Temperatura: ${Math.round(climaData.main.temp)}°C
• Sensação térmica: ${Math.round(climaData.main.feels_like)}°C
• Mínima: ${Math.round(climaData.main.temp_min)}°C
• Máxima: ${Math.round(climaData.main.temp_max)}°C
• Condição: ${climaData.weather[0].description}
• Umidade: ${climaData.main.humidity}%
• Pressão: ${climaData.main.pressure} hPa

⏰ Atualizado agora
            `;
            alert(mensagem);
        } else {
            alert(`❌ Não foi possível obter informações do clima para ${cidade.nome} no momento.`);
        }
    } catch (error) {
        console.error("❌ Erro ao buscar clima:", error);
        alert("❌ Erro ao buscar informações do clima.");
    }
}

// Atualizar climas
async function atualizarClimas() {
    if (!confirm('Deseja atualizar os dados do clima de todas as cidades?\n\nIsso pode levar alguns segundos.')) {
        return;
    }

    try {
        showNotification('🔄 Atualizando dados do clima...', 'info');
        await loadClimaParaCidades();
        renderCidades(allCidades);
        showNotification('✅ Dados do clima atualizados!');
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao atualizar dados do clima', 'error');
    }
}

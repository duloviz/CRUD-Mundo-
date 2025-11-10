
let allPaises = [];

document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página de países carregada");
    loadPaises();
    setupEventListeners();
});

function setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('search-pais');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            filterPaises(term);
        });
    }

    // Formulário de adicionar
    const addForm = document.getElementById('form-pais');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddPais(e);
        });
    }

    // Formulário de editar
    const editForm = document.getElementById('form-edicao-pais');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditPais(e);
        });
    }
}

// Carrega os países
async function loadPaises() {
    try {
        console.log("📦 Carregando países...");
        const tbody = document.getElementById('tbody-paises');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">🔄 Carregando países...</td></tr>';
        
        allPaises = await apiRead("paises");
        console.log("✅ Países carregados:", allPaises.length);
        
        // Buscar bandeiras para os países
        await loadBandeirasParaPaises();
        
        renderPaises(allPaises);
    } catch (error) {
        console.error("❌ Erro ao carregar países:", error);
        const tbody = document.getElementById('tbody-paises');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ef4444;">❌ Erro ao carregar países</td></tr>';
    }
}

// Busca bandeiras 
async function loadBandeirasParaPaises() {
    console.log("🎌 Buscando bandeiras...");
    
    // Buscar bandeiras para todos os países
    for (let pais of allPaises) {
        // Só busca se não tiver bandeira ainda
        if (!pais.bandeira_url) {
            try {
                const bandeiraData = await fetchBandeiraComFallback(pais.nome);
                
                if (bandeiraData && bandeiraData.flag_url) {
                    pais.bandeira_url = bandeiraData.flag_url;
                    console.log(`✅ Bandeira definida para ${pais.nome}`);
                } else {
                    pais.bandeira_url = null;
                    console.log(`❌ Nenhuma bandeira encontrada para ${pais.nome}`);
                }
            } catch (error) {
                console.error(`❌ Erro ao buscar bandeira para ${pais.nome}:`, error);
                pais.bandeira_url = null;
            }
            
            // Pequena pausa entre requisições para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
}

// Função melhorada para buscar bandeiras com fallback
async function fetchBandeiraComFallback(nomePais) {
    try {
        console.log(`🎌 Buscando bandeira para: ${nomePais}`);
        const response = await fetch(`backend/api_bandeira.php?nome=${encodeURIComponent(nomePais)}`);
        const data = await response.json();
        
        if (data.flag_url) {
            console.log(`✅ Bandeira encontrada: ${data.flag_url}`);
            return data;
        } else {
            console.log(`❌ Bandeira não encontrada para: ${nomePais}`);
            
            // Tenta buscar com nome em inglês para alguns países específicos
            const fallbackNames = {
                'Brasil': 'Brazil',
                'Estados Unidos': 'United States', 
                'Coreia do Sul': 'South Korea',
                'Países Baixos': 'Netherlands',
                'Inglaterra': 'England',
                'Arábia Saudita': 'Saudi Arabia',
                'Canadá': 'Canada',
                'Itália': 'Italy',
                'Alemanha': 'Germany',
                'China': 'China',
                'Chile': 'Chile'
            };
            
            if (fallbackNames[nomePais]) {
                console.log(`🔄 Tentando fallback: ${fallbackNames[nomePais]}`);
                const fallbackResponse = await fetch(`backend/api_bandeira.php?nome=${encodeURIComponent(fallbackNames[nomePais])}`);
                const fallbackData = await fallbackResponse.json();
                
                if (fallbackData.flag_url) {
                    console.log(`✅ Bandeira encontrada via fallback: ${fallbackData.flag_url}`);
                    return fallbackData;
                }
            }
            
            return { error: "Bandeira não encontrada" };
        }
    } catch (error) {
        console.error('❌ Erro ao buscar bandeira:', error);
        return { error: "Erro na requisição" };
    }
}

// Renderiza países na tabela
function renderPaises(paises) {
    const tbody = document.getElementById('tbody-paises');
    
    if (!paises || paises.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">🌍 Nenhum país cadastrado</td></tr>';
        return;
    }

    let html = '';
    paises.forEach(pais => {
        html += `
            <tr>
                <td>${pais.id_pais}</td>
                <td>
                    ${pais.bandeira_url ? 
                        `<img src="${pais.bandeira_url}" class="flag-icon" alt="Bandeira do ${pais.nome}" style="width: 30px; height: 20px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.3);">` : 
                        '🏴‍☠️'
                    }
                </td>
                <td><strong>${pais.nome}</strong></td>
                <td>${pais.continente}</td>
                <td>${pais.populacao ? pais.populacao.toLocaleString('pt-BR') + ' hab.' : 'N/D'}</td>
                <td>${pais.idioma}</td>
                <td>
                    <button class="btn" onclick="editPais(${pais.id_pais})" style="margin: 2px;">✏️ Editar</button>
                    <button class="btn-secondary" onclick="deletePais(${pais.id_pais})" style="margin: 2px;">🗑️ Excluir</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Filtra países
function filterPaises(term) {
    if (!term) {
        renderPaises(allPaises);
        return;
    }
    
    const filtered = allPaises.filter(pais => 
        pais.nome.toLowerCase().includes(term) ||
        pais.continente.toLowerCase().includes(term) ||
        pais.idioma.toLowerCase().includes(term)
    );
    
    renderPaises(filtered);
}

// Adicionar país
async function handleAddPais(e) {
    const formData = new FormData(e.target);
    const nome = formData.get('nome');
    
    try {
        console.log("➕ Adicionando país:", nome);
        const result = await apiCreate("paises", formData);
        
        if (result.success) {
            showNotification('✅ País adicionado com sucesso!');
            e.target.reset();
            hide('#modal-add-pais');
            await loadPaises();
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao adicionar país'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao adicionar país', 'error');
    }
}

// Editar país
async function handleEditPais(e) {
    const formData = new FormData(e.target);
    const nome = formData.get('nome');
    
    try {
        console.log("✏️ Editando país:", nome);
        const result = await apiUpdate("paises", formData);
        
        if (result.success) {
            showNotification('✅ País atualizado com sucesso!');
            hide('#modal-edit-pais');
            await loadPaises();
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao atualizar país'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao atualizar país', 'error');
    }
}

// Abrir modal de edição
async function editPais(id) {
    console.log("📝 Editando país ID:", id);
    const pais = allPaises.find(p => p.id_pais == id);
    if (!pais) {
        showNotification('❌ País não encontrado', 'error');
        return;
    }

    document.getElementById('edit-id-pais').value = pais.id_pais;
    document.getElementById('edit-nome-pais').value = pais.nome;
    document.getElementById('edit-continente-pais').value = pais.continente;
    document.getElementById('edit-populacao-pais').value = pais.populacao || '';
    document.getElementById('edit-idioma-pais').value = pais.idioma;

    show('#modal-edit-pais');
}

// Excluir país
async function deletePais(id) {
    const pais = allPaises.find(p => p.id_pais == id);
    if (!pais) return;

    if (!confirm(`Tem certeza que deseja excluir o país "${pais.nome}"?\n\nTodas as cidades associadas também serão excluídas.`)) {
        return;
    }

    try {
        console.log("🗑️ Excluindo país:", pais.nome);
        const result = await apiDelete("paises", id);
        
        if (result.success) {
            showNotification('✅ País excluído com sucesso!');
            await loadPaises();
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao excluir país'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao excluir país', 'error');
    }
}

// Função para forçar atualização de todas as bandeiras
async function forcarAtualizacaoBandeiras() {
    if (!confirm('Isso irá atualizar TODAS as bandeiras dos países.\n\nPode demorar alguns segundos. Continuar?')) {
        return;
    }

    try {
        showNotification('🔄 Atualizando todas as bandeiras...', 'info');
        
        const response = await fetch('backend/atualizar_bandeiras.php');
        const result = await response.json();
        
        console.log('Resultado da atualização:', result);
        
        // Contar sucessos
        const sucessos = result.resultados.filter(r => r.status === 'SUCESSO').length;
        const erros = result.resultados.filter(r => r.status !== 'SUCESSO').length;
        
        showNotification(`✅ ${sucessos} bandeiras atualizadas | ❌ ${erros} erros`);
        
        // Recarrega os países para mostrar as novas bandeiras
        await loadPaises();
        
    } catch (error) {
        console.error('❌ Erro na atualização forçada:', error);
        showNotification('❌ Erro ao atualizar bandeiras', 'error');
    }
}

// Atualizar bandeiras individualmente (função auxiliar)
async function atualizarBandeiraIndividual(idPais) {
    const pais = allPaises.find(p => p.id_pais == idPais);
    if (!pais) return;

    try {
        showNotification(`🔄 Buscando bandeira para ${pais.nome}...`, 'info');
        
        const bandeiraData = await fetchBandeiraComFallback(pais.nome);
        
        if (bandeiraData && bandeiraData.flag_url) {
            pais.bandeira_url = bandeiraData.flag_url;
            renderPaises(allPaises);
            showNotification(`✅ Bandeira atualizada para ${pais.nome}`);
        } else {
            showNotification(`❌ Não foi possível encontrar bandeira para ${pais.nome}`, 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar bandeira individual:', error);
        showNotification('❌ Erro ao atualizar bandeira', 'error');
    }
}

// Adicionar botão de atualização individual na tabela (opcional)
function adicionarBotaoAtualizacaoIndividual() {
    // Esta função pode ser chamada após renderizar a tabela
    // para adicionar botões de atualização individual
    const botoes = document.querySelectorAll('#tbody-paises tr');
    botoes.forEach((linha, index) => {
        if (index > 0) { // Pula o cabeçalho
            const celulaAcoes = linha.querySelector('td:last-child');
            const pais = allPaises[index - 1];
            
            if (celulaAcoes && pais) {
                const botaoAtualizar = document.createElement('button');
                botaoAtualizar.className = 'btn';
                botaoAtualizar.style.background = '#f59e0b';
                botaoAtualizar.style.margin = '2px';
                botaoAtualizar.innerHTML = '🔄 Bandeira';
                botaoAtualizar.onclick = () => atualizarBandeiraIndividual(pais.id_pais);
                
                celulaAcoes.appendChild(botaoAtualizar);
            }
        }
    });
}

// Inicializar botões de atualização individual após renderizar
// Chamar esta função no final de renderPaises():
// adicionarBotaoAtualizacaoIndividual();

// Função para buscar bandeira (mantida para compatibilidade)
async function fetchBandeira(nomePais) {
    try {
        const response = await fetch(`backend/api_bandeira.php?nome=${encodeURIComponent(nomePais)}`);
        const data = await response.json();
        
        if (data.flag_url) {
            return data;
        } else {
            // Tenta fallback para nomes em inglês
            const fallbackNames = {
                'Brasil': 'Brazil',
                'Estados Unidos': 'United States',
                'Coreia do Sul': 'South Korea', 
                'Países Baixos': 'Netherlands',
                'Inglaterra': 'England',
                'Arábia Saudita': 'Saudi Arabia',
                'Canadá': 'Canada',
                'Itália': 'Italy',
                'Alemanha': 'Germany',
                'China': 'China',
                'Chile': 'Chile'
            };
            
            if (fallbackNames[nomePais]) {
                console.log(`🔄 Tentando fallback para: ${fallbackNames[nomePais]}`);
                const fallbackResponse = await fetch(`backend/api_bandeira.php?nome=${encodeURIComponent(fallbackNames[nomePais])}`);
                return await fallbackResponse.json();
            }
            
            return data;
        }
    } catch (error) {
        console.error('Erro ao buscar bandeira:', error);
        return null;
    }
}

// Atualizar todas as bandeiras (função original mantida)
async function atualizarTodasBandeiras() {
    if (!confirm('Deseja atualizar as bandeiras de todos os países?\n\nIsso pode levar alguns segundos.')) {
        return;
    }

    try {
        showNotification('🔄 Atualizando bandeiras...', 'info');
        await loadBandeirasParaPaises();
        renderPaises(allPaises);
        showNotification('✅ Bandeiras atualizadas!');
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao atualizar bandeiras', 'error');
    }
}

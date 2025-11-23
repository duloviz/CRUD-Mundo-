// Array para guardar todos os países
let allPaises = [];

// Quando a página carrega
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página de países carregada");
    loadPaises(); // Carrega países do banco
    setupEventListeners(); // Configura eventos
});

function setupEventListeners() {
    // Evento de busca - filtra enquanto digita
    const searchInput = document.getElementById('search-pais');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            filterPaises(term); // Filtra países
        });
    }

    // Evento do formulário de adicionar país
    const addForm = document.getElementById('form-pais');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede recarregar página
            handleAddPais(e); // Processa o formulário
        });
    }

    // Evento do formulário de editar país
    const editForm = document.getElementById('form-edicao-pais');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditPais(e);
        });
    }
}

// Carrega países do backend
async function loadPaises() {
    try {
        console.log("📦 Carregando países...");
        const tbody = document.getElementById('tbody-paises');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">🔄 Carregando países...</td></tr>';
        
        // Busca países da API
        allPaises = await apiRead("paises");
        console.log("✅ Países carregados:", allPaises.length);
        
        // Mostra países na tabela
        renderPaises(allPaises);
        
        // Busca bandeiras depois (mais demorado)
        loadBandeirasParaPaises();
        
    } catch (error) {
        console.error("❌ Erro ao carregar países:", error);
        const tbody = document.getElementById('tbody-paises');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #ef4444;">❌ Erro ao carregar países</td></tr>';
    }
}

// Busca bandeiras para todos os países
async function loadBandeirasParaPaises() {
    console.log("🎌 Buscando bandeiras para TODOS os países...");
    
    // Para cada país, busca sua bandeira
    for (let i = 0; i < allPaises.length; i++) {
        let pais = allPaises[i];
        try {
            console.log(`🎌 (${i + 1}/${allPaises.length}) Buscando bandeira: ${pais.nome}`);
            const bandeiraData = await fetchBandeira(pais.nome);
            
            // Se encontrou bandeira, guarda no objeto do país
            if (bandeiraData && bandeiraData.flag_url) {
                pais.bandeira_url = bandeiraData.flag_url;
                console.log(`✅ Bandeira encontrada para ${pais.nome}`);
            } else {
                pais.bandeira_url = null;
                console.log(`❌ Bandeira não encontrada para ${pais.nome}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar bandeira para ${pais.nome}:`, error);
            pais.bandeira_url = null;
        }
        
        // Atualiza a tabela com a nova bandeira
        renderPaises(allPaises);
        
        // Pequena pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("✅ Todas as bandeiras foram carregadas!");
}

// Mostra países na tabela HTML
function renderPaises(paises) {
    const tbody = document.getElementById('tbody-paises');
    
    // Se não tem países, mostra mensagem
    if (!paises || paises.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">🌍 Nenhum país cadastrado</td></tr>';
        return;
    }

    // Constrói HTML da tabela
    let html = '';
    paises.forEach(pais => {
        html += `
            <tr>
                <td>${pais.id_pais}</td>
                <td>
                    ${pais.bandeira_url ? 
                        // Se tem bandeira, mostra imagem
                        `<img src="${pais.bandeira_url}" class="flag-icon" alt="Bandeira do ${pais.nome}" style="width: 30px; height: 20px; border-radius: 2px; border: 1px solid #ddd;">` : 
                        '⏳' // Se não, mostra loading
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
    
    // Coloca o HTML na tabela
    tbody.innerHTML = html;
}

// Filtra países pelo termo de busca
function filterPaises(term) {
    if (!term) {
        // Se termo vazio, mostra todos
        renderPaises(allPaises);
        return;
    }
    
    // Filtra países que contenham o termo
    const filtered = allPaises.filter(pais => 
        pais.nome.toLowerCase().includes(term) ||
        pais.continente.toLowerCase().includes(term) ||
        pais.idioma.toLowerCase().includes(term)
    );
    
    // Mostra apenas os filtrados
    renderPaises(filtered);
}

// Abre modal para adicionar país
function abrirModalPais() {
    show('#modal-add-pais');
}

// Processa adição de novo país
async function handleAddPais(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nome = formData.get('nome');
    
    try {
        console.log("➕ Adicionando país:", nome);
        // Envia dados para o backend
        const result = await apiCreate("paises", formData);
        
        if (result.success) {
            showNotification('✅ País adicionado com sucesso!');
            e.target.reset(); // Limpa formulário
            hide('#modal-add-pais'); // Fecha modal
            await loadPaises(); // Recarrega lista
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao adicionar país'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao adicionar país', 'error');
    }
}

// Processa edição de país
async function handleEditPais(e) {
    e.preventDefault();
    
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

// Abre modal de edição com dados do país
async function editPais(id) {
    console.log("📝 Editando país ID:", id);
    // Encontra o país pelo ID
    const pais = allPaises.find(p => p.id_pais == id);
    if (!pais) {
        showNotification('❌ País não encontrado', 'error');
        return;
    }

    // Preenche formulário com dados do país
    document.getElementById('edit-id-pais').value = pais.id_pais;
    document.getElementById('edit-nome-pais').value = pais.nome;
    document.getElementById('edit-continente-pais').value = pais.continente;
    document.getElementById('edit-populacao-pais').value = pais.populacao || '';
    document.getElementById('edit-idioma-pais').value = pais.idioma;

    show('#modal-edit-pais'); // Abre modal
}

// Exclui um país
async function deletePais(id) {
    const pais = allPaises.find(p => p.id_pais == id);
    if (!pais) return;

    // Pede confirmação antes de excluir
    if (!confirm(`Tem certeza que deseja excluir o país "${pais.nome}"?\n\nTodas as cidades associadas também serão excluídas.`)) {
        return;
    }

    try {
        console.log("🗑️ Excluindo país:", pais.nome);
        const result = await apiDelete("paises", id);
        
        if (result.success) {
            showNotification('✅ País excluído com sucesso!');
            await loadPaises(); // Recarrega lista
        } else {
            showNotification('❌ Erro: ' + (result.error || 'Erro ao excluir país'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showNotification('❌ Erro ao excluir país', 'error');
    }
}

// Torna funções disponíveis globalmente
window.abrirModalPais = abrirModalPais;
window.editPais = editPais;
window.deletePais = deletePais;

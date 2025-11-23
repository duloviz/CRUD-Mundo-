// Quando a página inicial carrega
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página inicial carregada");
    loadEstatisticas(); // Carrega dados do dashboard
});

// Carrega estatísticas para o dashboard
async function loadEstatisticas() {
    try {
        console.log("📊 Carregando estatísticas...");
        
        // Busca países e cidades ao mesmo tempo
        const [paises, cidades] = await Promise.all([
            apiRead("paises"),
            apiRead("cidades")
        ]);

        console.log("✅ Dados carregados:", {
            paises: paises.length,
            cidades: cidades.length
        });

        // Atualiza totais na tela
        document.getElementById("total-cidades").textContent = cidades.length.toLocaleString('pt-BR');
        document.getElementById("total-paises").textContent = paises.length.toLocaleString('pt-BR');

        // Encontra cidade mais populosa
        if (cidades.length > 0) {
            const cidadeMaisPop = cidades.reduce((a, b) => {
                const popA = a.populacao || 0;
                const popB = b.populacao || 0;
                return popA > popB ? a : b;
            });
            document.getElementById("cidade-populosa").textContent = 
                `${cidadeMaisPop.nome} (${(cidadeMaisPop.populacao || 0).toLocaleString('pt-BR')} hab.)`;
        }

        // Encontra país mais populoso
        if (paises.length > 0) {
            const paisMaisPop = paises.reduce((a, b) => {
                const popA = a.populacao || 0;
                const popB = b.populacao || 0;
                return popA > popB ? a : b;
            });
            document.getElementById("pais-populoso").textContent = 
                `${paisMaisPop.nome} (${(paisMaisPop.populacao || 0).toLocaleString('pt-BR')} hab.)`;
        }

        // Mostra distribuição por continente
        renderContinentes(paises);

    } catch (error) {
        console.error("❌ Erro ao carregar estatísticas:", error);
        // Mostra erro na tela
        document.getElementById("total-cidades").textContent = "Erro";
        document.getElementById("total-paises").textContent = "Erro";
        document.getElementById("cidade-populosa").textContent = "Erro";
        document.getElementById("pais-populoso").textContent = "Erro";
    }
}

// Cria gráfico de distribuição por continente
function renderContinentes(paises) {
    const container = document.getElementById('chart-continentes');
    if (!container) return;
    
    // Se não tem países, mostra mensagem
    if (!paises || paises.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #a0a0a0;">Nenhum dado disponível</div>';
        return;
    }

    // Conta quantos países por continente
    const continentes = {};
    paises.forEach(p => {
        const continente = p.continente || 'Desconhecido';
        if (!continentes[continente]) continentes[continente] = 0;
        continentes[continente]++;
    });

    // Cria HTML do gráfico
    let html = '';
    for (const [continente, count] of Object.entries(continentes)) {
        // Calcula porcentagem
        const porcentagem = (count / Object.values(continentes).reduce((a, b) => a + b, 0) * 100).toFixed(1);
        html += `
            <div class="continente-item">
                <span class="continente-name">${continente}</span>
                <span class="continente-count">${count} países</span>
                <!-- Barra de progresso -->
                <div style="margin-top: 8px; background: rgba(255,255,255,0.1); border-radius: 10px; height: 6px;">
                    <div style="width: ${porcentagem}%; height: 100%; background: linear-gradient(135deg, #00b2ff, #00d26a); border-radius: 10px;"></div>
                </div>
                <small style="color: #a0a0a0; font-size: 0.8rem;">${porcentagem}%</small>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

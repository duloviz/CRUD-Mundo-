document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página inicial carregada");
    loadEstatisticas();
});

async function loadEstatisticas() {
    try {
        console.log("📊 Carregando estatísticas...");
        
        const [paises, cidades] = await Promise.all([
            apiRead("paises"),
            apiRead("cidades")
        ]);

        console.log("✅ Dados carregados:", {
            paises: paises.length,
            cidades: cidades.length
        });

        // Atualizar estatísticas básicas
        document.getElementById("total-cidades").textContent = cidades.length.toLocaleString('pt-BR');
        document.getElementById("total-paises").textContent = paises.length.toLocaleString('pt-BR');

        // Cidade mais populosa
        if (cidades.length > 0) {
            const cidadeMaisPop = cidades.reduce((a, b) => {
                const popA = a.populacao || 0;
                const popB = b.populacao || 0;
                return popA > popB ? a : b;
            });
            document.getElementById("cidade-populosa").textContent = 
                `${cidadeMaisPop.nome} (${(cidadeMaisPop.populacao || 0).toLocaleString('pt-BR')} hab.)`;
        } else {
            document.getElementById("cidade-populosa").textContent = "-";
        }

        // País mais populoso
        if (paises.length > 0) {
            const paisMaisPop = paises.reduce((a, b) => {
                const popA = a.populacao || 0;
                const popB = b.populacao || 0;
                return popA > popB ? a : b;
            });
            document.getElementById("pais-populoso").textContent = 
                `${paisMaisPop.nome} (${(paisMaisPop.populacao || 0).toLocaleString('pt-BR')} hab.)`;
        } else {
            document.getElementById("pais-populoso").textContent = "-";
        }

        // Distribuição por continente
        renderContinentes(paises);

    } catch (error) {
        console.error("❌ Erro ao carregar estatísticas:", error);
        document.getElementById("total-cidades").textContent = "Erro";
        document.getElementById("total-paises").textContent = "Erro";
        document.getElementById("cidade-populosa").textContent = "Erro";
        document.getElementById("pais-populoso").textContent = "Erro";
        
        const container = document.getElementById('chart-continentes');
        if (container) {
            container.innerHTML = '<div style="text-align: center; color: #ef4444;">Erro ao carregar dados</div>';
        }
    }
}

function renderContinentes(paises) {
    const container = document.getElementById('chart-continentes');
    if (!container) return;
    
    if (!paises || paises.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #a0a0a0;">Nenhum dado disponível</div>';
        return;
    }

    const continentes = {};
    paises.forEach(p => {
        const continente = p.continente || 'Desconhecido';
        if (!continentes[continente]) continentes[continente] = 0;
        continentes[continente]++;
    });

    let html = '';
    for (const [continente, count] of Object.entries(continentes)) {
        const porcentagem = (count / Object.values(continentes).reduce((a, b) => a + b, 0) * 100).toFixed(1);
        html += `
            <div class="continente-item">
                <span class="continente-name">${continente}</span>
                <span class="continente-count">${count} países</span>
                <div style="margin-top: 8px; background: rgba(255,255,255,0.1); border-radius: 10px; height: 6px;">
                    <div style="width: ${porcentagem}%; height: 100%; background: linear-gradient(135deg, #00b2ff, #00d26a); border-radius: 10px;"></div>
                </div>
                <small style="color: #a0a0a0; font-size: 0.8rem;">${porcentagem}%</small>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Adicionar estilos CSS para os continentes
const style = document.createElement('style');
style.textContent = `
    .continentes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }
    
    .continente-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .continente-name {
        display: block;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 5px;
        font-size: 1.1rem;
    }
    
    .continente-count {
        display: block;
        color: #00b2ff;
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 10px;
    }
    
    .loading {
        text-align: center;
        color: #a0a0a0;
        padding: 20px;
    }
`;
document.head.appendChild(style);

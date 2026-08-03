// js/pages/KitnetsPage.js
import { openNovaKitnetModal } from '../components/novaKitnetModal.js';
import { getKitnets } from '../database.js';

export async function renderKitnets() {
      const html = `
    <div id="pagina-kitnets" class="page-container">
      <div class="header-actions">
        <button id="btn-nova-kitnet" class="btn-primary full-width" style="justify-content: center; font-size: 16px; padding: 16px; margin-top: 0;">
          <i class="ph ph-plus-circle"></i> Novo Quarto
        </button>
      </div>

      <div class="filtros" style="margin-top: 16px;">
        <button class="tab-filter active">Todos (<span id="qtd-todos">0</span>)</button>
        <button class="tab-filter">Ocupadas (<span id="qtd-ocupados">0</span>)</button>
        <button class="tab-filter">Vagas (<span id="qtd-vagos">0</span>)</button>
      </div>

      <div id="lista-kitnets-container"></div>
    </div>
  `;



  const setupEvents = () => {
    const btnNovaKitnet = document.getElementById('btn-nova-kitnet');
    
    // Função para desenhar os cards na tela
    const atualizarListaNaTela = () => {
      const bancoDeKitnets = getKitnets();
      const listaContainer = document.getElementById('lista-kitnets-container');

      const ocupadas = bancoDeKitnets.filter(k => k.status === 'ocupado').length;
      const vagas = bancoDeKitnets.filter(k => k.status === 'vago').length;
      const total = bancoDeKitnets.length;



      // Atualiza os números dentro dos botões de filtro
      document.getElementById('qtd-todos').innerText = total;
      document.getElementById('qtd-ocupados').innerText = ocupadas;
      document.getElementById('qtd-vagos').innerText = vagas;


      if (!listaContainer) return;
      listaContainer.innerHTML = '';

      if (total === 0) {
        listaContainer.innerHTML = `
          <div class="empty-state">
            <div class="kitnet-icon" style="margin: 0 auto 20px;">🚪</div>
            <h3>Nenhum quarto cadastrado ainda.</h3>
            <p>Adicione seu primeiro quarto clicando no botão acima.</p>
          </div>
        `;
        return;
      }

      bancoDeKitnets.forEach(kitnet => {
        const valorFormatado = Number(kitnet.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const badgeClass = kitnet.status === 'vago' ? 'badge-status vago' : 'badge-status ocupado';
        
        const badgeContas = kitnet.contasInclusas 
          ? `<span style="font-size:10px; background:#e0e7ff; color:#4338ca; padding:2px 5px; border-radius:4px; margin-left:6px;">Contas Inclusas</span>` 
          : '';

        const cardHTML = `
          <div class="kitnet-card">
            <div class="card-header-top">
              <div class="card-left-info">
                <div class="kitnet-icon-small">🚪</div>
                <div>
                  <h4 class="kitnet-title-small">${kitnet.nome} ${badgeContas}</h4>
                  ${kitnet.endereco ? `<div style="font-size:11px; color:#64748b;">📍 ${kitnet.endereco}</div>` : ''}
                </div>
              </div>
              <div class="${badgeClass}">${kitnet.status === 'vago' ? 'VAGO' : 'OCUPADO'}</div>
            </div>

            <div class="card-body-grid">
              <div>
                <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:600;">Valor (${kitnet.pagamento || 'Pix'})</div>
                <div class="kitnet-price-small">${valorFormatado}</div>
              </div>
              <div class="kitnet-info-details">
                <div>Vencimento</div>
                <div style="font-weight:600; color:#1a202c;">Dia ${kitnet.vencimento}</div>
                ${kitnet.inquilino ? `<div style="color:#059669; font-weight:600; margin-top:2px;">👤 ${kitnet.inquilino}</div>` : ''}
              </div>
            </div>

            <button class="btn-card-action ${kitnet.status === 'ocupado' ? 'ocupado-btn' : ''}">
              ${kitnet.status === 'vago' ? 'Alugar' : 'Ver Inquilino'}
            </button>
          </div>
        `;
        listaContainer.innerHTML += cardHTML;
      });
    };

    // Abre o Modal Wizard passando a função de recarregar a tela no final
    if (btnNovaKitnet) {
      btnNovaKitnet.addEventListener('click', () => {
        openNovaKitnetModal(() => {
          atualizarListaNaTela(); // Recarrega os cards quando o modal fecha
        });
      });
    }

    // Carrega a lista ao abrir a página
    atualizarListaNaTela();
  };

  return { html, setupEvents };
}

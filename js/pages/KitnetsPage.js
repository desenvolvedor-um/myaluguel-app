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
        <button class="tab-filter active" data-filtro="todos">Todos (<span id="qtd-todos">0</span>)</button>
        <button class="tab-filter" data-filtro="ocupadas">Ocupadas (<span id="qtd-ocupados">0</span>)</button>
        <button class="tab-filter" data-filtro="vagas">Vagas (<span id="qtd-vagos">0</span>)</button>
      </div>


      <div id="lista-kitnets-container"></div>
    </div>
  `;



    const setupEvents = () => {
    const btnNovaKitnet = document.getElementById('btn-nova-kitnet');
    let filtroAtual = 'todos'; // Variável que guarda o filtro escolhido

    // Lógica para clicar nos filtros
    const botoesFiltro = document.querySelectorAll('#pagina-kitnets .tab-filter');
    botoesFiltro.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Tira o azul de todos os botões
        botoesFiltro.forEach(b => b.classList.remove('active'));
        // Coloca o azul só no que foi clicado
        const clicado = e.currentTarget;
        clicado.classList.add('active');
        
        // Salva qual foi o filtro clicado e atualiza a tela
        filtroAtual = clicado.getAttribute('data-filtro');
        atualizarListaNaTela();
      });
    });
    
    const atualizarListaNaTela = () => {
      const bancoDeKitnets = getKitnets();
      const listaContainer = document.getElementById('lista-kitnets-container');

      // 1. Calcula os totais (sempre usando o banco inteiro)
      const ocupadas = bancoDeKitnets.filter(k => k.status === 'ocupado').length;
      const vagas = bancoDeKitnets.filter(k => k.status === 'vago').length;
      const total = bancoDeKitnets.length;

      document.getElementById('qtd-todos').innerText = total;
      document.getElementById('qtd-ocupados').innerText = ocupadas;
      document.getElementById('qtd-vagos').innerText = vagas;

      if (!listaContainer) return;
      listaContainer.innerHTML = '';

      // 2. Filtra a lista baseada no botão selecionado
      let kitnetsParaExibir = bancoDeKitnets;
      if (filtroAtual === 'ocupadas') {
        kitnetsParaExibir = bancoDeKitnets.filter(k => k.status === 'ocupado');
      } else if (filtroAtual === 'vagas') {
        kitnetsParaExibir = bancoDeKitnets.filter(k => k.status === 'vago');
      }

      // 3. Verifica se a lista filtrada está vazia
      if (kitnetsParaExibir.length === 0) {
        listaContainer.innerHTML = `
          <div class="empty-state">
            <div class="kitnet-icon" style="margin: 0 auto 20px;">🚪</div>
            <h3>Nenhum quarto ${filtroAtual === 'todos' ? 'cadastrado' : 'encontrado'}.</h3>
          </div>
        `;
        return;
      }

      // 4. Desenha apenas as kitnets filtradas na tela
      kitnetsParaExibir.forEach(kitnet => {
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

    if (btnNovaKitnet) {
      btnNovaKitnet.addEventListener('click', () => {
        openNovaKitnetModal(() => {
          atualizarListaNaTela();
        });
      });
    }

    atualizarListaNaTela();
  };


  return { html, setupEvents };
}

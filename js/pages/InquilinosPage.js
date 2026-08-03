// js/pages/InquilinosPage.js
import { openNovoInquilinoModal } from '../components/novoInquilinoModal.js';
import { getInquilinos, getKitnets } from '../database.js';

export async function renderInquilinos() {
  const html = `
    <div id="pagina-inquilinos" class="page-container">
      <div class="header-actions">
        <button id="btn-novo-inquilino" class="btn-primary full-width" style="justify-content: center; font-size: 16px; padding: 16px; margin-top: 0;">
          <i class="ph ph-user-plus"></i> Adicionar Inquilino
        </button>
      </div>

      <div class="filtros" style="margin-top: 16px;">
        <button class="tab-filter active">Ativos (<span id="qtd-ativos">0</span>)</button>
        <button class="tab-filter">Inativos (<span id="qtd-inativos">0</span>)</button>
        <button class="tab-filter">Todos (<span id="qtd-todos-inq">0</span>)</button>
      </div>

      <div id="lista-inquilinos-container"></div>
    </div>
  `;

  const setupEvents = () => {
    const btnNovoInquilino = document.getElementById('btn-novo-inquilino');
    
    const atualizarListaNaTela = () => {
      const inquilinos = getInquilinos();
      const kitnets = getKitnets();
      const listaContainer = document.getElementById('lista-inquilinos-container');

      // Descobre quem está em uma kitnet ativa
      const inquilinosAtivosIds = kitnets
        .filter(k => k.status === 'ocupado' && k.inquilinoId)
        .map(k => String(k.inquilinoId));

      const qtdAtivos = inquilinosAtivosIds.length;
      const qtdTodos = inquilinos.length;
      const qtdInativos = qtdTodos - qtdAtivos;

      document.getElementById('qtd-ativos').innerText = qtdAtivos;
      document.getElementById('qtd-inativos').innerText = qtdInativos;
      document.getElementById('qtd-todos-inq').innerText = qtdTodos;

      if (!listaContainer) return;
      listaContainer.innerHTML = '';

      if (qtdTodos === 0) {
        listaContainer.innerHTML = `
          <div class="empty-state" style="border: 2px dashed #cbd5e1; border-radius: 24px; padding: 40px 20px;">
            <div class="kitnet-icon" style="margin: 0 auto 20px; background:#e2e8f0; width:80px; height:80px;"><i class="ph ph-users" style="font-size:32px;"></i></div>
            <h3 style="color: #1e3a8a;">Nenhum inquilino</h3>
            <p>Você ainda não possui inquilinos cadastrados em sua base de dados.</p>
          </div>
        `;
        return;
      }

      inquilinos.forEach(inq => {
        const isAtivo = inquilinosAtivosIds.includes(String(inq.id));
        const badgeClass = isAtivo ? 'badge-status ocupado' : 'badge-status vago';
        const statusTexto = isAtivo ? 'ATIVO' : 'INATIVO';
        const inicial = inq.nome.charAt(0).toUpperCase();

                const cardHTML = `
          <div class="kitnet-card" style="padding: 14px;">
            <div class="card-header-top" style="margin-bottom: 12px;">
              <div class="card-left-info">
                <div class="kitnet-icon-small" style="color: #1e3a8a; font-weight: bold; border: 1px solid #e2e8f0; font-size: 16px;">
                  ${inicial}
                </div>
                <div>
                  <h4 class="kitnet-title-small" style="margin-bottom: 2px;">${inq.nome}</h4>
                  <div style="font-size:12px; color:#64748b; display: flex; align-items: center; gap: 4px;">
                    <i class="ph ph-phone"></i> ${inq.telefone}
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                <div class="${badgeClass}">${statusTexto}</div>
                <button style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 0;"><i class="ph ph-dots-three-vertical"></i></button>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #1e3a8a; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; cursor: pointer;">
                <i class="ph ph-phone"></i> Ligar
              </button>
              <button style="flex: 1; padding: 8px; border-radius: 8px; border: none; background: #dcfce7; color: #15803d; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; cursor: pointer;">
                <i class="ph ph-whatsapp-logo"></i> WhatsApp
              </button>
            </div>
          </div>
        `;

        listaContainer.innerHTML += cardHTML;
      });
    };

    if (btnNovoInquilino) {
      btnNovoInquilino.addEventListener('click', () => {
        openNovoInquilinoModal(() => {
          atualizarListaNaTela();
        });
      });
    }

    atualizarListaNaTela();
  };

  return { html, setupEvents };
}

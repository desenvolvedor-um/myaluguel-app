// js/pages/KitnetsPage.js
import { openNovaKitnetModal } from '../components/novaKitnetModal.js';
import { getKitnets, deleteKitnet } from '../database.js';

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
    let filtroAtual = 'todos';

    const botoesFiltro = document.querySelectorAll('#pagina-kitnets .tab-filter');
    botoesFiltro.forEach(btn => {
      btn.addEventListener('click', (e) => {
        botoesFiltro.forEach(b => b.classList.remove('active'));
        const clicado = e.currentTarget;
        clicado.classList.add('active');
        filtroAtual = clicado.getAttribute('data-filtro');
        atualizarListaNaTela();
      });
    });
    
    const atualizarListaNaTela = () => {
      const bancoDeKitnets = getKitnets();
      const listaContainer = document.getElementById('lista-kitnets-container');

      const ocupadas = bancoDeKitnets.filter(k => k.status === 'ocupado').length;
      const vagas = bancoDeKitnets.filter(k => k.status === 'vago').length;
      const total = bancoDeKitnets.length;

      document.getElementById('qtd-todos').innerText = total;
      document.getElementById('qtd-ocupados').innerText = ocupadas;
      document.getElementById('qtd-vagos').innerText = vagas;

      if (!listaContainer) return;
      listaContainer.innerHTML = '';

      let kitnetsParaExibir = bancoDeKitnets;
      if (filtroAtual === 'ocupadas') {
        kitnetsParaExibir = bancoDeKitnets.filter(k => k.status === 'ocupado');
      } else if (filtroAtual === 'vagas') {
        kitnetsParaExibir = bancoDeKitnets.filter(k => k.status === 'vago');
      }

      if (kitnetsParaExibir.length === 0) {
        listaContainer.innerHTML = `
          <div class="empty-state">
            <div class="kitnet-icon" style="margin: 0 auto 20px;">🚪</div>
            <h3>Nenhum quarto ${filtroAtual === 'todos' ? 'cadastrado' : 'encontrado'}.</h3>
          </div>
        `;
        return;
      }

      kitnetsParaExibir.forEach(kitnet => {
        const valorFormatado = Number(kitnet.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const badgeClass = kitnet.status === 'vago' ? 'badge-status vago' : 'badge-status ocupado';
        const badgeContas = kitnet.contasInclusas ? `<span style="font-size:10px; background:#e0e7ff; color:#4338ca; padding:2px 5px; border-radius:4px; margin-left:6px; display:inline-block;">Contas Inclusas</span>` : '';

        const cardHTML = `
          <div class="kitnet-card">
            <div class="card-header-top" style="display: flex; align-items: flex-start; justify-content: space-between;">
              
              <div style="position: relative; margin-right: 12px; margin-top: 4px;">
                <button class="btn-opcoes" style="background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; padding: 0;"><i class="ph ph-dots-three-vertical"></i></button>
                                <div class="dropdown-menu" style="left: 0; right: auto; top: 30px;">
                  <button class="dropdown-item btn-editar-kitnet" data-id="${kitnet.id}"><i class="ph ph-pencil-simple"></i> Editar</button>
                  ${kitnet.status === 'ocupado' ? `
                    <button class="dropdown-item btn-desocupar-kitnet" data-id="${kitnet.id}" data-nome="${kitnet.nome}" data-inq="${kitnet.inquilino}"><i class="ph ph-sign-out"></i> Desocupar</button>
                  ` : ''}
                  <button class="dropdown-item danger btn-excluir-kitnet" data-id="${kitnet.id}" data-nome="${kitnet.nome}" data-status="${kitnet.status}" data-inq="${kitnet.inquilino}"><i class="ph ph-trash"></i> Excluir</button>
                </div>

              </div>

              <div class="card-left-info" style="flex: 1; display: flex; align-items: center; gap: 12px;">
                <div class="kitnet-icon-small">🚪</div>
                <div>
                  <h4 class="kitnet-title-small" style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">${kitnet.nome} ${badgeContas}</h4>
                  ${kitnet.endereco ? `<div style="font-size:11px; color:#64748b;">📍 ${kitnet.endereco}</div>` : ''}
                </div>
              </div>
              
              <div style="margin-top: 4px;">
                <div class="${badgeClass}">${kitnet.status === 'vago' ? 'VAGO' : 'OCUPADO'}</div>
              </div>

            </div>

            <div class="card-body-grid">
              <div>
                <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:600;">Valor (${kitnet.pagamento || 'Pix'})</div>
                <div class="kitnet-price-small">${valorFormatado}</div>
              </div>
              <div class="kitnet-info-details">
                <div>Ciclo</div>
                <div style="font-weight:600; color:#1a202c;">${kitnet.ciclo || 'Mensal'}</div>
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

      aplicarEventosDeCard();
    };

    const aplicarEventosDeCard = () => {
      document.querySelectorAll('.btn-opcoes').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
          btn.nextElementSibling.classList.toggle('show');
        });
      });

      document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
      });

      document.querySelectorAll('.btn-editar-kitnet').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          alert(`Em breve: Abrir modal de edição para a Kitnet ID: ${id}`);
        });
      });

      document.querySelectorAll('.btn-excluir-kitnet').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const nome = e.currentTarget.getAttribute('data-nome');
          const status = e.currentTarget.getAttribute('data-status');
          const inq = e.currentTarget.getAttribute('data-inq');

          let mensagem = `Tem certeza que deseja excluir permanentemente o quarto "${nome}"?`;
          if (status === 'ocupado') {
            mensagem = `⚠️ ATENÇÃO!\n\nO quarto "${nome}" está ocupado por ${inq}.\n\nAo excluir este quarto, o aluguel será cancelado e o inquilino ficará Inativo.\n\nDeseja realmente excluir?`;
          }

          if (window.confirm(mensagem)) {
            deleteKitnet(id);
            atualizarListaNaTela();
          }
        });
      });
            // Ação de Desocupar (Check-out)
      document.querySelectorAll('.btn-desocupar-kitnet').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const nome = e.currentTarget.getAttribute('data-nome');
          const inq = e.currentTarget.getAttribute('data-inq');

          const mensagem = `Tem certeza que deseja DESOCUPAR o quarto "${nome}"?\n\nO contrato com ${inq} será encerrado, mas o histórico de pagamentos continuará salvo no sistema.`;

          if (window.confirm(mensagem)) {
            import('../database.js').then(db => {
              db.encerrarContratoPorKitnet(id);
              atualizarListaNaTela();
            });
          }
        });
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

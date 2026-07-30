export async function renderKitnets() {
  let bancoDeKitnets = JSON.parse(localStorage.getItem('myaluguel_kitnets')) || [];

  const html = `
    <div id="pagina-kitnets" class="page-container">
      <div class="header-actions">
        <button id="btn-nova-kitnet" class="btn-primary">
          + Novo Quarto
        </button>
      </div>

      <div class="resumo-status">
        <span class="dot ocupado"></span> <span id="qtd-ocupados">0</span> ocupados • 
        <span class="dot vago"></span> <span id="qtd-vagos">0</span> vagos
      </div>

      <div class="filtros">
        <button class="tab-filter active">Todos (<span id="qtd-todos">0</span>)</button>
        <button class="tab-filter">Ocupadas</button>
        <button class="tab-filter">Vagas</button>
      </div>

      <!-- Container onde os cards compactos serão injetados -->
      <div id="lista-kitnets-container"></div>
    </div>

    <!-- MODAL WIZARD: NOVA KITNET -->
    <div id="modal-nova-kitnet" class="modal-overlay hidden">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon-header">
            <i class="ph-door">🚪</i>
          </div>
          <h2>Novo Quarto</h2>
          <p>Detalhes do Imóvel</p>
          <button class="btn-close-modal" id="btn-fechar-modal">×</button>
        </div>

        <form id="form-nova-kitnet">
          <div class="input-group">
            <label>Nome do Quarto *</label>
            <input type="text" id="input-nome" placeholder="Ex: Suíte Master, Quarto 01..." required>
          </div>

          <div class="row-inputs">
            <div class="input-group">
              <label>Aluguel ($) *</label>
              <input type="number" id="input-valor" placeholder="0.00" required>
            </div>
            <div class="input-group">
              <label>Vencimento</label>
              <select id="input-vencimento">
                <option value="1">Dia 1</option>
                <option value="5">Dia 5</option>
                <option value="10">Dia 10</option>
                <option value="15">Dia 15</option>
                <option value="20">Dia 20</option>
              </select>
            </div>
          </div>

          <div class="input-group">
            <label>Endereço</label>
            <input type="text" id="input-endereco" placeholder="Digite o endereço...">
          </div>

          <div class="toggle-container">
            <div class="toggle-text">
              <label>Contas Inclusas?</label>
              <span>Água, luz, internet...</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="input-contas">
              <span class="slider"></span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="submit" class="btn-primary full-width">Criar Quarto</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const setupEvents = () => {
    const modal = document.getElementById('modal-nova-kitnet');
    const btnNovaKitnet = document.getElementById('btn-nova-kitnet');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const formKitnet = document.getElementById('form-nova-kitnet');
    const listaContainer = document.getElementById('lista-kitnets-container');

    const atualizarListaNaTela = () => {
      bancoDeKitnets = JSON.parse(localStorage.getItem('myaluguel_kitnets')) || [];

      const ocupadas = bancoDeKitnets.filter(k => k.status === 'ocupado').length;
      const vagas = bancoDeKitnets.filter(k => k.status === 'vago').length;
      const total = bancoDeKitnets.length;

      const elOcupados = document.getElementById('qtd-ocupados');
      const elVagos = document.getElementById('qtd-vagos');
      const elTodos = document.getElementById('qtd-todos');

      if (elOcupados) elOcupados.innerText = ocupadas;
      if (elVagos) elVagos.innerText = vagas;
      if (elTodos) elTodos.innerText = total;

      if (!listaContainer) return;
      listaContainer.innerHTML = '';

      if (total === 0) {
        listaContainer.innerHTML = `
          <div class="empty-state">
            <div class="kitnet-icon" style="margin: 0 auto 20px;">🚪</div>
            <h3>Nenhum quarto cadastrado ainda.</h3>
            <p>Adicione seu primeiro quarto clicando no botão abaixo.</p>
            <button class="btn-primary" id="btn-add-vazio" style="margin-top:20px;">
              Adicionar Quarto
            </button>
          </div>
        `;
        const btnAddVazio = document.getElementById('btn-add-vazio');
        if (btnAddVazio) {
          btnAddVazio.addEventListener('click', () => {
            if (modal) modal.classList.remove('hidden');
          });
        }
        return;
      }

      bancoDeKitnets.forEach(kitnet => {
        const valorFormatado = Number(kitnet.valor || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const badgeClass = kitnet.status === 'vago' ? 'badge-status vago' : 'badge-status ocupado';
        
        const badgeContas = kitnet.contasInclusas 
          ? `<span style="font-size:10px; background:#e0e7ff; color:#4338ca; padding:2px 5px; border-radius:4px; margin-left:6px;">Contas Inclusas</span>` 
          : '';

        const cardHTML = `
          <div class="kitnet-card">
            <!-- Topo: Ícone, Título e Status -->
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

            <!-- Centro: Valor e Vencimento Compactos -->
            <div class="card-body-grid">
              <div>
                <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:600;">Valor Mensal</div>
                <div class="kitnet-price-small">${valorFormatado}</div>
              </div>
              <div class="kitnet-info-details">
                <div>Vencimento</div>
                <div style="font-weight:600; color:#1a202c;">Dia ${kitnet.vencimento}</div>
              </div>
            </div>

            <!-- Botão de Ação -->
            <button class="btn-card-action ${kitnet.status === 'ocupado' ? 'ocupado-btn' : ''}">
              ${kitnet.status === 'vago' ? 'Alugar' : 'Ver Inquilino'}
            </button>
          </div>
        `;
        listaContainer.innerHTML += cardHTML;
      });
    };

    if (btnNovaKitnet && modal) {
      btnNovaKitnet.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    
    if (btnFecharModal && modal && formKitnet) {
      btnFecharModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        formKitnet.reset(); 
      });
    }

    if (formKitnet) {
      formKitnet.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const novaKitnet = {
          id: Date.now(),
          nome: document.getElementById('input-nome').value,
          valor: parseFloat(document.getElementById('input-valor').value),
          vencimento: document.getElementById('input-vencimento').value,
          endereco: document.getElementById('input-endereco').value,
          contasInclusas: document.getElementById('input-contas').checked,
          status: 'ocupado' // Mudado para testar o card ocupado, ou 'vago' se preferir padrão
        };

        bancoDeKitnets.push(novaKitnet);
        localStorage.setItem('myaluguel_kitnets', JSON.stringify(bancoDeKitnets));
        
        if (modal) modal.classList.add('hidden');
        formKitnet.reset();
        atualizarListaNaTela(); 
      });
    }

    atualizarListaNaTela();
  };

  return { html, setupEvents };
}

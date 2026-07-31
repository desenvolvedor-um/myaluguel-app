export async function renderKitnets() {
  let bancoDeKitnets = JSON.parse(localStorage.getItem('myaluguel_kitnets')) || [];
  let bancoDeInquilinos = JSON.parse(localStorage.getItem('myaluguel_inquilinos')) || [];

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

      <div id="lista-kitnets-container"></div>
    </div>

    <!-- MODAL WIZARD: NOVO QUARTO -->
    <div id="modal-nova-kitnet" class="modal-overlay hidden">
      <div class="modal-content">
        <div class="modal-header">
          <button class="btn-close-modal" id="btn-fechar-modal">×</button>
          <div class="modal-icon-header">🚪</div>
          <h2 id="modal-title-step">Novo Quarto</h2>
          <p id="modal-subtitle-step">Etapa 1 de 2</p>
        </div>

        <form id="form-nova-kitnet">
          
          <!-- ETAPA 1 -->
          <div id="etapa-1" class="modal-step">
            <div class="input-group">
              <label>Nome do Quarto *</label>
              <input type="text" id="input-nome" placeholder="Ex: Suíte Master, Quarto 01...">
            </div>

            <div class="row-inputs">
              <div class="input-group">
                <label>Aluguel ($) *</label>
                <input type="number" id="input-valor" placeholder="0.00" step="0.01">
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

            <button type="button" id="btn-proximo" class="btn-primary full-width">
              Próximo →
            </button>
          </div>

          <!-- ETAPA 2 (Inicia escondida com a classe hidden) -->
          <div id="etapa-2" class="modal-step hidden">
            <div class="input-group">
              <label>Selecione o Inquilino</label>
              <select id="input-inquilino">
                <option value="">Nenhum (Deixar Vago)</option>
              </select>
            </div>

            <div id="info-status-quarto" style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; color: #64748b; margin-bottom: 16px; border: 1px solid #f1f5f9;">
              ℹ️ O quarto será criado como <b>VAGO</b> e ficará disponível para locação.
            </div>

            <div class="input-group">
              <label>Método de Recebimento</label>
              <select id="input-pagamento">
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>

            <div class="row-inputs" style="margin-top: 20px;">
              <button type="button" id="btn-voltar" class="tab-filter" style="flex: 1; padding: 10px; border-radius: 8px; text-align: center;">Voltar</button>
              <button type="submit" class="btn-primary" style="flex: 2; justify-content: center; background-color: #059669; border-radius: 8px;">✓ Criar Quarto</button>
            </div>
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

    const etapa1 = document.getElementById('etapa-1');
    const etapa2 = document.getElementById('etapa-2');
    const btnProximo = document.getElementById('btn-proximo');
    const btnVoltar = document.getElementById('btn-voltar');
    
    const modalTitle = document.getElementById('modal-title-step');
    const modalSubtitle = document.getElementById('modal-subtitle-step');
    const selectInquilino = document.getElementById('input-inquilino');
    const infoStatusQuarto = document.getElementById('info-status-quarto');

    const carregarInquilinosNoSelect = () => {
      bancoDeInquilinos = JSON.parse(localStorage.getItem('myaluguel_inquilinos')) || [];
      selectInquilino.innerHTML = `<option value="">Nenhum (Deixar Vago)</option>`;
      
      bancoDeInquilinos.forEach(inq => {
        selectInquilino.innerHTML += `<option value="${inq.nome}">${inq.nome}</option>`;
      });
    };

    selectInquilino.addEventListener('change', () => {
      if (selectInquilino.value) {
        infoStatusQuarto.innerHTML = `✅ O quarto será criado como <b>OCUPADO</b> por <b>${selectInquilino.value}</b>.`;
      } else {
        infoStatusQuarto.innerHTML = `ℹ️ O quarto será criado como <b>VAGO</b> e ficará disponível para locação.`;
      }
    });

    const atualizarListaNaTela = () => {
      bancoDeKitnets = JSON.parse(localStorage.getItem('myaluguel_kitnets')) || [];

      const ocupadas = bancoDeKitnets.filter(k => k.status === 'ocupado').length;
      const vagas = bancoDeKitnets.filter(k => k.status === 'vago').length;
      const total = bancoDeKitnets.length;

      document.getElementById('qtd-ocupados').innerText = ocupadas;
      document.getElementById('qtd-vagos').innerText = vagas;
      document.getElementById('qtd-todos').innerText = total;

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
            if (modal) {
              modal.classList.remove('hidden');
              resetarModal();
            }
          });
        }
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

    const resetarModal = () => {
      etapa1.classList.remove('hidden');
      etapa2.classList.add('hidden');
      modalTitle.innerText = "Novo Quarto";
      modalSubtitle.innerText = "Etapa 1 de 2";
      formKitnet.reset();
      carregarInquilinosNoSelect();
    };

    if (btnNovaKitnet && modal) {
      btnNovaKitnet.addEventListener('click', () => {
        modal.classList.remove('hidden');
        resetarModal();
      });
    }
    
    if (btnFecharModal && modal) {
      btnFecharModal.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    // Avançar para Etapa 2
    btnProximo.addEventListener('click', (e) => {
      e.preventDefault();
      const nome = document.getElementById('input-nome').value;
      const valor = document.getElementById('input-valor').value;

      if (!nome || !valor) {
        alert('Por favor, preencha o Nome do Quarto e o Valor do Aluguel.');
        return;
      }

      etapa1.classList.add('hidden');
      etapa2.classList.remove('hidden');
      modalTitle.innerText = "Vincular Inquilino";
      modalSubtitle.innerText = "Etapa 2 de 2";
    });

    // Voltar para Etapa 1
    btnVoltar.addEventListener('click', (e) => {
      e.preventDefault();
      etapa2.classList.add('hidden');
      etapa1.classList.remove('hidden');
      modalTitle.innerText = "Novo Quarto";
      modalSubtitle.innerText = "Etapa 1 de 2";
    });

    // Finalizar cadastro
    formKitnet.addEventListener('submit', (e) => {
      e.preventDefault(); 

      const inquilinoSelecionado = selectInquilino.value;

      const novaKitnet = {
        id: Date.now(),
        nome: document.getElementById('input-nome').value,
        valor: parseFloat(document.getElementById('input-valor').value),
        vencimento: document.getElementById('input-vencimento').value,
        endereco: document.getElementById('input-endereco').value,
        contasInclusas: document.getElementById('input-contas').checked,
        inquilino: inquilinoSelecionado || null,
        pagamento: document.getElementById('input-pagamento').value,
        status: inquilinoSelecionado ? 'ocupado' : 'vago' 
      };

      bancoDeKitnets.push(novaKitnet);
      localStorage.setItem('myaluguel_kitnets', JSON.stringify(bancoDeKitnets));
      
      if (modal) modal.classList.add('hidden');
      formKitnet.reset();
      atualizarListaNaTela(); 
    });

    atualizarListaNaTela();
  };

  return { html, setupEvents };
}

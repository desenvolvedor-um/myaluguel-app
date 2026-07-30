// js/components/homeCards.js

export function renderWelcomeCard(userName) {
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const today = new Date().toLocaleDateString('pt-BR', dateOptions);

  return `
    <div class="card">
      <div class="welcome-header" style="margin-bottom: 0;">
        <h2 style="margin-bottom: 0;">Olá, ${userName}!</h2>
        <span class="date-text">${today}</span>
      </div>
    </div>
  `;
}



// NOVO COMPONENTE: Radar de Cobrança
export function renderRadarCard() {
  // No futuro, isso virá do seu banco de dados (Firebase/Supabase). 
  // Por enquanto, criamos uma lista (array) simulando os inquilinos.
  const avisos = [
    { nome: 'Pedro', letra: 'P', vencimento: '29', dias: 'em 3 dias' },
    { nome: 'Maria', letra: 'M', vencimento: '27', dias: 'em 1 dias' }
  ];

  // O .map() percorre a lista de avisos e cria um HTML para cada um automaticamente
  const avisosHTML = avisos.map(aviso => `
    <div class="radar-item">
      <div class="radar-item-left">
        <div class="radar-avatar">${aviso.letra}</div>
        <div class="radar-info">
          <strong>${aviso.nome}</strong>
          <span>Vence dia ${aviso.vencimento}</span>
        </div>
      </div>
      <div class="radar-badge">${aviso.dias}</div>
    </div>
  `).join('');

  return `
    <div class="card">
      <div class="radar-header">
        <div class="icon-bell-light"><i class="ph ph-bell"></i></div>
        <div>
          <h3 class="radar-title">Radar de Cobrança</h3>
          <span class="radar-subtitle">Atenção Prioritária</span>
        </div>
      </div>
      <div class="radar-list">
        ${avisosHTML}
      </div>
    </div>
  `;
}

// Componente de Ações Rápidas (Mantido igualzinho)
export function renderQuickActions() {
  return `
    <div class="card">
      <div class="card-header-icon">
        <div class="icon-circle"><i class="ph ph-lightning"></i></div>
        <div>
          <h3>Ações Rápidas</h3>
          <span>Tudo ao alcance de um clique</span>
        </div>
      </div>

      <div class="action-list">
        <!-- Adicionamos o ID 'btn-novo-aluguel' -->
        <button class="action-item bg-blue-light" id="btn-novo-aluguel">
          <div class="action-item-left">
            <i class="ph ph-sparkle"></i>
            <div>
              <strong>Novo Aluguel</strong>
              <span>Guiado passo a passo</span>
            </div>
          </div>
          <i class="ph ph-arrow-right"></i>
        </button>

        <!-- Adicionamos o ID 'btn-registrar-pagamento' -->
        <button class="action-item bg-green-light" id="btn-registrar-pagamento">
          <div class="action-item-left">
            <i class="ph ph-money"></i>
            <div>
              <strong>Registrar Pagamento</strong>
              <span>Marcar como pago</span>
            </div>
          </div>
          <i class="ph ph-arrow-right"></i>
        </button>

        <!-- Adicionamos o ID 'btn-encerrar-contrato' -->
        <button class="action-item bg-red-light" id="btn-encerrar-contrato">
          <div class="action-item-left">
            <i class="ph ph-sign-out"></i>
            <div>
              <strong>Encerrar Contrato</strong>
              <span>Rescisão guiada</span>
            </div>
          </div>
          <i class="ph ph-arrow-right"></i>
        </button>
      </div>
    </div>
  `;
}
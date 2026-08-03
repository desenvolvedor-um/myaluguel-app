// js/components/homeCards.js
import { getKitnets } from '../database.js';


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



// NOVO COMPONENTE: Radar de Cobrança (Dinâmico)
export function renderRadarCard() {
  // Puxa as kitnets ocupadas do banco
  const kitnets = getKitnets().filter(k => k.status === 'ocupado');
  
  // Pega o dia de hoje (ex: se hoje for 15 de Agosto, retorna 15)
  const hoje = new Date().getDate(); 
  const avisos = [];

  kitnets.forEach(k => {
    const vencimento = Number(k.vencimento);
    let diff = vencimento - hoje;
    
    // Ajuste matemático para a virada do mês (ex: hoje é dia 29, vence dia 5)
    if (diff < -15) diff += 30; 
    if (diff > 15) diff -= 30;
    
    // Mostra no radar se vencer em até 5 dias ou estiver atrasado até 5 dias
    if (diff >= -5 && diff <= 5) {
      let diasTexto = '';
      let cor = '';
      
      if (diff < 0) {
        diasTexto = `Atrasado ${Math.abs(diff)} dia(s)`;
        cor = '#ef4444'; // Vermelho
      } else if (diff === 0) {
        diasTexto = 'Vence hoje';
        cor = '#f59e0b'; // Laranja forte
      } else {
        diasTexto = `em ${diff} dia(s)`;
        cor = '#d97706'; // Amarelo/Laranja
      }
      
      avisos.push({
        nome: k.inquilino,
        letra: k.inquilino ? k.inquilino.charAt(0).toUpperCase() : '?',
        vencimento: k.vencimento,
        dias: diasTexto,
        cor: cor
      });
    }
  });

  let conteudoHTML = '';

  if (avisos.length === 0) {
    // TELA DE SUCESSO (Tudo em dia!) - Igual à sua imagem
    conteudoHTML = `
      <div style="text-align: center; padding: 24px 0;">
        <div style="width: 52px; height: 52px; border-radius: 50%; border: 4px solid #10b981; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; font-weight: bold;">
          <i class="ph ph-check"></i>
        </div>
        <h4 style="color: #64748b; font-size: 17px; font-weight: 600; margin: 0;">Tudo em dia por aqui!</h4>
      </div>
    `;
  } else {
    // LISTA DE AVISOS DINÂMICA
    conteudoHTML = avisos.map(aviso => `
      <div class="radar-item" style="background: ${aviso.cor === '#ef4444' ? '#fef2f2' : '#fffbeb'}; border-left: 4px solid ${aviso.cor}; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div class="radar-item-left" style="display: flex; gap: 12px; align-items: center;">
          <div class="radar-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: white; color: ${aviso.cor}; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">${aviso.letra}</div>
          <div class="radar-info">
            <strong style="display: block; color: #1e293b; font-size: 15px; margin-bottom: 2px;">${aviso.nome}</strong>
            <span style="font-size: 12px; color: #64748b;">Vence dia ${aviso.vencimento}</span>
          </div>
        </div>
        <div class="radar-badge" style="background: white; color: ${aviso.cor}; font-size: 11px; font-weight: bold; padding: 6px 10px; border-radius: 20px; border: 1px solid ${aviso.cor}40;">${aviso.dias}</div>
      </div>
    `).join('');
  }

  return `
    <div class="card">
      <div class="radar-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div class="icon-bell-light" style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #e11d48; background: #ffe4e6;"><i class="ph ph-bell"></i></div>
        <div>
          <h3 class="radar-title" style="font-size: 20px; color: #1e3a8a; margin-bottom: 2px;">Radar de Cobrança</h3>
          <span class="radar-subtitle" style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">Atenção Prioritária</span>
        </div>
      </div>
      <div class="radar-list">
        ${conteudoHTML}
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
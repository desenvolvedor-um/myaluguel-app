// js/pages/home.js
import { renderWelcomeCard, renderRadarCard, renderQuickActions } from '../components/homeCards.js';

export async function renderHome(onNavigate) {
  const nomeUsuario = "Paulo";

  const html = `
    <div class="page-container">
      ${renderWelcomeCard(nomeUsuario)}
      ${renderRadarCard()} 
      ${renderQuickActions()}
    </div>
  `;

  const setupEvents = () => {
    // Escutando os botões de Ações Rápidas e preparando o terreno para os Modais!
    
    document.getElementById('btn-novo-aluguel')?.addEventListener('click', () => {
      // No futuro, chamaremos algo como: openModal('novo-aluguel')
      alert("🚀 Em breve: Abrirá o Modal Multi-step de NOVO ALUGUEL");
    });

    document.getElementById('btn-registrar-pagamento')?.addEventListener('click', () => {
      // No futuro, chamaremos algo como: openModal('registrar-pagamento')
      alert("💵 Em breve: Abrirá o Modal Multi-step de REGISTRAR PAGAMENTO");
    });

    document.getElementById('btn-encerrar-contrato')?.addEventListener('click', () => {
      // No futuro, chamaremos algo como: openModal('encerrar-contrato')
      alert("🚪 Em breve: Abrirá o Modal Multi-step de ENCERRAR CONTRATO");
    });
  };

  return { html, setupEvents };
}

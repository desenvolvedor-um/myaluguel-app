// js/pages/home.js
import { renderWelcomeCard, renderRadarCard, renderQuickActions } from '../components/homeCards.js';
import { openNovoAluguelModal } from '../components/novoAluguelModal.js';
import { openEncerrarContratoModal } from '../components/encerrarContratoModal.js'; 



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
    document.getElementById('btn-novo-aluguel')?.addEventListener('click', () => {
      openNovoAluguelModal(() => {
        // Recarrega a tela Home assim que o aluguel for finalizado
        if (typeof onNavigate === 'function') {
          onNavigate('inicio');
        }
      });
    });

    document.getElementById('btn-registrar-pagamento')?.addEventListener('click', () => {
      alert("💵 Em breve: Abrirá o Modal Multi-step de REGISTRAR PAGAMENTO");
    });

    document.getElementById('btn-encerrar-contrato')?.addEventListener('click', () => {
      openEncerrarContratoModal(() => {
        // Quando encerrar o contrato, recarrega a página inicio para atualizar os dados
        if (typeof onNavigate === 'function') {
          onNavigate('inicio');
        }
      });
    });
  };

  return { html, setupEvents };
}

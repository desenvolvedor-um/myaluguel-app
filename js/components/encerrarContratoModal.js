// js/components/encerrarContratoModal.js
import { ModalWizard } from './ModalWizard.js';
import { getKitnets, updateKitnet } from '../database.js';

let checkoutData = {};

export function openEncerrarContratoModal(onSuccessCallback) {
  // Pega a data de hoje formatada (AAAA-MM-DD) para o input
  const hoje = new Date().toISOString().split('T')[0];

  // Reinicia os dados a cada abertura
  checkoutData = {
    kitnetId: '',
    kitnetNome: '',
    inquilinoNome: '',
    dataSaida: hoje,
    motivo: 'Fim de Contrato',
    obs: '',
    caucaoAcao: 'devolver', // devolver, descontar, reter
  };

  new ModalWizard({
    id: 'modal-encerrar-contrato-wizard',
    title: 'Encerrar Contrato (Check-out)',
    icon: 'ph-sign-out',
    finishText: 'Concluir',
    steps: [
      getPasso1Selecionar(),
      getPasso2Datas(),
      getPasso3Financeiro(),
      getPasso4Caucao(),
      getPasso5Confirmar(),
      getPasso6Sucesso(onSuccessCallback) // Passo final de sucesso
    ],
    onFinish: () => {
      if (typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
    }
  });
}

function getPasso1Selecionar() {
  return {
    subtitle: 'Passo 1 de 5: Selecionar',
    contentHtml: () => {
      // Filtra apenas as kitnets que estão OCUPADAS
      const kitnetsOcupadas = getKitnets().filter(k => k.status === 'ocupado');

      if (kitnetsOcupadas.length === 0) {
        return `
          <div class="step-container active" style="text-align: center; padding: 20px;">
            <div class="step-icon-center" style="background:#f1f5f9; color:#64748b;"><i class="ph ph-info"></i></div>
            <h3 style="margin-bottom: 8px;">Nenhum contrato ativo</h3>
            <p style="color: var(--text-muted); font-size: 14px;">Todos os seus quartos já estão vagos no momento.</p>
          </div>
        `;
      }

      return `
        <div class="step-container active">
          <div class="input-group">
            <label>Selecione a Propriedade</label>
            <select id="checkout-kitnet">
              <option value="">Escolha um quarto ocupado...</option>
              ${kitnetsOcupadas.map(k => `<option value="${k.id}" data-nome="${k.nome}" data-inq="${k.inquilino}">${k.nome} - ${k.inquilino}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
    },
    onValidate: () => {
      const select = document.getElementById('checkout-kitnet');
      if (!select || !select.value) {
        alert('Por favor, selecione um quarto ocupado para encerrar o contrato.');
        return false;
      }
      
      checkoutData.kitnetId = select.value;
      // Pegamos o nome da kitnet e do inquilino da opção selecionada para usar no resumo
      const opcaoSelecionada = select.options[select.selectedIndex];
      checkoutData.kitnetNome = opcaoSelecionada.getAttribute('data-nome');
      checkoutData.inquilinoNome = opcaoSelecionada.getAttribute('data-inq');
      
      return true;
    }
  };
}

function getPasso2Datas() {
  return {
    subtitle: 'Passo 2 de 5: Datas',
    contentHtml: () => `
      <div class="step-container active">
        <div class="row-inputs">
          <div class="input-group">
            <label>Data de Saída</label>
            <input type="date" id="checkout-data" value="${checkoutData.dataSaida}">
          </div>
          <div class="input-group">
            <label>Motivo</label>
            <select id="checkout-motivo">
              <option value="Fim de Contrato" ${checkoutData.motivo === 'Fim de Contrato' ? 'selected' : ''}>Fim de Contrato</option>
              <option value="Acordo Mútuo" ${checkoutData.motivo === 'Acordo Mútuo' ? 'selected' : ''}>Acordo Mútuo</option>
              <option value="Despejo / Quebra" ${checkoutData.motivo === 'Despejo / Quebra' ? 'selected' : ''}>Despejo / Quebra</option>
              <option value="Abandono" ${checkoutData.motivo === 'Abandono' ? 'selected' : ''}>Abandono</option>
            </select>
          </div>
        </div>
        <div class="input-group">
          <label>Observações</label>
          <input type="text" id="checkout-obs" placeholder="Detalhes adicionais..." value="${checkoutData.obs}">
        </div>
      </div>
    `,
    onValidate: () => {
      checkoutData.dataSaida = document.getElementById('checkout-data').value;
      checkoutData.motivo = document.getElementById('checkout-motivo').value;
      checkoutData.obs = document.getElementById('checkout-obs').value;
      return true;
    }
  };
}

function getPasso3Financeiro() {
  return {
    subtitle: 'Passo 3 de 5: Financeiro',
    contentHtml: () => `
      <div class="step-container active" style="text-align: center; padding: 20px 0;">
        <div class="step-icon-center" style="background:#dcfce7; color:#15803d; width: 64px; height: 64px; font-size: 32px;"><i class="ph ph-check"></i></div>
        <h2 style="color: #1e293b; margin-bottom: 8px;">Tudo em dia!</h2>
        <p style="color: #64748b; font-size: 15px;">Não há pagamentos pendentes registrados.</p>
      </div>
    `,
    onValidate: () => true
  };
}

function getPasso4Caucao() {
  return {
    subtitle: 'Passo 4 de 5: Caução',
    contentHtml: () => `
      <div class="step-container active">
        <div class="summary-card" style="border: none; background: #f8fafc; margin-bottom: 24px;">
          <div style="display:flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 13px; color: #1e3a8a; font-weight: 600;">Depósito Original</span>
              <div style="font-size: 24px; font-weight: bold; color: #1e3a8a;">R$ 0,00</div>
            </div>
            <i class="ph ph-piggy-bank" style="font-size: 32px; color: #cbd5e1;"></i>
          </div>
        </div>

        <label style="font-size: 13px; font-weight: 600; color: #1e293b; display: block; margin-bottom: 12px;">Ação</label>
        
        <div class="caucao-options" style="display: flex; flex-direction: column; gap: 12px;">
          <button type="button" class="caucao-btn active" data-acao="devolver" style="padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: #10b981; color: white; font-weight: bold; font-size: 15px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <i class="ph ph-smiley" style="font-size: 24px;"></i> Devolver Tudo
          </button>
          <button type="button" class="caucao-btn" data-acao="descontar" style="padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; color: #1e293b; font-weight: bold; font-size: 15px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <i class="ph ph-scissors" style="font-size: 24px;"></i> Descontar
          </button>
          <button type="button" class="caucao-btn" data-acao="reter" style="padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; color: #1e293b; font-weight: bold; font-size: 15px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <i class="ph ph-prohibit" style="font-size: 24px;"></i> Reter Tudo
          </button>
        </div>
      </div>
    `,
    onRender: () => {
      const botoes = document.querySelectorAll('.caucao-btn');
      botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
          // Remove active de todos e reseta cores
          botoes.forEach(b => {
            b.classList.remove('active');
            b.style.background = 'white';
            b.style.color = '#1e293b';
          });
          
          // Adiciona active no clicado e pinta de verde
          const clicado = e.currentTarget;
          clicado.classList.add('active');
          clicado.style.background = '#10b981';
          clicado.style.color = 'white';
          
          checkoutData.caucaoAcao = clicado.getAttribute('data-acao');
        });
      });
    },
    onValidate: () => true
  };
}

function getPasso5Confirmar() {
  return {
    subtitle: 'Passo 5 de 5: Confirmar',
    contentHtml: () => {
      // Formata a data para exibir no padrão DD/MM/AAAA
      const dataFormatada = checkoutData.dataSaida.split('-').reverse().join('/');

      return `
        <div class="step-container active">
          <div style="background: #fef2f2; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #b91c1c; margin-bottom: 12px;">
              <i class="ph ph-warning" style="font-size: 24px;"></i>
              <h3 style="margin: 0; font-size: 18px;">Atenção</h3>
            </div>
            <ul style="color: #b91c1c; font-size: 14px; padding-left: 20px; margin: 0; line-height: 1.6;">
              <li>O quarto <b>${checkoutData.kitnetNome}</b> ficará <b>Vago</b>.</li>
              <li>O inquilino <b>${checkoutData.inquilinoNome}</b> será arquivado.</li>
              <li>Esta ação não pode ser desfeita facilmente.</li>
            </ul>
          </div>

          <div style="display: flex; gap: 12px;">
            <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 12px;">
              <span style="font-size: 12px; color: #64748b; display: block;">Data Saída</span>
              <strong style="font-size: 15px; color: #1e293b;">${dataFormatada}</strong>
            </div>
            <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 12px;">
              <span style="font-size: 12px; color: #64748b; display: block;">Reembolso Caução</span>
              <strong style="font-size: 15px; color: #10b981;">R$ 0,00</strong>
            </div>
          </div>
        </div>
      `;
    },
    onRender: () => {
      // Muda visualmente o botão "Próximo" para "Confirmar Saída" (Fica Vermelho)
      const btnProximo = document.getElementById('btn-proximo-modal-encerrar-contrato-wizard');
      if (btnProximo) {
        btnProximo.innerHTML = 'Confirmar Saída';
        btnProximo.style.background = '#dc2626'; // Vermelho
      }
    },
    onValidate: () => {
      try {
        // A MÁGICA ACONTECE AQUI: Atualiza o banco de dados desvinculando o inquilino
        updateKitnet(checkoutData.kitnetId, {
          status: 'vago',
          inquilino: null,
          inquilinoId: null,
          contratoId: null
        });
        return true; // Permite avançar para a tela de Sucesso
      } catch (err) {
        alert("Erro ao encerrar contrato.");
        return false;
      }
    }
  };
}

// PASSO EXTRA INVISÍVEL: Tela de Sucesso
function getPasso6Sucesso(onSuccessCallback) {
  return {
    subtitle: 'Sucesso',
    contentHtml: () => `
      <div class="step-container active" style="text-align: center; padding: 10px 0;">
        <div class="step-icon-center" style="background:#dcfce7; color:#15803d; width: 80px; height: 80px; font-size: 40px; margin-bottom: 24px;"><i class="ph ph-check"></i></div>
        
        <h2 style="color: #1e3a8a; margin-bottom: 12px; font-size: 24px;">Check-out Realizado!</h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin-bottom: 32px;">A locação foi encerrada. O quarto foi liberado e o histórico atualizado com sucesso.</p>

        <button type="button" style="width: 100%; background: white; border: 2px solid #1e3a8a; color: #1e3a8a; padding: 16px; border-radius: 12px; font-weight: bold; font-size: 16px; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer;">
          <i class="ph ph-file-pdf" style="font-size: 24px;"></i> Baixar Termo de Entrega (PDF)
        </button>
      </div>
    `,
    onRender: () => {
      // Esconde a barra de progresso (já terminou)
      const progressBar = document.getElementById('modal-encerrar-contrato-wizard-progress');
      if (progressBar) progressBar.style.display = 'none';

      // Esconde o botão Voltar e restaura o botão concluir para verde
      const btnVoltar = document.getElementById('btn-voltar-modal-encerrar-contrato-wizard');
      const btnProximo = document.getElementById('btn-proximo-modal-encerrar-contrato-wizard');
      
      if (btnVoltar) btnVoltar.style.display = 'none';
      if (btnProximo) {
        btnProximo.innerHTML = 'Concluir <i class="ph ph-check"></i>';
        btnProximo.style.background = '#10b981'; // Verde Sucesso
        
        // Dispara o callback para recarregar a tela no fundo
        if (typeof onSuccessCallback === 'function') {
          onSuccessCallback();
        }
      }
    },
    onValidate: () => true
  };
}

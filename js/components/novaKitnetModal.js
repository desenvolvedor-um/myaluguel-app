// js/components/novaKitnetModal.js
import { ModalWizard } from './ModalWizard.js';
import { addKitnet } from '../database.js';

let kitnetData = {};

export function openNovaKitnetModal(onSuccessCallback) {
  kitnetData = {
    nome: '',
    valor: '',
    ciclo: 'Mensal',
    endereco: '',
    contasInclusas: false,
    status: 'vago', // TRAVADO: Todo quarto novo agora nasce vago obrigatoriamente
    inquilino: null,
    inquilinoId: null,
    pagamento: 'Pix'
  };

  new ModalWizard({
    id: 'modal-nova-kitnet-wizard',
    title: 'Novo Quarto',
    icon: 'ph-house-line',
    finishText: 'Salvar Quarto',
    steps: [
      getPasso1Detalhes(),
      getPasso2Preferencias() // Alterado para focar no Pagamento
    ],
    onFinish: () => {
      try {
        addKitnet(kitnetData);
        alert("✅ Quarto cadastrado com sucesso!");
        if (typeof onSuccessCallback === 'function') onSuccessCallback();
      } catch (err) {
        alert("Erro ao cadastrar kitnet.");
      }
    }
  });
}

function getPasso1Detalhes() {
  return {
    subtitle: 'Passo 1 de 2: Detalhes do Imóvel',
    contentHtml: () => `
      <div class="step-container active">
        <div class="input-group">
          <label>Nome do Quarto *</label>
          <input type="text" id="kitnet-nome" placeholder="Ex: Suíte Master, Quarto 01..." value="${kitnetData.nome}">
        </div>

        <div class="row-inputs" style="display: flex; gap: 12px;">
          <div class="input-group" style="flex: 1;">
            <label>Aluguel (R$) *</label>
            <input type="number" id="kitnet-valor" placeholder="0.00" step="0.01" value="${kitnetData.valor}">
          </div>
          <div class="input-group" style="flex: 1;">
            <label>Tipo de Aluguel</label>
            <select id="kitnet-ciclo" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; font-size: 14px;">
              <option value="Diário" ${kitnetData.ciclo === 'Diário' ? 'selected' : ''}>Diário</option>
              <option value="Semanal" ${kitnetData.ciclo === 'Semanal' ? 'selected' : ''}>Semanal</option>
              <option value="Quinzenal" ${kitnetData.ciclo === 'Quinzenal' ? 'selected' : ''}>Quinzenal</option>
              <option value="Mensal" ${kitnetData.ciclo === 'Mensal' ? 'selected' : ''}>Mensal</option>
            </select>
          </div>
        </div>

        <div class="input-group">
          <label>Endereço</label>
          <input type="text" id="kitnet-endereco" placeholder="Opcional..." value="${kitnetData.endereco}">
        </div>

        <div class="toggle-container" style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div class="toggle-text">
            <label style="font-weight: 600; color: #1e293b;">Contas Inclusas?</label>
            <span style="display: block; font-size: 12px; color: #64748b;">Água, luz, internet...</span>
          </div>
          <label class="switch">
            <input type="checkbox" id="kitnet-contas" ${kitnetData.contasInclusas ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `,
    onValidate: () => {
      const nome = document.getElementById('kitnet-nome').value.trim();
      const valor = document.getElementById('kitnet-valor').value;

      if (!nome || !valor) {
        alert('Por favor, preencha o Nome do Quarto e o Valor do Aluguel.');
        return false;
      }

      kitnetData.nome = nome;
      kitnetData.valor = parseFloat(valor);
      kitnetData.ciclo = document.getElementById('kitnet-ciclo').value;
      kitnetData.endereco = document.getElementById('kitnet-endereco').value;
      kitnetData.contasInclusas = document.getElementById('kitnet-contas').checked;
      
      return true;
    }
  };
}

function getPasso2Preferencias() {
  return {
    subtitle: 'Passo 2 de 2: Preferências',
    contentHtml: () => {
      return `
        <div class="step-container active">
          
          <div id="kitnet-info-status" style="background: #eff6ff; padding: 16px; border-radius: 12px; font-size: 14px; color: #1e3a8a; margin-bottom: 24px; border: 1px solid #bfdbfe; display: flex; gap: 16px; align-items: flex-start;">
            <i class="ph ph-info" style="font-size: 24px; color: #3b82f6; margin-top: 2px;"></i>
            <div>
              <strong style="display: block; font-size: 15px; margin-bottom: 4px;">Quarto Vago</strong>
              <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.4;">O quarto será criado livre no sistema. Para adicionar um morador, utilize a opção <b>Novo Aluguel</b>.</p>
            </div>
          </div>

          <div class="input-group">
            <label>Método de Recebimento Padrão</label>
            <select id="kitnet-pagamento" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; font-size: 14px;">
              <option value="Pix" ${kitnetData.pagamento === 'Pix' ? 'selected' : ''}>Pix</option>
              <option value="Dinheiro" ${kitnetData.pagamento === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
              <option value="Boleto" ${kitnetData.pagamento === 'Boleto' ? 'selected' : ''}>Boleto</option>
            </select>
          </div>

        </div>
      `;
    },
    onRender: () => {
      const selectPagamento = document.getElementById('kitnet-pagamento');
      selectPagamento.addEventListener('change', () => {
        kitnetData.pagamento = selectPagamento.value;
      });
    },
    onValidate: () => {
      kitnetData.pagamento = document.getElementById('kitnet-pagamento').value;
      return true;
    }
  };
}

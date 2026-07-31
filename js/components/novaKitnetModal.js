// js/components/novaKitnetModal.js
import { ModalWizard } from './ModalWizard.js';
import { getInquilinos, addKitnet } from '../database.js';

let kitnetData = {};

export function openNovaKitnetModal(onSuccessCallback) {
  // Reinicia os dados a cada abertura
  kitnetData = {
    nome: '',
    valor: '',
    vencimento: '5',
    endereco: '',
    contasInclusas: false,
    inquilino: '', // Nome do inquilino se selecionado
    pagamento: 'Pix',
    status: 'vago'
  };

  new ModalWizard({
    id: 'modal-nova-kitnet-wizard',
    title: 'Novo Quarto',
    icon: 'ph-door',
    finishText: 'Criar Quarto', // <--- ADICIONE ESTA LINHA AQUI!
    steps: [
      getPasso1Detalhes(),
      getPasso2Vinculo()
    ],
    onFinish: () => {
      salvarNovaKitnet();
      if (typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
    }
  });
}

function salvarNovaKitnet() {
  try {
    addKitnet(kitnetData);
    alert("✅ Quarto cadastrado com sucesso!");
  } catch (err) {
    console.error("Erro ao salvar quarto:", err);
    alert("Ocorreu um erro ao salvar o quarto.");
  }
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

        <div class="row-inputs">
          <div class="input-group">
            <label>Aluguel (R$) *</label>
            <input type="number" id="kitnet-valor" placeholder="0.00" step="0.01" value="${kitnetData.valor}">
          </div>
          <div class="input-group">
            <label>Vencimento</label>
            <select id="kitnet-vencimento">
              <option value="1" ${kitnetData.vencimento == '1' ? 'selected' : ''}>Dia 1</option>
              <option value="5" ${kitnetData.vencimento == '5' ? 'selected' : ''}>Dia 5</option>
              <option value="10" ${kitnetData.vencimento == '10' ? 'selected' : ''}>Dia 10</option>
              <option value="15" ${kitnetData.vencimento == '15' ? 'selected' : ''}>Dia 15</option>
              <option value="20" ${kitnetData.vencimento == '20' ? 'selected' : ''}>Dia 20</option>
            </select>
          </div>
        </div>

        <div class="input-group">
          <label>Endereço (Opcional)</label>
          <input type="text" id="kitnet-endereco" placeholder="Digite o endereço..." value="${kitnetData.endereco}">
        </div>

        <div class="toggle-container">
          <div class="toggle-text">
            <label>Contas Inclusas?</label>
            <span>Água, luz, internet...</span>
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
      kitnetData.vencimento = document.getElementById('kitnet-vencimento').value;
      kitnetData.endereco = document.getElementById('kitnet-endereco').value;
      kitnetData.contasInclusas = document.getElementById('kitnet-contas').checked;
      
      return true;
    }
  };
}

function getPasso2Vinculo() {
  return {
    subtitle: 'Passo 2 de 2: Ocupação',
    contentHtml: () => {
      const inquilinos = getInquilinos();
      
      return `
        <div class="step-container active">
          <div class="input-group">
            <label>Selecione o Inquilino (Opcional)</label>
            <select id="kitnet-inquilino">
              <option value="">Nenhum (Deixar Vago)</option>
              ${inquilinos.map(i => `<option value="${i.nome}" ${kitnetData.inquilino === i.nome ? 'selected' : ''}>${i.nome}</option>`).join('')}
            </select>
          </div>

          <div id="kitnet-info-status" style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #64748b; margin-bottom: 16px; border: 1px solid #f1f5f9;">
            ℹ️ O quarto será criado como <b>VAGO</b> e ficará disponível para locação.
          </div>

          <div class="input-group">
            <label>Método de Recebimento Padrão</label>
            <select id="kitnet-pagamento">
              <!-- O 'selected' agora lembra a escolha do usuário -->
              <option value="Pix" ${kitnetData.pagamento === 'Pix' ? 'selected' : ''}>Pix</option>
              <option value="Dinheiro" ${kitnetData.pagamento === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
              <option value="Boleto" ${kitnetData.pagamento === 'Boleto' ? 'selected' : ''}>Boleto</option>
            </select>
          </div>
        </div>
      `;
    },
    onRender: () => {
      const selectInquilino = document.getElementById('kitnet-inquilino');
      const selectPagamento = document.getElementById('kitnet-pagamento');
      const infoStatus = document.getElementById('kitnet-info-status');

      // Atualiza visualmente o aviso de vago/ocupado
      selectInquilino.addEventListener('change', () => {
        if (selectInquilino.value) {
          infoStatus.innerHTML = `✅ O quarto será criado como <b style="color: #059669;">OCUPADO</b> por <b>${selectInquilino.value}</b>.`;
        } else {
          infoStatus.innerHTML = `ℹ️ O quarto será criado como <b>VAGO</b> e ficará disponível para locação.`;
        }
      });

      // NOVIDADE: Força a variável a ser atualizada instantaneamente ao trocar a opção
      selectPagamento.addEventListener('change', () => {
        kitnetData.pagamento = selectPagamento.value;
      });
    },
    onValidate: () => {
      const inquilino = document.getElementById('kitnet-inquilino').value;
      kitnetData.inquilino = inquilino || null;
      kitnetData.status = inquilino ? 'ocupado' : 'vago';
      // Como já salvamos no 'change' acima, aqui apenas garantimos uma última leitura de segurança:
      kitnetData.pagamento = document.getElementById('kitnet-pagamento').value;
      return true;
    }
  };
}


// js/components/registrarPagamentoModal.js
import { getKitnets, addPagamento } from '../database.js';

export function openRegistrarPagamentoModal(onSuccessCallback) {
  // Remove o modal se já existir algum aberto
  const oldModal = document.getElementById('modal-registrar-pagamento');
  if (oldModal) oldModal.remove();

  // Puxa apenas os quartos ocupados
  const kitnetsOcupadas = getKitnets().filter(k => k.status === 'ocupado');
  const hoje = new Date().toISOString().split('T')[0];

  // Se não houver quartos ocupados, avisa o usuário
  if (kitnetsOcupadas.length === 0) {
    alert("Você não tem nenhuma Kitnet ocupada no momento para registrar pagamento.");
    return;
  }

  // Constrói as opções do Select
  const optionsHtml = kitnetsOcupadas.map(k => {
    return `<option value="${k.id}" data-valor="${k.valor || k.preco}" data-inq="${k.inquilino}" data-nome="${k.nome}">${k.nome} - ${k.inquilino}</option>`;
  }).join('');

  // Monta o HTML seguindo fielmente o layout da imagem enviada
  const modalHtml = `
    <div class="modal-overlay" id="modal-registrar-pagamento">
      <div class="modal-content" style="max-width: 400px; padding: 24px; box-sizing: border-box;">
        
        <!-- CABEÇALHO -->
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; position: relative;">
          <div style="background: #dcfce7; color: #15803d; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            <i class="ph ph-money"></i>
          </div>
          <div>
            <h2 style="color: #1e3a8a; font-size: 20px; margin: 0; font-weight: 700;">Registrar Pagamento</h2>
            <p style="color: #64748b; font-size: 14px; margin: 2px 0 0 0;">Marcar aluguel como pago</p>
          </div>
          <button type="button" id="btn-fechar-pagamento" style="position: absolute; top: -10px; right: -10px; background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer;">×</button>
        </div>

        <!-- FORMULÁRIO -->
        <form id="form-pagamento">
          <div class="input-group">
            <label style="color: #1e3a8a;">Kitnet *</label>
            <select id="pag-kitnet" required style="border-color: #1e3a8a; color: #1e3a8a; font-weight: 600;">
              <option value="">Selecione uma kitnet...</option>
              ${optionsHtml}
            </select>
          </div>

          <div class="input-group">
            <label style="color: #1e3a8a;">Valor Recebido *</label>
            <div style="position: relative;">
              <span style="position: absolute; left: 16px; top: 12px; color: #64748b; font-weight: 600;">R$</span>
              <input type="number" id="pag-valor" placeholder="0.00" step="0.01" required style="padding-left: 42px; font-weight: 600;">
            </div>
          </div>

          <div class="input-group">
            <label style="color: #1e3a8a;">Data do Pagamento</label>
            <input type="date" id="pag-data" value="${hoje}" required>
          </div>

          <div class="input-group">
            <label style="color: #1e3a8a;">Método de Pagamento</label>
            <select id="pag-metodo">
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>

          <!-- CAIXA DE RESUMO (Inicia Escondida) -->
          <div id="pag-resumo-box" style="display: none; background: #ecfdf5; border-radius: 12px; padding: 16px; margin-top: 16px;">
            <h4 style="color: #065f46; margin-bottom: 8px; font-size: 14px;">Resumo:</h4>
            <ul style="color: #047857; font-size: 13px; padding-left: 20px; margin: 0; line-height: 1.6;" id="pag-resumo-list">
              <!-- Preenchido via JavaScript -->
            </ul>
          </div>

          <!-- BOTÕES -->
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button type="button" id="btn-cancelar-pagamento" style="flex: 1; padding: 14px; border: none; background: #f8fafc; color: #64748b; font-weight: 600; border-radius: 12px; font-size: 15px; cursor: pointer;">
              Cancelar
            </button>
            <button type="submit" style="flex: 2; padding: 14px; border: none; background: #86efac; color: #065f46; font-weight: 600; border-radius: 12px; font-size: 15px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
              <i class="ph ph-check"></i> Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Injeta o modal na tela
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Seleciona os elementos para manipular via JS
  const modal = document.getElementById('modal-registrar-pagamento');
  const selectKitnet = document.getElementById('pag-kitnet');
  const inputValor = document.getElementById('pag-valor');
  const inputData = document.getElementById('pag-data');
  const selectMetodo = document.getElementById('pag-metodo');
  const resumoBox = document.getElementById('pag-resumo-box');
  const resumoList = document.getElementById('pag-resumo-list');

  // Fecha o modal
  const fecharModal = () => modal.remove();
  document.getElementById('btn-fechar-pagamento').addEventListener('click', fecharModal);
  document.getElementById('btn-cancelar-pagamento').addEventListener('click', fecharModal);

  // Função que atualiza o Resumo Dinâmico
  const atualizarResumo = () => {
    if (!selectKitnet.value) {
      resumoBox.style.display = 'none';
      return;
    }

    const opt = selectKitnet.options[selectKitnet.selectedIndex];
    const nome = opt.getAttribute('data-nome');
    const inq = opt.getAttribute('data-inq');
    const metodo = selectMetodo.value;
    const valorAtual = inputValor.value || 0;
    const valorFormatado = Number(valorAtual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    resumoList.innerHTML = `
      <li>Inquilino: <b>${inq}</b></li>
      <li>Kitnet: <b>${nome}</b></li>
      <li>Valor: <b>${valorFormatado}</b></li>
      <li>Método: <b>${metodo}</b></li>
    `;
    resumoBox.style.display = 'block';
  };

  // Quando escolhe a Kitnet, puxa o valor padrão e atualiza o resumo
  selectKitnet.addEventListener('change', () => {
    const opt = selectKitnet.options[selectKitnet.selectedIndex];
    if (opt && opt.value) {
      inputValor.value = opt.getAttribute('data-valor');
    } else {
      inputValor.value = '';
    }
    atualizarResumo();
  });

  // Atualiza o resumo se o usuário digitar um valor diferente ou mudar o método
  inputValor.addEventListener('input', atualizarResumo);
  selectMetodo.addEventListener('change', atualizarResumo);

  // Salvar Pagamento
  document.getElementById('form-pagamento').addEventListener('submit', (e) => {
    e.preventDefault();

    const opt = selectKitnet.options[selectKitnet.selectedIndex];
    
    addPagamento({
      kitnetId: selectKitnet.value,
      kitnetNome: opt.getAttribute('data-nome'),
      inquilinoNome: opt.getAttribute('data-inq'),
      valor: parseFloat(inputValor.value),
      dataPagamento: inputData.value,
      metodoPagamento: selectMetodo.value
    });

    fecharModal();
    alert("✅ Pagamento registrado com sucesso!");
    
    if (typeof onSuccessCallback === 'function') {
      onSuccessCallback();
    }
  });
}

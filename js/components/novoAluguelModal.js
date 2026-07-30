// js/components/novoAluguelModal.js
import { initDatabase, getInquilinos, addInquilino, getKitnets } from '../database.js';

let currentStep = 1;
const totalSteps = 6;

// Dados temporários do formulário de aluguel atual
let formData = {
  tipoInquilino: 'existente', // 'existente' ou 'novo'
  inquilinoId: null,
  novoInquilino: { nome: '', telefone: '', email: '' },
  kitnetId: null,
  dataInicio: new Date().toISOString().split('T')[0],
  deposito: 0,
  documentos: [],
  vistoriaTipo: 'agora',
  vistoriaData: new Date().toISOString().split('T')[0],
  vistoriaObs: ''
};

const stepTitles = [
  "Passo 1 de 6: Inquilino",
  "Passo 2 de 6: Quarto",
  "Passo 3 de 6: Documentos",
  "Passo 4 de 6: Contrato",
  "Passo 5 de 6: Vistoria",
  "Passo 6 de 6: Confirmar"
];

export function openNovoAluguelModal() {
  initDatabase(); // Garante que o banco local existe
  currentStep = 1;
  
  // Reseta dados temporários
  formData = {
    tipoInquilino: 'existente',
    inquilinoId: null,
    novoInquilino: { nome: '', telefone: '', email: '' },
    kitnetId: getKitnets()[0]?.id || null,
    dataInicio: new Date().toISOString().split('T')[0],
    deposito: 0,
    vistoriaTipo: 'agora',
    vistoriaData: new Date().toISOString().split('T')[0],
    vistoriaObs: ''
  };

  const modalHtml = `
    <div class="modal-overlay" id="modal-novo-aluguel">
      <div class="modal-content">
        
        <!-- HEADER E PROGRESSO -->
        <div class="modal-header">
          <div class="modal-title-row">
            <div class="modal-title-left">
              <div class="modal-icon-bg"><i class="ph ph-house-line"></i></div>
              <div class="modal-title">
                <h2>Novo Aluguel</h2>
                <p id="modal-step-subtitle">${stepTitles[0]}</p>
              </div>
            </div>
            <button class="btn-close" id="btn-close-modal"><i class="ph ph-x"></i></button>
          </div>
          <div class="progress-bar" id="modal-progress-bar">
            <span class="progress-step active"></span>
            <span class="progress-step"></span>
            <span class="progress-step"></span>
            <span class="progress-step"></span>
            <span class="progress-step"></span>
            <span class="progress-step"></span>
          </div>
        </div>

        <!-- CORPO DO MODAL -->
        <div class="modal-body">
          
          <!-- PASSO 1: INQUILINO -->
          <div class="step-container active" id="step-1">
            <div class="step-icon-center"><i class="ph ph-user"></i></div>
            <h3 class="step-title-center">Quem vai alugar?</h3>
            
            <div class="option-grid">
              <div class="option-card active" id="opt-inquilino-existente">
                <i class="ph ph-magnifying-glass"></i>
                <span>Inquilino<br>Existente</span>
              </div>
              <div class="option-card" id="opt-novo-inquilino">
                <i class="ph ph-user-plus"></i>
                <span>Novo<br>Inquilino</span>
              </div>
            </div>

            <!-- Area Inquilino Existente -->
            <div class="form-group" id="area-selecionar-inquilino">
              <label>Selecionar Inquilino</label>
              <select id="select-inquilino-existente">
                <option value="">Escolha um inquilino...</option>
                ${getInquilinos().map(i => `<option value="${i.id}">${i.nome} (${i.telefone})</option>`).join('')}
              </select>
            </div>

            <!-- Area Novo Inquilino (Inicia oculta) -->
            <div id="area-novo-inquilino" style="display: none;">
              <div class="form-group">
                <label>Nome Completo *</label>
                <input type="text" id="input-novo-nome" placeholder="Ex: Marcos">
              </div>
              <div class="form-group">
                <label>Telefone *</label>
                <input type="text" id="input-novo-telefone" placeholder="(11) 99999-9999" maxlength="15">
              </div>
              <div class="form-group">
                <label>Email (Opcional)</label>
                <input type="email" id="input-novo-email" placeholder="exemplo@gmail.com">
              </div>
            </div>
          </div>

          <!-- PASSO 2: QUARTO -->
          <div class="step-container" id="step-2">
            <div class="step-icon-center"><i class="ph ph-door"></i></div>
            <h3 class="step-title-center">Qual quarto será alugado?</h3>
            
            <div class="form-group">
              <label>Quartos Disponíveis</label>
              <div id="lista-quartos-disponiveis">
                <!-- Renderizado Dinamicamente -->
              </div>
            </div>

            <div class="form-group">
              <label>Data de Início</label>
              <input type="date" id="input-data-inicio" value="${formData.dataInicio}">
              <span class="form-hint">Quando o inquilino começa a pagar</span>
            </div>

            <div class="form-group">
              <label>Depósito de Segurança (Opcional)</label>
              <input type="number" id="input-deposito" placeholder="0.00">
              <span class="form-hint">Valor pago como garantia</span>
            </div>
          </div>

          <!-- PASSO 3: DOCUMENTOS -->
          <div class="step-container" id="step-3">
             <div class="step-icon-center"><i class="ph ph-file-arrow-up"></i></div>
             <h3 class="step-title-center">Documentos do Inquilino</h3>
             <div class="upload-card"><i class="ph ph-cloud-arrow-up"></i><strong>Clique para fazer upload</strong><p style="font-size: 12px; margin-top: 4px;">PDF, JPG, PNG (máx 10MB)</p></div>
             <div class="upload-card"><i class="ph ph-money"></i> Comprovante de Renda</div>
             <div class="upload-card"><i class="ph ph-users"></i> Referências Pessoais</div>
             <div class="info-alert">
               <i class="ph ph-info"></i>
               <div class="info-alert-text"><strong>Documento Opcional</strong><p>Você pode adicionar documentos depois no menu Editar Inquilino.</p></div>
             </div>
          </div>

          <!-- PASSO 4: CONTRATO -->
          <div class="step-container" id="step-4">
             <div class="step-icon-center"><i class="ph ph-file-text"></i></div>
             <h3 class="step-title-center">Contrato de Aluguel</h3>
             <div style="display:flex; gap:16px; margin-bottom: 16px;">
                <i class="ph ph-file-text" style="font-size: 24px; color: var(--primary);"></i>
                <div>
                  <strong style="display:block; font-size: 16px;">Contrato Será Gerado Automaticamente</strong>
                  <span style="font-size: 13px; color: var(--text-muted);">Após confirmar o aluguel</span>
                </div>
             </div>
             <ul style="list-style:none; padding:0; font-size: 14px; color: var(--text-color);">
               <li style="margin-bottom: 12px;"><i class="ph ph-check" style="color:#10b981; margin-right:8px;"></i>Nome completo do inquilino e proprietário</li>
               <li style="margin-bottom: 12px;"><i class="ph ph-check" style="color:#10b981; margin-right:8px;"></i>Endereço completo do imóvel</li>
               <li style="margin-bottom: 12px;"><i class="ph ph-check" style="color:#10b981; margin-right:8px;"></i>Valor do aluguel e depósito</li>
               <li style="margin-bottom: 12px;"><i class="ph ph-check" style="color:#10b981; margin-right:8px;"></i>Data de início e vencimento</li>
             </ul>
             <div class="info-alert">
               <i class="ph ph-info"></i>
               <div class="info-alert-text"><strong>Dica:</strong><p>Você poderá baixar e enviar o contrato após criar o aluguel.</p></div>
             </div>
          </div>

          <!-- PASSO 5: VISTORIA -->
          <div class="step-container" id="step-5">
            <div class="step-icon-center"><i class="ph ph-clipboard-text"></i></div>
            <h3 class="step-title-center">Vistoria de Entrada</h3>
            <div class="option-grid">
              <div class="option-card active" id="opt-vistoria-agora">
                <i class="ph ph-calendar-plus"></i><span>Agendar<br>Agora</span>
              </div>
              <div class="option-card" id="opt-vistoria-depois">
                <i class="ph ph-clock"></i><span>Fazer<br>Depois</span>
              </div>
            </div>
            <div id="area-agendar-vistoria">
              <div class="form-group">
                <label>Data da Vistoria</label>
                <input type="date" id="input-vistoria-data" value="${formData.vistoriaData}">
              </div>
              <div class="form-group">
                <label>Observações (Opcional)</label>
                <textarea id="input-vistoria-obs" placeholder="Ex: Verificar estado do piso, paredes..."></textarea>
              </div>
            </div>
            <div id="area-vistoria-depois" style="display:none; text-align:center; padding: 20px;">
                <i class="ph ph-clock" style="font-size: 40px; color: var(--text-muted); margin-bottom: 12px;"></i>
                <h4 style="margin-bottom:8px;">Vistoria Pode Ser Feita Depois</h4>
                <p style="font-size:14px; color:var(--text-muted);">Você pode agendar a vistoria após criar o aluguel.</p>
            </div>
          </div>

          <!-- PASSO 6: CONFIRMAR -->
          <div class="step-container" id="step-6">
             <div class="step-icon-center" style="background:#ecfdf5; color:#10b981;"><i class="ph ph-check-circle"></i></div>
             <h3 class="step-title-center">Revisar e Confirmar</h3>

             <div class="summary-card" style="border-color: var(--gray-light);">
                <div style="display:flex; gap:8px; align-items:center; color:var(--primary); margin-bottom: 8px; font-weight:600;"><i class="ph ph-user"></i> Inquilino</div>
                <strong id="resumo-inquilino-nome">-</strong>
                <p id="resumo-inquilino-tel">-</p>
                <p id="resumo-inquilino-email">-</p>
             </div>

             <div class="summary-card" style="border-color: var(--gray-light);">
                <div style="display:flex; gap:8px; align-items:center; color:var(--primary); margin-bottom: 8px; font-weight:600;"><i class="ph ph-door"></i> Quarto</div>
                <strong id="resumo-quarto-nome">-</strong>
                <p id="resumo-quarto-end" style="margin-bottom: 8px;">-</p>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Aluguel:</span> <strong id="resumo-quarto-preco" style="color:#10b981;">$0.00</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Vencimento:</span> <strong id="resumo-quarto-venc">-</strong></div>
             </div>

             <div class="info-alert success-alert">
               <i class="ph ph-info"></i>
               <div class="info-alert-text"><strong>Tudo pronto!</strong><p>Ao confirmar, o aluguel será criado e os pagamentos serão gerados automaticamente.</p></div>
             </div>
          </div>

        </div>

        <!-- RODAPÉ E BOTÕES -->
        <div class="modal-footer">
          <button class="btn-voltar" id="btn-voltar-step"><i class="ph ph-arrow-left"></i> Voltar</button>
          <button class="btn-proximo" id="btn-proximo-step">Próximo <i class="ph ph-arrow-right"></i></button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  setupModalEvents();
  updateUI();
}

function setupModalEvents() {
  const modal = document.getElementById('modal-novo-aluguel');
  
  document.getElementById('btn-close-modal').addEventListener('click', () => modal.remove());

  // Máscara de Telefone Automática (11) 99999-9999
  const telInput = document.getElementById('input-novo-telefone');
  telInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    if (val.length > 6) {
      val = `(${val.substring(0,2)}) ${val.substring(2,7)}-${val.substring(7)}`;
    } else if (val.length > 2) {
      val = `(${val.substring(0,2)}) ${val.substring(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    e.target.value = val;
  });

  // Alternar entre Inquilino Existente e Novo Inquilino
  document.getElementById('opt-inquilino-existente').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('opt-novo-inquilino').classList.remove('active');
    document.getElementById('area-selecionar-inquilino').style.display = 'block';
    document.getElementById('area-novo-inquilino').style.display = 'none';
    formData.tipoInquilino = 'existente';
  });

  document.getElementById('opt-novo-inquilino').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('opt-inquilino-existente').classList.remove('active');
    document.getElementById('area-selecionar-inquilino').style.display = 'none';
    document.getElementById('area-novo-inquilino').style.display = 'block';
    formData.tipoInquilino = 'novo';
  });

  // Alternar Vistoria
  document.getElementById('opt-vistoria-agora').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('opt-vistoria-depois').classList.remove('active');
    document.getElementById('area-agendar-vistoria').style.display = 'block';
    document.getElementById('area-vistoria-depois').style.display = 'none';
    formData.vistoriaTipo = 'agora';
  });

  document.getElementById('opt-vistoria-depois').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('opt-vistoria-agora').classList.remove('active');
    document.getElementById('area-agendar-vistoria').style.display = 'none';
    document.getElementById('area-vistoria-depois').style.display = 'block';
    formData.vistoriaTipo = 'depois';
  });

  // Botões de Navegação
  document.getElementById('btn-proximo-step').addEventListener('click', () => {
    // Validação do Passo 1
    if (currentStep === 1) {
      if (formData.tipoInquilino === 'existente') {
        const select = document.getElementById('select-inquilino-existente');
        if (!select.value) {
          alert('Por favor, selecione um inquilino existente.');
          return;
        }
        formData.inquilinoId = select.value;
      } else {
        const nome = document.getElementById('input-novo-nome').value.trim();
        const telefone = document.getElementById('input-novo-telefone').value.trim();
        const email = document.getElementById('input-novo-email').value.trim();

        if (!nome || !telefone) {
          alert('Preencha o Nome Completo e o Telefone do novo inquilino.');
          return;
        }
        // Salva o novo inquilino no banco local
        const salvo = addInquilino({ nome, telefone, email });
        formData.inquilinoId = salvo.id;
      }
    }

    // Coleta dados do Passo 2
    if (currentStep === 2) {
      const selectedKitnet = document.querySelector('input[name="kitnet-radio"]:checked');
      if (!selectedKitnet) {
        alert('Selecione uma Kitnet para alugar.');
        return;
      }
      formData.kitnetId = selectedKitnet.value;
      formData.dataInicio = document.getElementById('input-data-inicio').value;
      formData.deposito = document.getElementById('input-deposito').value || 0;
    }

    if (currentStep < totalSteps) {
      currentStep++;
      updateUI();
    } else {
      alert("🎉 Aluguel Criado e Salvo com Sucesso!");
      modal.remove();
    }
  });

  document.getElementById('btn-voltar-step').addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateUI();
    }
  });
}

function updateUI() {
  document.getElementById('modal-step-subtitle').innerText = stepTitles[currentStep - 1];

  // Barra de progresso
  const progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach((step, index) => {
    if (index < currentStep) step.classList.add('active');
    else step.classList.remove('active');
  });

  // Containers de passos
  document.querySelectorAll('.step-container').forEach(container => container.classList.remove('active'));
  document.getElementById(`step-${currentStep}`).classList.add('active');

  // Se chegou no Passo 2, renderiza as kitnets do banco de dados
  if (currentStep === 2) {
    const kitnets = getKitnets();
    const containerQuartos = document.getElementById('lista-quartos-disponiveis');
    containerQuartos.innerHTML = kitnets.map((k, idx) => `
      <label class="summary-card" style="display: block; cursor: pointer; margin-bottom: 10px; border: ${formData.kitnetId == k.id ? '2px solid var(--primary)' : '1px solid var(--gray-light)'};">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="radio" name="kitnet-radio" value="${k.id}" ${formData.kitnetId == k.id || (idx === 0 && !formData.kitnetId) ? 'checked' : ''}>
            <span class="summary-card-title">${k.nome}</span>
          </div>
          <span class="summary-card-price">$${k.preco}.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
          <span>${k.endereco}</span>
          <span>Vence dia ${k.vencimento}</span>
        </div>
      </label>
    `).join('');
  }

  // Se chegou no Passo 6 (Resumo), preenche os dados dinâmicos
  if (currentStep === 6) {
    const inquilinos = getInquilinos();
    const kitnets = getKitnets();
    
    const inquilino = inquilinos.find(i => i.id == formData.inquilinoId) || { nome: 'Novo', telefone: '-', email: '-' };
    const kitnet = kitnets.find(k => k.id == formData.kitnetId) || { nome: '-', endereco: '-', preco: 0, vencimento: '-' };

    document.getElementById('resumo-inquilino-nome').innerText = inquilino.nome;
    document.getElementById('resumo-inquilino-tel').innerText = inquilino.telefone;
    document.getElementById('resumo-inquilino-email').innerText = inquilino.email || 'Sem email';

    document.getElementById('resumo-quarto-nome').innerText = kitnet.nome;
    document.getElementById('resumo-quarto-end').innerText = kitnet.endereco;
    document.getElementById('resumo-quarto-preco').innerText = `$${Number(kitnet.preco).toFixed(2)}`;
    document.getElementById('resumo-quarto-venc').innerText = `Dia ${kitnet.vencimento}`;
  }

  // Botões de rodapé
  const btnVoltar = document.getElementById('btn-voltar-step');
  const btnProximo = document.getElementById('btn-proximo-step');

  btnVoltar.style.display = currentStep === 1 ? 'none' : 'block';
  btnProximo.innerHTML = currentStep === totalSteps ? '<i class="ph ph-check"></i> Criar Aluguel' : 'Próximo <i class="ph ph-arrow-right"></i>';
}

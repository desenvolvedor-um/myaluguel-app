// js/components/novoAluguelModal.js
import { ModalWizard } from './ModalWizard.js';
import { initDatabase, getInquilinos, addInquilino, getKitnets, updateKitnet, addContrato } from '../database.js';

let formData = {};

export function openNovoAluguelModal(onSuccessCallback) {
  initDatabase(); // Garante que a base no localStorage existe

  // Reinicia o objeto de dados limpo a cada abertura
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

  new ModalWizard({
    id: 'modal-novo-aluguel',
    title: 'Novo Aluguel',
    icon: 'ph-house-line',
    steps: [
      getPasso1Inquilino(),
      getPasso2Quarto(),
      getPasso3Documentos(),
      getPasso4Contrato(),
      getPasso5Vistoria(),
      getPasso6Confirmar()
    ],
    onFinish: () => {
      salvarNovoAluguel();
      if (typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
    }
  });
}

function salvarNovoAluguel() {
  try {
    //const inquilinos = getInquilinos();
    //const inquilino = inquilinos.find(i => String(i.id) === String(formData.inquilinoId));
    // CORREÇÃO: Se for um novo inquilino, salva no banco AGORA, no momento da confirmação.
    if (formData.tipoInquilino === 'novo') {
      const inquilinoSalvo = addInquilino(formData.novoInquilino);
      formData.inquilinoId = inquilinoSalvo.id; // Atualiza o ID com o ID gerado pelo banco
    }

    const inquilinos = getInquilinos();
    const inquilino = inquilinos.find(i => String(i.id) === String(formData.inquilinoId));


    // 1. Registra o Contrato
    const contrato = addContrato({
      kitnetId: formData.kitnetId,
      inquilinoId: formData.inquilinoId,
      inquilinoNome: inquilino ? inquilino.nome : '',
      dataInicio: formData.dataInicio,
      deposito: Number(formData.deposito || 0),
      vistoriaTipo: formData.vistoriaTipo,
      vistoriaData: formData.vistoriaData,
      vistoriaObs: formData.vistoriaObs
    });

    // 2. Atualiza a Kitnet com Status 'ocupado' e os dados do inquilino
    updateKitnet(formData.kitnetId, {
      status: 'ocupado',
      inquilino: inquilino ? inquilino.nome : null,
      inquilinoId: formData.inquilinoId,
      contratoId: contrato.id
    });

    alert("🎉 Aluguel Criado e Salvo com Sucesso!");
  } catch (err) {
    console.error("Erro ao salvar aluguel:", err);
    alert("Ocorreu um erro ao salvar o aluguel.");
  }
}

// ==========================================
// DEFINIÇÃO DOS 6 PASSOS
// ==========================================

function getPasso1Inquilino() {
  return {
    subtitle: 'Passo 1 de 6: Inquilino',
    contentHtml: () => {
      const inquilinos = getInquilinos();
      return `
        <div class="step-container active">
          <div class="step-icon-center"><i class="ph ph-user"></i></div>
          <h3 class="step-title-center">Quem vai alugar?</h3>
          
          <div class="option-grid">
            <div class="option-card ${formData.tipoInquilino === 'existente' ? 'active' : ''}" id="opt-inquilino-existente">
              <i class="ph ph-magnifying-glass"></i><span>Inquilino<br>Existente</span>
            </div>
            <div class="option-card ${formData.tipoInquilino === 'novo' ? 'active' : ''}" id="opt-novo-inquilino">
              <i class="ph ph-user-plus"></i><span>Novo<br>Inquilino</span>
            </div>
          </div>

          <!-- Selecionar Inquilino Existente -->
          <div class="form-group" id="area-selecionar-inquilino" style="display: ${formData.tipoInquilino === 'existente' ? 'block' : 'none'};">
            <label>Selecionar Inquilino</label>
            <select id="select-inquilino-existente">
              <option value="">Escolha um inquilino...</option>
              ${inquilinos.map(i => `<option value="${i.id}" ${formData.inquilinoId == i.id ? 'selected' : ''}>${i.nome} (${i.telefone})</option>`).join('')}
            </select>
          </div>

          <!-- Cadastrar Novo Inquilino -->
          <div id="area-novo-inquilino" style="display: ${formData.tipoInquilino === 'novo' ? 'block' : 'none'};">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input type="text" id="input-novo-nome" placeholder="Ex: Marcos" value="${formData.novoInquilino.nome}">
            </div>
            <div class="form-group">
              <label>Telefone *</label>
              <input type="text" id="input-novo-telefone" placeholder="(11) 99999-9999" maxlength="15" value="${formData.novoInquilino.telefone}">
            </div>
            <div class="form-group">
              <label>Email (Opcional)</label>
              <input type="email" id="input-novo-email" placeholder="exemplo@gmail.com" value="${formData.novoInquilino.email}">
            </div>
          </div>
        </div>
      `;
    },
    onRender: () => {
      const optExistente = document.getElementById('opt-inquilino-existente');
      const optNovo = document.getElementById('opt-novo-inquilino');
      const areaExistente = document.getElementById('area-selecionar-inquilino');
      const areaNovo = document.getElementById('area-novo-inquilino');

      optExistente.onclick = () => {
        optExistente.classList.add('active');
        optNovo.classList.remove('active');
        areaExistente.style.display = 'block';
        areaNovo.style.display = 'none';
        formData.tipoInquilino = 'existente';
      };

      optNovo.onclick = () => {
        optNovo.classList.add('active');
        optExistente.classList.remove('active');
        areaExistente.style.display = 'none';
        areaNovo.style.display = 'block';
        formData.tipoInquilino = 'novo';
      };

      const telInput = document.getElementById('input-novo-telefone');
      if (telInput) {
        telInput.addEventListener('input', (e) => {
          let val = e.target.value.replace(/\D/g, '');
          if (val.length > 11) val = val.substring(0, 11);
          if (val.length > 6) val = `(${val.substring(0,2)}) ${val.substring(2,7)}-${val.substring(7)}`;
          else if (val.length > 2) val = `(${val.substring(0,2)}) ${val.substring(2)}`;
          else if (val.length > 0) val = `(${val}`;
          e.target.value = val;
        });
      }
    },
    onValidate: () => {
      if (formData.tipoInquilino === 'existente') {
        const id = document.getElementById('select-inquilino-existente').value;
        if (!id) {
          alert('Por favor, selecione um inquilino existente.');
          return false;
        }
        formData.inquilinoId = id;
      } else {
        const nome = document.getElementById('input-novo-nome').value.trim();
        const telefone = document.getElementById('input-novo-telefone').value.trim();
        const email = document.getElementById('input-novo-email').value.trim();

        if (!nome || !telefone) {
          alert('Preencha o Nome Completo e o Telefone do novo inquilino.');
          return false;
        }

        formData.novoInquilino = { nome, telefone, email };
        //const salvo = addInquilino({ nome, telefone, email });
        //formData.inquilinoId = salvo.id;
      }
      return true;
    }
  };
}

function getPasso2Quarto() {
  return {
    subtitle: 'Passo 2 de 6: Quarto',
    contentHtml: () => {
      // 1. O SEGREDO ESTÁ AQUI: Filtramos para pegar apenas as kitnets vagas
      const kitnetsVagas = getKitnets().filter(k => k.status === 'vago');

      // 2. Proteção: E se não tiver nenhuma vaga? Mostramos um aviso amigável.
      if (kitnetsVagas.length === 0) {
        return `
          <div class="step-container active">
            <div class="step-icon-center" style="background:#fee2e2; color:#b91c1c;"><i class="ph ph-warning-circle"></i></div>
            <h3 class="step-title-center">Nenhum quarto disponível</h3>
            <p style="text-align: center; color: var(--text-muted);">Você precisa ter pelo menos um quarto vago cadastrado para criar um novo aluguel.</p>
          </div>
        `;
      }

      // 3. Se tiver vaga, renderiza a lista normal (usando a variável kitnetsVagas)
      return `
        <div class="step-container active">
          <div class="step-icon-center"><i class="ph ph-door"></i></div>
          <h3 class="step-title-center">Qual quarto será alugado?</h3>
          
          <div class="form-group">
            <label>Quartos Disponíveis</label>
            <div id="lista-quartos-disponiveis">
              ${kitnetsVagas.map((k, idx) => `
                <label class="summary-card" style="display: block; cursor: pointer; margin-bottom: 10px; border: ${formData.kitnetId == k.id || (idx === 0 && !formData.kitnetId) ? '2px solid var(--primary)' : '1px solid var(--gray-light)'};">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <input type="radio" name="kitnet-radio" value="${k.id}" ${formData.kitnetId == k.id || (idx === 0 && !formData.kitnetId) ? 'checked' : ''}>
                      <strong class="summary-card-title">${k.nome || k.name}</strong>
                    </div>
                    <span class="summary-card-price">${Number(k.preco || k.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
                    <span>${k.endereco || 'Sem endereço'}</span>
                    <span>Vence dia ${k.vencimento || 5}</span>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label>Data de Início</label>
            <input type="date" id="input-data-inicio" value="${formData.dataInicio}">
            <span class="form-hint">Quando o inquilino começa a pagar</span>
          </div>

          <div class="form-group">
            <label>Depósito de Segurança (Opcional)</label>
            <input type="number" id="input-deposito" placeholder="0.00" value="${formData.deposito || ''}">
            <span class="form-hint">Valor pago como garantia</span>
          </div>
        </div>
      `;
    },
    onRender: () => {
      const radios = document.querySelectorAll('input[name="kitnet-radio"]');
      radios.forEach(r => {
        r.addEventListener('change', (e) => {
          formData.kitnetId = e.target.value;
          radios.forEach(item => {
            const card = item.closest('.summary-card');
            if (card) {
              card.style.border = item.checked ? '2px solid var(--primary)' : '1px solid var(--gray-light)';
            }
          });
        });
      });
    },
    onValidate: () => {
      const selectedKitnet = document.querySelector('input[name="kitnet-radio"]:checked');
      if (!selectedKitnet) {
        alert('Selecione uma Kitnet para alugar.');
        return false;
      }
      formData.kitnetId = selectedKitnet.value;
      formData.dataInicio = document.getElementById('input-data-inicio').value;
      formData.deposito = document.getElementById('input-deposito').value || 0;
      return true;
    }
  };
}

function getPasso3Documentos() {
  return {
    subtitle: 'Passo 3 de 6: Documentos',
    contentHtml: () => `
      <div class="step-container active">
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
    `,
    onValidate: () => true
  };
}

function getPasso4Contrato() {
  return {
    subtitle: 'Passo 4 de 6: Contrato',
    contentHtml: () => `
      <div class="step-container active">
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
    `,
    onValidate: () => true
  };
}

function getPasso5Vistoria() {
  return {
    subtitle: 'Passo 5 de 6: Vistoria',
    contentHtml: () => `
      <div class="step-container active">
        <div class="step-icon-center"><i class="ph ph-clipboard-text"></i></div>
        <h3 class="step-title-center">Vistoria de Entrada</h3>
        <div class="option-grid">
          <div class="option-card ${formData.vistoriaTipo === 'agora' ? 'active' : ''}" id="opt-vistoria-agora">
            <i class="ph ph-calendar-plus"></i><span>Agendar<br>Agora</span>
          </div>
          <div class="option-card ${formData.vistoriaTipo === 'depois' ? 'active' : ''}" id="opt-vistoria-depois">
            <i class="ph ph-clock"></i><span>Fazer<br>Depois</span>
          </div>
        </div>
        <div id="area-agendar-vistoria" style="display: ${formData.vistoriaTipo === 'agora' ? 'block' : 'none'};">
          <div class="form-group">
            <label>Data da Vistoria</label>
            <input type="date" id="input-vistoria-data" value="${formData.vistoriaData}">
          </div>
          <div class="form-group">
            <label>Observações (Opcional)</label>
            <textarea id="input-vistoria-obs" placeholder="Ex: Verificar estado do piso, paredes...">${formData.vistoriaObs}</textarea>
          </div>
        </div>
        <div id="area-vistoria-depois" style="display: ${formData.vistoriaTipo === 'depois' ? 'block' : 'none'}; text-align:center; padding: 20px;">
            <i class="ph ph-clock" style="font-size: 40px; color: var(--text-muted); margin-bottom: 12px;"></i>
            <h4 style="margin-bottom:8px;">Vistoria Pode Ser Feita Depois</h4>
            <p style="font-size:14px; color:var(--text-muted);">Você pode agendar a vistoria após criar o aluguel.</p>
        </div>
      </div>
    `,
    onRender: () => {
      const optAgora = document.getElementById('opt-vistoria-agora');
      const optDepois = document.getElementById('opt-vistoria-depois');
      const areaAgora = document.getElementById('area-agendar-vistoria');
      const areaDepois = document.getElementById('area-vistoria-depois');

      optAgora.onclick = () => {
        optAgora.classList.add('active');
        optDepois.classList.remove('active');
        areaAgora.style.display = 'block';
        areaDepois.style.display = 'none';
        formData.vistoriaTipo = 'agora';
      };

      optDepois.onclick = () => {
        optDepois.classList.add('active');
        optAgora.classList.remove('active');
        areaAgora.style.display = 'none';
        areaDepois.style.display = 'block';
        formData.vistoriaTipo = 'depois';
      };
    },
    onValidate: () => {
      if (formData.vistoriaTipo === 'agora') {
        formData.vistoriaData = document.getElementById('input-vistoria-data').value;
        formData.vistoriaObs = document.getElementById('input-vistoria-obs').value;
      }
      return true;
    }
  };
}

function getPasso6Confirmar() {
  return {
    subtitle: 'Passo 6 de 6: Confirmar',
    contentHtml: () => {
      const inquilinos = getInquilinos();
      const kitnets = getKitnets();

      const inquilino = inquilinos.find(i => String(i.id) === String(formData.inquilinoId)) || { nome: 'Não selecionado', telefone: '-', email: '-' };
      const kitnet = kitnets.find(k => String(k.id) === String(formData.kitnetId)) || { nome: '-', endereco: '-', preco: 0, valor: 0, vencimento: '-' };

      const precoFinal = kitnet.preco || kitnet.valor || 0;

      return `
        <div class="step-container active">
           <div class="step-icon-center" style="background:#ecfdf5; color:#10b981;"><i class="ph ph-check-circle"></i></div>
           <h3 class="step-title-center">Revisar e Confirmar</h3>

           <div class="summary-card" style="border-color: var(--gray-light); margin-bottom: 12px;">
              <div style="display:flex; gap:8px; align-items:center; color:var(--primary); margin-bottom: 8px; font-weight:600;"><i class="ph ph-user"></i> Inquilino</div>
              <strong>${inquilino.nome}</strong>
              <p style="margin: 4px 0; font-size:14px; color:var(--text-muted);">${inquilino.telefone}</p>
              <p style="margin: 0; font-size:14px; color:var(--text-muted);">${inquilino.email || 'Sem email'}</p>
           </div>

           <div class="summary-card" style="border-color: var(--gray-light); margin-bottom: 12px;">
              <div style="display:flex; gap:8px; align-items:center; color:var(--primary); margin-bottom: 8px; font-weight:600;"><i class="ph ph-door"></i> Quarto</div>
              <strong>${kitnet.nome}</strong>
              <p style="margin-bottom: 8px; font-size:14px; color:var(--text-muted);">${kitnet.endereco || 'Sem endereço'}</p>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:14px;"><span>Aluguel:</span> <strong style="color:#10b981;">${Number(precoFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>

              <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Vencimento:</span> <strong>Dia ${kitnet.vencimento || 5}</strong></div>
           </div>

           <div class="info-alert success-alert">
             <i class="ph ph-info"></i>
             <div class="info-alert-text"><strong>Tudo pronto!</strong><p>Ao confirmar, o aluguel será criado e salvo no seu navegador.</p></div>
           </div>
        </div>
      `;
    },
    onValidate: () => true
  };
}

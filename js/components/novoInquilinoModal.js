// js/components/novoInquilinoModal.js
import { ModalWizard } from './ModalWizard.js';
import { addInquilino } from '../database.js';

let inquilinoData = {};

export function openNovoInquilinoModal(onSuccessCallback) {
  // Reinicia os dados a cada abertura
  inquilinoData = {
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    notificacaoVia: 'WHATSAPP',
    obs: ''
  };

  new ModalWizard({
    id: 'modal-novo-inquilino-wizard',
    title: 'Novo Inquilino',
    icon: 'ph-user-plus',
    finishText: 'Cadastrar',
    steps: [
      getPasso1Basico(),
      getPasso2Contato(),
      getPasso3Resumo()
    ],
    onFinish: () => {
      try {
        addInquilino(inquilinoData);
        alert("✅ Inquilino cadastrado com sucesso!");
        if (typeof onSuccessCallback === 'function') onSuccessCallback();
      } catch (err) {
        alert("Erro ao cadastrar inquilino.");
      }
    }
  });
}

function getPasso1Basico() {
  return {
    subtitle: 'Etapa 1 de 3: Informações Básicas',
    contentHtml: () => `
      <div class="step-container active">
        <div class="step-icon-center" style="background:#f1f5f9; color:#1e3a8a;"><i class="ph ph-identification-card"></i></div>
        
        <div class="input-group">
          <label>Nome Completo *</label>
          <input type="text" id="inq-nome" placeholder="Digite o nome do inquilino" value="${inquilinoData.nome}">
        </div>

        <div class="input-group">
          <label>CPF *</label>
          <input type="text" id="inq-cpf" placeholder="000.000.000-00" maxlength="14" value="${inquilinoData.cpf}">
        </div>

        <div class="input-group">
          <label>Telefone *</label>
          <input type="text" id="inq-telefone" placeholder="(00) 00000-0000" maxlength="15" value="${inquilinoData.telefone}">
        </div>
      </div>
    `,
    onRender: () => {
      // Máscara de CPF
      const cpfInput = document.getElementById('inq-cpf');
      cpfInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
        if (v.length <= 11) {
          v = v.replace(/(\d{3})(\d)/, '$1.$2');
          v = v.replace(/(\d{3})(\d)/, '$1.$2');
          v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        e.target.value = v;
      });

      // Máscara de Telefone
      const telInput = document.getElementById('inq-telefone');
      telInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 6) v = `(${v.substring(0,2)}) ${v.substring(2,7)}-${v.substring(7)}`;
        else if (v.length > 2) v = `(${v.substring(0,2)}) ${v.substring(2)}`;
        else if (v.length > 0) v = `(${v}`;
        e.target.value = v;
      });
    },
    onValidate: () => {
      const nome = document.getElementById('inq-nome').value.trim();
      const cpf = document.getElementById('inq-cpf').value.trim();
      const telefone = document.getElementById('inq-telefone').value.trim();

      if (!nome || !cpf || !telefone) {
        alert('Por favor, preencha Nome, CPF e Telefone.');
        return false;
      }

      inquilinoData.nome = nome;
      inquilinoData.cpf = cpf;
      inquilinoData.telefone = telefone;
      return true;
    }
  };
}

function getPasso2Contato() {
  return {
    subtitle: 'Etapa 2 de 3: Contato e Preferências',
    contentHtml: () => `
      <div class="step-container active">
        <div class="step-icon-center" style="background:#f1f5f9; color:#1e3a8a;"><i class="ph ph-gear"></i></div>

        <div class="input-group">
          <label>Email (Opcional)</label>
          <input type="email" id="inq-email" placeholder="email@exemplo.com" value="${inquilinoData.email}">
        </div>

        <label style="font-size: 13px; font-weight: 600; color: var(--primary); display: block; margin-bottom: 8px;">Notificação Via</label>
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <button type="button" class="notif-btn ${inquilinoData.notificacaoVia === 'SMS' ? 'active' : ''}" data-via="SMS" style="flex:1; padding: 12px; border-radius: 12px; border: 1px solid #cbd5e1; background: ${inquilinoData.notificacaoVia === 'SMS' ? '#eff6ff' : 'white'}; border-color: ${inquilinoData.notificacaoVia === 'SMS' ? '#1e3a8a' : '#cbd5e1'}; color: ${inquilinoData.notificacaoVia === 'SMS' ? '#1e3a8a' : '#64748b'}; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <i class="ph ph-chat-text" style="font-size: 20px;"></i> SMS
          </button>
          <button type="button" class="notif-btn ${inquilinoData.notificacaoVia === 'EMAIL' ? 'active' : ''}" data-via="EMAIL" style="flex:1; padding: 12px; border-radius: 12px; border: 1px solid #cbd5e1; background: ${inquilinoData.notificacaoVia === 'EMAIL' ? '#eff6ff' : 'white'}; border-color: ${inquilinoData.notificacaoVia === 'EMAIL' ? '#1e3a8a' : '#cbd5e1'}; color: ${inquilinoData.notificacaoVia === 'EMAIL' ? '#1e3a8a' : '#64748b'}; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <i class="ph ph-envelope-simple" style="font-size: 20px;"></i> Email
          </button>
          <button type="button" class="notif-btn ${inquilinoData.notificacaoVia === 'WHATSAPP' ? 'active' : ''}" data-via="WHATSAPP" style="flex:1; padding: 12px; border-radius: 12px; border: 1px solid #cbd5e1; background: ${inquilinoData.notificacaoVia === 'WHATSAPP' ? '#eff6ff' : 'white'}; border-color: ${inquilinoData.notificacaoVia === 'WHATSAPP' ? '#1e3a8a' : '#cbd5e1'}; color: ${inquilinoData.notificacaoVia === 'WHATSAPP' ? '#1e3a8a' : '#64748b'}; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <i class="ph ph-whatsapp-logo" style="font-size: 20px;"></i> WhatsApp
          </button>
        </div>

        <div class="input-group">
          <label>Observações</label>
          <textarea id="inq-obs" placeholder="Informações adicionais...">${inquilinoData.obs}</textarea>
        </div>
      </div>
    `,
    onRender: () => {
      const botoes = document.querySelectorAll('.notif-btn');
      botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
          // Remove estilo de todos
          botoes.forEach(b => {
            b.classList.remove('active');
            b.style.background = 'white';
            b.style.borderColor = '#cbd5e1';
            b.style.color = '#64748b';
          });
          
          // Adiciona estilo no clicado
          const clicado = e.currentTarget;
          clicado.classList.add('active');
          clicado.style.background = '#eff6ff';
          clicado.style.borderColor = '#1e3a8a';
          clicado.style.color = '#1e3a8a';
          
          inquilinoData.notificacaoVia = clicado.getAttribute('data-via');
        });
      });
    },
    onValidate: () => {
      inquilinoData.email = document.getElementById('inq-email').value;
      inquilinoData.obs = document.getElementById('inq-obs').value;
      return true;
    }
  };
}

function getPasso3Resumo() {
  return {
    subtitle: 'Etapa 3 de 3: Conferência',
    contentHtml: () => {
      const inicial = inquilinoData.nome.charAt(0).toUpperCase();

      return `
        <div class="step-container active">
          <div class="step-icon-center" style="background:#dcfce7; color:#15803d; width: 64px; height: 64px; font-size: 32px;"><i class="ph ph-check-circle"></i></div>
          <h3 style="text-align: center; color: #1e3a8a; margin-bottom: 24px;">Confirmar Dados</h3>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <div style="width: 48px; height: 48px; background: #e0e7ff; color: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">
                ${inicial}
              </div>
              <div>
                <strong style="display: block; font-size: 18px; color: #1e293b;">${inquilinoData.nome}</strong>
                <span style="color: #64748b; font-size: 13px;">CPF: ${inquilinoData.cpf}</span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div>
                <span style="color: #64748b; display: block;">Telefone</span>
                <strong style="color: #1e293b;">${inquilinoData.telefone}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block;">Notificação</span>
                <strong style="color: #1e293b;">Via ${inquilinoData.notificacaoVia}</strong>
              </div>
              <div style="grid-column: span 2;">
                <span style="color: #64748b; display: block;">Email</span>
                <strong style="color: #1e293b;">${inquilinoData.email || 'Não informado'}</strong>
              </div>
            </div>
          </div>
        </div>
      `;
    },
    onValidate: () => true
  };
}

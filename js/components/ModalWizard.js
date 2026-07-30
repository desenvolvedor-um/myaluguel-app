// js/components/ModalWizard.js
export class ModalWizard {
  constructor(options) {
    this.id = options.id || 'generic-wizard-modal';
    this.title = options.title || 'Título';
    this.icon = options.icon || 'ph-app-window';
    this.steps = options.steps || [];
    this.onFinish = options.onFinish || function() {};
    
    this.currentStep = 1;
    this.totalSteps = this.steps.length;
    
    this.build();
  }

  build() {
    // Remove modal antigo se já existir no DOM
    const oldModal = document.getElementById(this.id);
    if (oldModal) oldModal.remove();

    const progressHtml = this.steps.map(() => `<span class="progress-step"></span>`).join('');

    const modalHtml = `
      <div class="modal-overlay" id="${this.id}">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title-row">
              <div class="modal-title-left">
                <div class="modal-icon-bg"><i class="ph ${this.icon}"></i></div>
                <div class="modal-title">
                  <h2>${this.title}</h2>
                  <p id="${this.id}-subtitle"></p>
                </div>
              </div>
              <button class="btn-close" id="btn-close-${this.id}"><i class="ph ph-x"></i></button>
            </div>
            <div class="progress-bar" id="${this.id}-progress">
              ${progressHtml}
            </div>
          </div>
          
          <div class="modal-body" id="${this.id}-body">
            <!-- O HTML do passo atual será renderizado aqui -->
          </div>

          <div class="modal-footer">
            <button class="btn-voltar" id="btn-voltar-${this.id}"><i class="ph ph-arrow-left"></i> Voltar</button>
            <button class="btn-proximo" id="btn-proximo-${this.id}">Próximo <i class="ph ph-arrow-right"></i></button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.setupEvents();
    this.renderStep();
  }

  setupEvents() {
    const modal = document.getElementById(this.id);
    
    document.getElementById(`btn-close-${this.id}`).onclick = () => modal.remove();

    document.getElementById(`btn-voltar-${this.id}`).onclick = () => {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.renderStep();
      }
    };

    document.getElementById(`btn-proximo-${this.id}`).onclick = async () => {
      const stepConfig = this.steps[this.currentStep - 1];
      
      if (stepConfig.onValidate) {
        const isValid = await stepConfig.onValidate();
        if (!isValid) return; // Se a validação falhar, não avança
      }

      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.renderStep();
      } else {
        this.onFinish();
        modal.remove();
      }
    };
  }

  renderStep() {
    const stepConfig = this.steps[this.currentStep - 1];
    
    // Atualiza Subtítulo
    document.getElementById(`${this.id}-subtitle`).innerText = stepConfig.subtitle || `Passo ${this.currentStep} de ${this.totalSteps}`;

    // Injeta HTML dinamicamente (se for função, executa no momento para ler dados atualizados)
    const body = document.getElementById(`${this.id}-body`);
    const htmlContent = typeof stepConfig.contentHtml === 'function' 
      ? stepConfig.contentHtml() 
      : stepConfig.contentHtml;
    
    body.innerHTML = htmlContent;

    // Atualiza Barra de Progresso
    const progressSteps = document.querySelectorAll(`#${this.id}-progress .progress-step`);
    progressSteps.forEach((el, index) => {
      el.classList.toggle('active', index < this.currentStep);
    });

    // Atualiza Botões
    const btnVoltar = document.getElementById(`btn-voltar-${this.id}`);
    const btnProximo = document.getElementById(`btn-proximo-${this.id}`);
    
    btnVoltar.style.display = this.currentStep === 1 ? 'none' : 'block';
    btnProximo.innerHTML = this.currentStep === this.totalSteps 
      ? '<i class="ph ph-check"></i> Criar Aluguel' 
      : 'Próximo <i class="ph ph-arrow-right"></i>';

    // Executa os eventos específicos da tela atual
    if (stepConfig.onRender) {
      stepConfig.onRender();
    }
  }
}

// js/pages/InquilinosPage.js
import { openNovoInquilinoModal } from '../components/novoInquilinoModal.js';
import { getInquilinos, getKitnets, deleteInquilino } from '../database.js';

export async function renderInquilinos() {
  const html = `
    <div id="pagina-inquilinos" class="page-container">
      <div class="header-actions">
        <button id="btn-novo-inquilino" class="btn-primary full-width" style="justify-content: center; font-size: 16px; padding: 16px; margin-top: 0;">
          <i class="ph ph-user-plus"></i> Adicionar Inquilino
        </button>
      </div>

      <div class="filtros" style="margin-top: 16px;">
        <button class="tab-filter active" data-filtro="ativos">Ativos (<span id="qtd-ativos">0</span>)</button>
        <button class="tab-filter" data-filtro="inativos">Inativos (<span id="qtd-inativos">0</span>)</button>
        <button class="tab-filter" data-filtro="todos">Todos (<span id="qtd-todos-inq">0</span>)</button>
      </div>

      <div id="lista-inquilinos-container"></div>
    </div>
  `;

  const setupEvents = () => {
    const btnNovoInquilino = document.getElementById('btn-novo-inquilino');
    let filtroAtual = 'ativos'; // O padrão começa na aba Ativos

    // Lógica para clicar nos filtros
    const botoesFiltro = document.querySelectorAll('#pagina-inquilinos .tab-filter');
    botoesFiltro.forEach(btn => {
      btn.addEventListener('click', (e) => {
        botoesFiltro.forEach(b => b.classList.remove('active'));
        const clicado = e.currentTarget;
        clicado.classList.add('active');
        filtroAtual = clicado.getAttribute('data-filtro');
        atualizarListaNaTela();
      });
    });
    
    const atualizarListaNaTela = () => {
      const inquilinos = getInquilinos();
      const kitnets = getKitnets();
      const listaContainer = document.getElementById('lista-inquilinos-container');

      // Descobre os nomes dos inquilinos que estão em kitnets ocupadas
      const nomesOcupados = kitnets
        .filter(k => k.status === 'ocupado' && k.inquilino)
        .map(k => String(k.inquilino).toLowerCase().trim());

      const isInquilinoAtivo = (nomeInquilino) => {
        if (!nomeInquilino) return false;
        return nomesOcupados.includes(String(nomeInquilino).toLowerCase().trim());
      };

      // Recalcula as quantidades
      const inquilinosAtivos = inquilinos.filter(inq => isInquilinoAtivo(inq.nome));
      const qtdAtivos = inquilinosAtivos.length;
      const qtdTodos = inquilinos.length;
      const qtdInativos = qtdTodos - qtdAtivos;

      document.getElementById('qtd-ativos').innerText = qtdAtivos;
      document.getElementById('qtd-inativos').innerText = qtdInativos;
      document.getElementById('qtd-todos-inq').innerText = qtdTodos;

      if (!listaContainer) return;
      listaContainer.innerHTML = '';

      // Filtra a lista
      let inquilinosParaExibir = inquilinos;
      if (filtroAtual === 'ativos') {
        inquilinosParaExibir = inquilinosAtivos;
      } else if (filtroAtual === 'inativos') {
        inquilinosParaExibir = inquilinos.filter(inq => !isInquilinoAtivo(inq.nome));
      }

      if (inquilinosParaExibir.length === 0) {
        listaContainer.innerHTML = `
          <div class="empty-state" style="border: 2px dashed #cbd5e1; border-radius: 24px; padding: 40px 20px;">
            <div class="kitnet-icon" style="margin: 0 auto 20px; background:#e2e8f0; width:80px; height:80px;"><i class="ph ph-users" style="font-size:32px;"></i></div>
            <h3 style="color: #1e3a8a;">Nenhum inquilino ${filtroAtual === 'todos' ? 'cadastrado' : 'encontrado'}</h3>
          </div>
        `;
        return;
      }

      inquilinosParaExibir.forEach(inq => {
        const isAtivo = isInquilinoAtivo(inq.nome);
        const badgeClass = isAtivo ? 'badge-status ocupado' : 'badge-status vago';
        const statusTexto = isAtivo ? 'ATIVO' : 'INATIVO';
        const inicial = inq.nome.charAt(0).toUpperCase();

        const cardHTML = `
          <div class="kitnet-card" style="padding: 14px;">
            <div class="card-header-top" style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">
              
              <!-- ESQUERDA: 3 Pontinhos e Dropdown -->
              <div style="position: relative; margin-right: 12px; margin-top: 4px;">
                <button class="btn-opcoes" style="background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; padding: 0;"><i class="ph ph-dots-three-vertical"></i></button>
                <div class="dropdown-menu" style="left: 0; right: auto; top: 30px;">
                  <button class="dropdown-item btn-editar-inquilino" data-id="${inq.id}"><i class="ph ph-pencil-simple"></i> Editar</button>
                  <button class="dropdown-item danger btn-excluir-inquilino" data-id="${inq.id}" data-nome="${inq.nome}" data-status="${statusTexto}"><i class="ph ph-trash"></i> Excluir</button>
                </div>
              </div>

              <!-- CENTRO: Icone e Nome -->
              <div class="card-left-info" style="flex: 1; display: flex; align-items: center; gap: 12px;">
                <div class="kitnet-icon-small" style="color: #1e3a8a; font-weight: bold; border: 1px solid #e2e8f0; font-size: 16px;">
                  ${inicial}
                </div>
                <div>
                  <h4 class="kitnet-title-small" style="margin-bottom: 2px;">${inq.nome}</h4>
                  <div style="font-size:12px; color:#64748b; display: flex; align-items: center; gap: 4px;">
                    <i class="ph ph-phone"></i> ${inq.telefone}
                  </div>
                </div>
              </div>

              <!-- DIREITA: Badge -->
              <div style="margin-top: 4px;">
                <div class="${badgeClass}">${statusTexto}</div>
              </div>

            </div>

            <div style="display: flex; gap: 8px;">
              <button style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #1e3a8a; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; cursor: pointer;">
                <i class="ph ph-phone"></i> Ligar
              </button>
              <button style="flex: 1; padding: 8px; border-radius: 8px; border: none; background: #dcfce7; color: #15803d; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; cursor: pointer;">
                <i class="ph ph-whatsapp-logo"></i> WhatsApp
              </button>
            </div>
          </div>
        `;
        listaContainer.innerHTML += cardHTML;
      });

      // Aplica os eventos de clique no dropdown
      aplicarEventosDeCard();
    };

    const aplicarEventosDeCard = () => {
      // Dropdown (3 Pontinhos)
      document.querySelectorAll('.btn-opcoes').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
          btn.nextElementSibling.classList.toggle('show');
        });
      });

      document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
      });

      // Ação de Editar
      document.querySelectorAll('.btn-editar-inquilino').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          alert(`Em breve: Abrir modal de edição para o Inquilino ID: ${id}`);
        });
      });

      // Ação de Excluir
      document.querySelectorAll('.btn-excluir-inquilino').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const nome = e.currentTarget.getAttribute('data-nome');
          const status = e.currentTarget.getAttribute('data-status');

          let mensagem = `Tem certeza que deseja excluir permanentemente o inquilino "${nome}"?`;
          
          if (status === 'ATIVO') {
            mensagem = `⚠️ ATENÇÃO!\n\nO inquilino "${nome}" está ocupando uma propriedade no momento.\n\nAo excluir este inquilino, o aluguel será cancelado e a propriedade ficará VAGA.\n\nDeseja realmente excluir?`;
          }

          if (window.confirm(mensagem)) {
            deleteInquilino(id);
            atualizarListaNaTela();
          }
        });
      });
    };

    if (btnNovoInquilino) {
      btnNovoInquilino.addEventListener('click', () => {
        openNovoInquilinoModal(() => {
          atualizarListaNaTela();
        });
      });
    }

    atualizarListaNaTela();
  };

  return { html, setupEvents };
}

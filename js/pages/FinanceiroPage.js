// js/pages/FinanceiroPage.js
import { getKitnets } from '../database.js';

export async function renderFinanceiro() {
  const html = `
    <div id="pagina-financeiro" class="page-container">
      
      <!-- Visão Geral (Dashboard) -->
      <div style="background: #1e3a8a; border-radius: 16px; padding: 20px; color: white; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 500; opacity: 0.9;">Visão Geral do Mês</h3>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Card Recebido -->
          <div style="background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">Já Recebido</span>
              <div id="fin-total-recebido" style="font-size: 24px; font-weight: 700; color: #34d399; margin-top: 4px;">R$ 0,00</div>
            </div>
            <div style="width: 48px; height: 48px; background: rgba(52, 211, 153, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #34d399; font-size: 24px;">
              <i class="ph ph-check-circle"></i>
            </div>
          </div>

          <div style="display: flex; gap: 12px;">
            <!-- Card Pendente -->
            <div style="flex: 1; background: rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; opacity: 0.8;">A Receber</span>
              <div id="fin-total-pendente" style="font-size: 16px; font-weight: 700; color: #fbbf24; margin-top: 4px;">R$ 0,00</div>
            </div>
            <!-- Card Total Esperado -->
            <div style="flex: 1; background: rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; opacity: 0.8;">Esperado</span>
              <div id="fin-total-esperado" style="font-size: 16px; font-weight: 700; color: white; margin-top: 4px;">R$ 0,00</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Abas de Navegação -->
      <div class="filtros" style="margin-bottom: 16px;">
        <button class="tab-filter active" data-filtro="pendentes">Pendentes (<span id="qtd-pendentes">0</span>)</button>
        <button class="tab-filter" data-filtro="recebidos">Recebidos (<span id="qtd-recebidos">0</span>)</button>
      </div>

      <!-- Container da Lista -->
      <div id="lista-financeiro-container"></div>
    </div>
  `;

  const setupEvents = () => {
    let filtroAtual = 'pendentes';

    // Navegação nas Abas
    const botoesFiltro = document.querySelectorAll('#pagina-financeiro .tab-filter');
    botoesFiltro.forEach(btn => {
      btn.addEventListener('click', (e) => {
        botoesFiltro.forEach(b => b.classList.remove('active'));
        const clicado = e.currentTarget;
        clicado.classList.add('active');
        filtroAtual = clicado.getAttribute('data-filtro');
        atualizarTelaFinanceira();
      });
    });

    // Função Principal para Carregar os Dados
    const atualizarTelaFinanceira = () => {
      const kitnets = getKitnets();
      const contratos = JSON.parse(localStorage.getItem('myaluguel_contratos')) || [];
      const pagamentos = JSON.parse(localStorage.getItem('myaluguel_pagamentos')) || [];
      
      const listaContainer = document.getElementById('lista-financeiro-container');
      if (!listaContainer) return;

      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();

      // 1. Separar Pendentes (Lendo contratos ativos)
      const listaPendentes = [];
      contratos.filter(c => c.status !== 'encerrado').forEach(contrato => {
        const kitnet = kitnets.find(k => String(k.id) === String(contrato.kitnetId));
        if (!kitnet || !contrato.proximoVencimento) return;

        const [anoV, mesV, diaV] = contrato.proximoVencimento.split('-');
        const dataVenc = new Date(anoV, mesV - 1, diaV);
        const dataLimiteView = new Date();
        dataLimiteView.setDate(dataLimiteView.getDate() + 15);

        if (dataVenc <= dataLimiteView) {
          listaPendentes.push({
            contratoId: contrato.id,
            kitnetNome: kitnet.nome,
            inquilinoNome: contrato.inquilinoNome,
            valor: Number(contrato.valorAluguel || kitnet.valor || 0),
            vencimentoStr: contrato.proximoVencimento,
            vencimentoData: dataVenc,
            ciclo: kitnet.ciclo || 'Mensal',
            pagamentoForma: kitnet.pagamento || 'Pix'
          });
        }
      });

      listaPendentes.sort((a, b) => a.vencimentoData - b.vencimentoData);

      // 2. Separar Recebidos (Apenas do mês atual)
      const listaRecebidos = pagamentos.filter(p => {
        const [a, m] = p.dataPagamento.split('-');
        return Number(m) - 1 === mesAtual && Number(a) === anoAtual;
      });

      listaRecebidos.sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));

      // 3. Calcular Totais do Dashboard (Com proteção Number() rigorosa)
      const totalRecebido = listaRecebidos.reduce((acc, curr) => acc + Number(curr.valorPago || 0), 0);
      const totalPendente = listaPendentes.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      const totalEsperado = totalRecebido + totalPendente;

      // 4. Atualizar UI do Dashboard
      document.getElementById('fin-total-recebido').innerText = totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('fin-total-pendente').innerText = totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('fin-total-esperado').innerText = totalEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      document.getElementById('qtd-pendentes').innerText = listaPendentes.length;
      document.getElementById('qtd-recebidos').innerText = listaRecebidos.length;

      // 5. Renderizar a Lista Ativa
      listaContainer.innerHTML = '';
      const arrayAtual = filtroAtual === 'pendentes' ? listaPendentes : listaRecebidos;

      if (arrayAtual.length === 0) {
        listaContainer.innerHTML = `
          <div class="empty-state" style="border: 2px dashed #cbd5e1; border-radius: 24px; padding: 40px 20px;">
            <div style="margin: 0 auto 20px; background:#f1f5f9; width:64px; height:64px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#94a3b8;"><i class="ph ph-receipt" style="font-size:32px;"></i></div>
            <h3 style="color: #475569;">Nenhuma cobrança ${filtroAtual === 'pendentes' ? 'pendente próxima' : 'recebida neste mês'}.</h3>
          </div>
        `;
        return;
      }

      arrayAtual.forEach(item => {
        if (filtroAtual === 'pendentes') {
          // ================= CARD DE PENDENTE =================
          const valorSeguro = Number(item.valor || 0);
          const valorFormatado = valorSeguro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const [a, m, d] = item.vencimentoStr.split('-');
          
          const hoje = new Date();
          hoje.setHours(0,0,0,0);
          const diff = Math.round((item.vencimentoData - hoje) / (1000 * 60 * 60 * 24));
          
          let badgeHtml = '';
          if (diff < 0) badgeHtml = `<span style="background:#fef2f2; color:#ef4444; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; border:1px solid #fecaca;">Atrasado</span>`;
          else if (diff === 0) badgeHtml = `<span style="background:#fffbeb; color:#d97706; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; border:1px solid #fde68a;">Vence Hoje</span>`;
          
          listaContainer.innerHTML += `
            <div class="kitnet-card" style="padding: 16px; border-left: 4px solid ${diff < 0 ? '#ef4444' : '#f59e0b'};">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <div>
                  <h4 style="font-size: 16px; color: #1e293b; margin-bottom: 4px; display:flex; align-items:center; gap:8px;">
                    ${item.inquilinoNome} ${badgeHtml}
                  </h4>
                  <span style="font-size: 13px; color: #64748b;"><i class="ph ph-door"></i> ${item.kitnetNome}</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 11px; color: #64748b; text-transform:uppercase;">Vencimento</span>
                  <div style="font-weight: bold; color: #1e293b;">${d}/${m}/${a}</div>
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <div>
                  <span style="font-size: 11px; color: #64748b;">Valor (${item.pagamentoForma})</span>
                  <div style="font-weight: 700; color: #1e3a8a; font-size: 16px;">${valorFormatado}</div>
                </div>
                <div style="text-align:right;">
                  <span style="font-size: 11px; color: #64748b;">Ciclo</span>
                  <div style="font-weight: 600; color: #475569; font-size: 13px;">${item.ciclo}</div>
                </div>
              </div>

              <button class="btn-primary full-width btn-receber" data-contratoid="${item.contratoId}" data-valor="${item.valor}" data-ciclo="${item.ciclo}" data-vencimento="${item.vencimentoStr}" data-inquilino="${item.inquilinoNome}" style="padding: 12px; font-size: 14px; justify-content:center;">
                <i class="ph ph-hand-coins"></i> Receber Pagamento
              </button>
            </div>
          `;
        } else {
          // ================= CARD DE RECEBIDO =================
          const valorPagoSeguro = Number(item.valorPago || 0);
          const valorFormatado = valorPagoSeguro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const [a, m, d] = (item.dataPagamento || '').split('-');
          
          listaContainer.innerHTML += `
            <div class="kitnet-card" style="padding: 16px; border-left: 4px solid #10b981;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h4 style="font-size: 16px; color: #1e293b; margin-bottom: 4px;">${item.inquilinoNome || 'Inquilino'}</h4>
                  <span style="font-size: 13px; color: #64748b;"><i class="ph ph-calendar-check"></i> Pago em ${d || '00'}/${m || '00'}/${a || '0000'}</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 11px; color: #10b981; font-weight:bold; background:#ecfdf5; padding:4px 8px; border-radius:12px;">RECEBIDO</span>
                  <div style="font-weight: 800; color: #10b981; font-size: 16px; margin-top:8px;">${valorFormatado}</div>
                </div>
              </div>
            </div>
          `;
        }
      });

      aplicarEventosPagamento();
    };

    const aplicarEventosPagamento = () => {
      document.querySelectorAll('.btn-receber').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const contratoId = e.currentTarget.getAttribute('data-contratoid');
          const valor = Number(e.currentTarget.getAttribute('data-valor') || 0);
          const ciclo = e.currentTarget.getAttribute('data-ciclo');
          const vencimentoAntigo = e.currentTarget.getAttribute('data-vencimento');
          const inquilinoNome = e.currentTarget.getAttribute('data-inquilino');

          if(window.confirm(`Confirma o recebimento de R$ ${valor.toFixed(2)} de ${inquilinoNome}?`)) {
            registrarPagamento(contratoId, valor, ciclo, vencimentoAntigo, inquilinoNome);
          }
        });
      });
    };

    const registrarPagamento = (contratoId, valor, ciclo, vencimentoAntigo, inquilinoNome) => {
      const contratos = JSON.parse(localStorage.getItem('myaluguel_contratos')) || [];
      const pagamentos = JSON.parse(localStorage.getItem('myaluguel_pagamentos')) || [];
      
      const novoPagamento = {
        id: Date.now().toString(),
        contratoId: contratoId,
        inquilinoNome: inquilinoNome,
        valorPago: Number(valor || 0),
        dataPagamento: new Date().toISOString().split('T')[0],
        refVencimento: vencimentoAntigo
      };
      pagamentos.push(novoPagamento);
      localStorage.setItem('myaluguel_pagamentos', JSON.stringify(pagamentos));

      const cIndex = contratos.findIndex(c => String(c.id) === String(contratoId));
      if (cIndex > -1) {
        const [ano, mes, dia] = vencimentoAntigo.split('-');
        let novaData = new Date(ano, mes - 1, dia);

        if (ciclo === 'Diário') novaData.setDate(novaData.getDate() + 1);
        else if (ciclo === 'Semanal') novaData.setDate(novaData.getDate() + 7);
        else if (ciclo === 'Quinzenal') novaData.setDate(novaData.getDate() + 15);
        else novaData.setMonth(novaData.getMonth() + 1);

        contratos[cIndex].proximoVencimento = novaData.toISOString().split('T')[0];
        localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
      }

      alert('✅ Pagamento registrado com sucesso!');
      atualizarTelaFinanceira();
    };

    atualizarTelaFinanceira();
  };

  return { html, setupEvents };
}

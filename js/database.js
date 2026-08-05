// js/database.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// SUAS CHAVES DO SUPABASE
const supabaseUrl = 'https://wxsfgirutrnawlmjocol.supabase.co';
const supabaseKey = 'sb_publishable_A4Iwi4Scsyu9ce_S-VnCwg_kvtWyZe_';

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// INICIALIZAÇÃO DO BANCO LOCAL (Anti Tela-Branca)
// ==========================================
export function initDatabase() {
  if (!localStorage.getItem('myaluguel_kitnets')) localStorage.setItem('myaluguel_kitnets', JSON.stringify([]));
  if (!localStorage.getItem('myaluguel_inquilinos')) localStorage.setItem('myaluguel_inquilinos', JSON.stringify([]));
  if (!localStorage.getItem('myaluguel_contratos')) localStorage.setItem('myaluguel_contratos', JSON.stringify([]));
  if (!localStorage.getItem('myaluguel_pagamentos')) localStorage.setItem('myaluguel_pagamentos', JSON.stringify([]));
}

// ==========================================
// KITNETS
// ==========================================
export function getKitnets() {
  return JSON.parse(localStorage.getItem('myaluguel_kitnets')) || [];
}

export function addKitnet(kitnet) {
  kitnet.id = Date.now().toString();
  
  let kitnets = getKitnets();
  kitnets.push(kitnet);
  localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));

  if (supabase) {
    supabase.from('kitnets').insert([{
      nome: kitnet.nome, 
      valor: Number(kitnet.valor || 0), 
      ciclo: kitnet.ciclo || 'Mensal',
      endereco: kitnet.endereco || '', 
      contasInclusas: kitnet.contasInclusas === true || kitnet.contasInclusas === 'true', 
      status: kitnet.status || 'vago', 
      pagamento: kitnet.pagamento || 'Pix'
    }]).then(({ error }) => {
      if (error) console.error("Erro Supabase Kitnets:", error.message);
    });
  }
  return kitnet;
}

export function updateKitnet(id, updates) {
  let kitnets = getKitnets();
  const index = kitnets.findIndex(k => String(k.id) === String(id));
  if (index > -1) {
    kitnets[index] = { ...kitnets[index], ...updates };
    localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));
  }
}

export function deleteKitnet(id) {
  let kitnets = getKitnets();
  let contratos = getContratos();
  const kitnet = kitnets.find(k => String(k.id) === String(id));
  if (kitnet && kitnet.contratoId) {
    const cIndex = contratos.findIndex(c => String(c.id) === String(kitnet.contratoId));
    if (cIndex > -1) contratos[cIndex].status = 'encerrado';
    localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
  }
  kitnets = kitnets.filter(k => String(k.id) !== String(id));
  localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));
}

// ==========================================
// INQUILINOS (Com Supabase)
// ==========================================
export function getInquilinos() {
  return JSON.parse(localStorage.getItem('myaluguel_inquilinos')) || [];
}

export function addInquilino(inq) {
  inq.id = Date.now().toString();
  
  let inquilinos = getInquilinos();
  inquilinos.push(inq);
  localStorage.setItem('myaluguel_inquilinos', JSON.stringify(inquilinos));

  if (supabase) {
    supabase.from('inquilinos').insert([{
      nome: inq.nome,
      telefone: inq.telefone,
      email: inq.email || ''
    }]).then(({ error }) => {
      if (error) console.error("Erro Supabase Inquilinos:", error.message);
    });
  }
  return inq;
}

export function updateInquilino(id, updates) {
  let inquilinos = getInquilinos();
  const index = inquilinos.findIndex(i => String(i.id) === String(id));
  if (index > -1) {
    inquilinos[index] = { ...inquilinos[index], ...updates };
    localStorage.setItem('myaluguel_inquilinos', JSON.stringify(inquilinos));
  }
}

export function deleteInquilino(id) {
  let inquilinos = getInquilinos();
  let kitnets = getKitnets();
  let contratos = getContratos();
  let teveMudanca = false;

  kitnets.forEach(k => {
    if (String(k.inquilinoId) === String(id)) {
      if (k.contratoId) {
        const cIndex = contratos.findIndex(c => String(c.id) === String(k.contratoId));
        if (cIndex > -1) contratos[cIndex].status = 'encerrado';
      }
      k.status = 'vago'; k.inquilino = null; k.inquilinoId = null; k.contratoId = null;
      teveMudanca = true;
    }
  });
  if (teveMudanca) {
    localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));
    localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
  }
  inquilinos = inquilinos.filter(i => String(i.id) !== String(id));
  localStorage.setItem('myaluguel_inquilinos', JSON.stringify(inquilinos));
}

// ==========================================
// CONTRATOS (Com Supabase)
// ==========================================
export function getContratos() {
  return JSON.parse(localStorage.getItem('myaluguel_contratos')) || [];
}

export function addContrato(contrato) {
  contrato.id = Date.now().toString();
  contrato.status = 'ativo';
  
  let contratos = getContratos();
  contratos.push(contrato);
  localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));

  if (supabase) {
    supabase.from('contratos').insert([{
      kitnetId: contrato.kitnetId || null,
      inquilinoId: contrato.inquilinoId || null,
      inquilinoNome: contrato.inquilinoNome || '',
      dataInicio: contrato.dataInicio || null,
      proximoVencimento: contrato.proximoVencimento || null,
      valorAluguel: Number(contrato.valorAluguel || 0),
      deposito: Number(contrato.deposito || 0),
      vistoriaTipo: contrato.vistoriaTipo || '',
      vistoriaData: contrato.vistoriaData || null,
      vistoriaObs: contrato.vistoriaObs || '',
      status: 'ativo'
    }]).then(({ error }) => {
      if (error) console.error("Erro Supabase Contratos:", error.message);
    });
  }
  return contrato;
}

export function updateContrato(id, updates) {
  let contratos = getContratos();
  const index = contratos.findIndex(c => String(c.id) === String(id));
  if (index > -1) {
    contratos[index] = { ...contratos[index], ...updates };
    localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
  }
}

export function encerrarContratoPorKitnet(kitnetId) {
  let kitnets = getKitnets();
  let contratos = getContratos();
  const kitnetIndex = kitnets.findIndex(k => String(k.id) === String(kitnetId));
  if (kitnetIndex === -1) return;

  const contratoId = kitnets[kitnetIndex].contratoId;
  kitnets[kitnetIndex].status = 'vago';
  kitnets[kitnetIndex].inquilino = null;
  kitnets[kitnetIndex].inquilinoId = null;
  kitnets[kitnetIndex].contratoId = null;
  localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));

  if (contratoId) {
    const contratoIndex = contratos.findIndex(c => String(c.id) === String(contratoId));
    if (contratoIndex !== -1) {
      contratos[contratoIndex].status = 'encerrado';
      contratos[contratoIndex].dataFim = new Date().toISOString().split('T')[0];
      localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
    }
  }
}

// ==========================================
// PAGAMENTOS (Com Supabase)
// ==========================================
export function getPagamentos() {
  return JSON.parse(localStorage.getItem('myaluguel_pagamentos')) || [];
}

export function addPagamento(pagamento) {
  pagamento.id = Date.now().toString();
  
  let pagamentos = getPagamentos();
  pagamentos.push(pagamento);
  localStorage.setItem('myaluguel_pagamentos', JSON.stringify(pagamentos));

  if (supabase) {
    supabase.from('pagamentos').insert([{
      contratoId: pagamento.contratoId || null,
      inquilinoNome: pagamento.inquilinoNome || '',
      valorPago: Number(pagamento.valorPago || 0),
      dataPagamento: pagamento.dataPagamento || null,
      refVencimento: pagamento.refVencimento || null
    }]).then(({ error }) => {
      if (error) console.error("Erro Supabase Pagamentos:", error.message);
    });
  }
  return pagamento;
}

// js/database.js

// Inicializa dados padrão se não existirem no localStorage
export function initDatabase() {
  if (!localStorage.getItem('myaluguel_inquilinos')) {
    const inquilinosIniciais = [
      { id: 1, nome: 'Caio', telefone: '(11) 99965-43367', email: 'caio@teste.com' },
      { id: 2, nome: 'Marcos', telefone: '(11) 98775-2289', email: 'teste.7@gmail.com' }
    ];
    localStorage.setItem('myaluguel_inquilinos', JSON.stringify(inquilinosIniciais));
  }

  if (!localStorage.getItem('myaluguel_kitnets')) {
    const kitnetsIniciais = [
      { id: 1, nome: 'Kitnet 1', preco: 300, valor: 300, vencimento: 1, endereco: 'Rua abreu, n10', status: 'vago' },
      { id: 2, nome: 'Kitnet 2', preco: 450, valor: 450, vencimento: 5, endereco: 'Av. Brasil, 1500', status: 'vago' }
    ];
    localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnetsIniciais));
  }
}

// Funções de Inquilinos
export function getInquilinos() {
  return JSON.parse(localStorage.getItem('myaluguel_inquilinos')) || [];
}

export function addInquilino(inquilino) {
  const inquilinos = getInquilinos();
  const novoId = inquilinos.length > 0 ? Math.max(...inquilinos.map(i => i.id)) + 1 : 1;
  const novoObj = { id: novoId, ...inquilino };
  inquilinos.push(novoObj);
  localStorage.setItem('myaluguel_inquilinos', JSON.stringify(inquilinos));
  return novoObj;
}

// Funções de Kitnets
export function getKitnets() {
  return JSON.parse(localStorage.getItem('myaluguel_kitnets')) || [];
}

export function updateKitnet(kitnetId, dadosAtualizados) {
  const kitnets = getKitnets();
  const index = kitnets.findIndex(k => String(k.id) === String(kitnetId));

  if (index !== -1) {
    kitnets[index] = { ...kitnets[index], ...dadosAtualizados };
    localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));
    return kitnets[index];
  }
  return null;
}

export function addKitnet(kitnet) {
  const kitnets = getKitnets();
  // Gera um ID sequencial seguro
  const novoId = kitnets.length > 0 ? Math.max(...kitnets.map(k => Number(k.id))) + 1 : 1;
  const novoObj = { id: novoId, ...kitnet };
  kitnets.push(novoObj);
  localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));
  return novoObj;
}

// Funções de Pagamentos (Financeiro)
export function getPagamentos() {
  return JSON.parse(localStorage.getItem('myaluguel_pagamentos')) || [];
}

export function addPagamento(pagamento) {
  const pagamentos = getPagamentos();
  const novoId = pagamentos.length > 0 ? Math.max(...pagamentos.map(p => Number(p.id))) + 1 : 1;
  const novoObj = { id: novoId, createdAt: new Date().toISOString(), ...pagamento };
  
  pagamentos.push(novoObj);
  localStorage.setItem('myaluguel_pagamentos', JSON.stringify(pagamentos));
  
  return novoObj;
}



// Funções de Contratos / Aluguéis
export function getContratos() {
  return JSON.parse(localStorage.getItem('myaluguel_contratos')) || [];
}

export function addContrato(contrato) {
  const contratos = getContratos();
  const novoId = contratos.length > 0 ? Math.max(...contratos.map(c => c.id)) + 1 : 1;
  const novoObj = { id: novoId, createdAt: new Date().toISOString(), status: 'ativo', ...contrato };
  contratos.push(novoObj);
  localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
  return novoObj;
}

// ==========================================
// FUNÇÕES DE EXCLUSÃO
// ==========================================

export function deleteKitnet(id) {
  let kitnets = getKitnets();
  let contratos = JSON.parse(localStorage.getItem('myaluguel_contratos')) || [];
  
  // 1. Se a kitnet tinha um contrato ativo, marca como encerrado para sumir do radar
  const kitnet = kitnets.find(k => String(k.id) === String(id));
  if (kitnet && kitnet.contratoId) {
    const cIndex = contratos.findIndex(c => String(c.id) === String(kitnet.contratoId));
    if (cIndex > -1) { contratos[cIndex].status = 'encerrado'; }
    localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
  }

  // 2. Exclui a kitnet
  kitnets = kitnets.filter(k => String(k.id) !== String(id));
  localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));
}

export function deleteInquilino(id) {
  let inquilinos = getInquilinos();
  let kitnets = getKitnets();
  let contratos = JSON.parse(localStorage.getItem('myaluguel_contratos')) || [];
  let teveMudanca = false;

  // 1. Desocupa a kitnet e encerra o contrato caso ele estivesse ativo
  kitnets.forEach(k => {
    if (String(k.inquilinoId) === String(id)) {
      if (k.contratoId) {
        const cIndex = contratos.findIndex(c => String(c.id) === String(k.contratoId));
        if (cIndex > -1) { contratos[cIndex].status = 'encerrado'; }
      }
      k.status = 'vago';
      k.inquilino = null;
      k.inquilinoId = null;
      k.contratoId = null;
      teveMudanca = true;
    }
  });

  if (teveMudanca) {
    localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));
    localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
  }

  // 2. Exclui o inquilino
  inquilinos = inquilinos.filter(i => String(i.id) !== String(id));
  localStorage.setItem('myaluguel_inquilinos', JSON.stringify(inquilinos));
}





// ==========================================
// FUNÇÃO DE CHECK-OUT (ENCERRAR CONTRATO)
// ==========================================
export function encerrarContratoPorKitnet(kitnetId) {
  let kitnets = getKitnets();
  let contratos = JSON.parse(localStorage.getItem('myaluguel_contratos')) || [];

  const kitnetIndex = kitnets.findIndex(k => String(k.id) === String(kitnetId));
  if (kitnetIndex === -1) return;

  const kitnet = kitnets[kitnetIndex];
  const contratoId = kitnet.contratoId;

  // 1. Desocupa a kitnet (Libera para um novo morador)
  kitnets[kitnetIndex].status = 'vago';
  kitnets[kitnetIndex].inquilino = null;
  kitnets[kitnetIndex].inquilinoId = null;
  kitnets[kitnetIndex].contratoId = null;
  localStorage.setItem('myaluguel_kitnets', JSON.stringify(kitnets));

  // 2. Atualiza o contrato para "encerrado" (Mantém o histórico financeiro intacto)
  if (contratoId) {
    const contratoIndex = contratos.findIndex(c => String(c.id) === String(contratoId));
    if (contratoIndex !== -1) {
      contratos[contratoIndex].status = 'encerrado';
      // Salva a data exata em que o morador saiu (hoje)
      contratos[contratoIndex].dataFim = new Date().toISOString().split('T')[0];
      localStorage.setItem('myaluguel_contratos', JSON.stringify(contratos));
    }
  }
}

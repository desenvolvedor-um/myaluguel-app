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

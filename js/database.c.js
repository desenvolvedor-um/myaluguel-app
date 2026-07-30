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
      { id: 1, nome: 'Kitnet 1', preco: 300, vencimento: 1, endereco: 'Rua abreu, n10' },
      { id: 2, nome: 'Kitnet 2', preco: 450, vencimento: 5, endereco: 'Av. Brasil, 1500' }
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

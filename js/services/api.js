// Banco de dados em memória temporária
const mockDatabase = {
  kitnets: [
    { id: 1, nome: 'Kitnet 1', valor: 300, status: 'PAGO' },
    { id: 2, nome: 'Kitnet 2', valor: 1000, status: 'PENDENTE' },
    { id: 3, nome: 'Kitnet 3', valor: 800, status: 'PAGO' }
  ]
};

// Busca estatísticas financeiras
export async function fetchHomeStats() {
  const recebido = mockDatabase.kitnets
    .filter(k => k.status === 'PAGO')
    .reduce((acc, k) => acc + k.valor, 0);

  const pendente = mockDatabase.kitnets
    .filter(k => k.status === 'PENDENTE')
    .reduce((acc, k) => acc + k.valor, 0);

  return {
    totalRecebido: recebido,
    totalPendente: pendente
  };
}

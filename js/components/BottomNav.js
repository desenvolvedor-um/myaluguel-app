export function renderBottomNav(activeTab) {
  const navItems = [
    { id: 'inicio', label: 'INÍCIO', icon: 'ph-squares-four' },
    { id: 'propriedades', label: 'PROPRIEDADES', icon: 'ph-buildings' },
    { id: 'financeiro', label: 'FINANCEIRO', icon: 'ph-wallet' },
    { id: 'configuracoes', label: 'CONFIGURAÇÕES', icon: 'ph-gear' }
  ];

  return `
    <nav class="bottom-nav">
      ${navItems.map(item => `
        <button 
          class="nav-item ${activeTab === item.id ? 'active' : ''}" 
          data-tab="${item.id}"
        >
          <i class="ph ${item.icon}"></i>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

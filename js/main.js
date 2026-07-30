import { renderHome } from './pages/home.js';
import { renderKitnets } from './pages/KitnetsPage.js'; // 1. IMPORT NOVO AQUI
import { renderBottomNav } from './components/bottomNav.js';
import { renderTopHeader } from './components/topHeader.js';

const app = document.getElementById('app');
let currentTab = 'inicio';

// Função para alternar de tela
async function navigateTo(tab) {
  currentTab = tab;
  await updateUI();
}

// Atualiza o conteúdo da tela
async function updateUI() {
  let pageContent = '';
  let pageEvents = null;

  if (currentTab === 'inicio') {
    const home = await renderHome(navigateTo);
    pageContent = home.html;
    pageEvents = home.setupEvents;
  } else if (currentTab === 'kitnets') {
    // 2. NOVA CONDIÇÃO PARA A ABA DE KITNETS AQUI
    const kitnetsPage = await renderKitnets();
    pageContent = kitnetsPage.html;
    pageEvents = kitnetsPage.setupEvents;
  } else {
    pageContent = `<div class="page-container">Em desenvolvimento...</div>`;
  }

  // Desenha na tela: Topo + Conteúdo da Página + Menu Inferior
  app.innerHTML = `
    ${renderTopHeader()}
    <main>${pageContent}</main>
    ${renderBottomNav(currentTab)}
  `;

  if (pageEvents) pageEvents();

  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.getAttribute('data-tab');
      navigateTo(targetTab);
    });
  });
}

// Inicializa a aplicação
navigateTo('inicio');

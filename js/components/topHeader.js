// js/components/topHeader.js

export function renderTopHeader() {
  return `
    <header class="top-header">
      <div class="logo-area">
        <div class="logo-icon">M</div>
        <div class="logo-text">
          <h1>MyAluguel</h1>
          <span>PRO</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="icon-btn"><i class="ph ph-magnifying-glass"></i></button>
        <button class="icon-btn"><i class="ph ph-bell"></i></button>
        <button class="profile-btn">P</button>
      </div>
    </header>
  `;
}

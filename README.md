# Sistema de Saldo de Veículos - COMPESA (CMA e SUL)

Este projeto foi desenvolvido para otimizar e facilitar a gestão de frotas da **COMPESA** (Coordenações CMA e CPR SUL). O sistema permite o controle eficiente de saldos, manutenção e estoques diversos através de uma interface intuitiva e visual.

## 🚀 Funcionalidades

- **Importação de Dados**: Leitura automática de extratos de veículos via arquivos Excel (`.xls`, `.xlsx`) ou HTML do TicketLog.
- **Gestão de Manutenção**:
    - Identificação visual de veículos em manutenção.
    - Registro de histórico e anotações de serviços.
    - Solicitação de manutenção com geração de email pré-formatado.
- **Controle de Estoque**: Monitoramento de materiais como Água Mineral, Gás de Cozinha e Óleo de Máquina.
- **Dashboards Visuais**:
    - Gráficos interativos (Pizza) para análise de consumo e status.
    - Exibição clara de preços de combustíveis.
- **Exportação e Compartilhamento**:
    - Geração de imagens do painel para relatórios rápidos via WhatsApp ou Email.
    - Suporte a PWA (Progressive Web App) para instalação em dispositivos móveis.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza uma stack moderna e focada em performance e usabilidade:

### Front-end
- **[HTML5](https://developer.mozilla.org/pt-BR/docs/Web/HTML)**: Estrutura semântica e acessível.
- **[CSS3](https://developer.mozilla.org/pt-BR/docs/Web/CSS)**: Estilização responsiva.
- **[JavaScript (ES6+)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)**: Lógica de interação e manipulação do DOM.

### Estilização
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework utility-first para design rápido e responsivo.

### Backend & Dados
- **[Supabase](https://supabase.com/)**: Backend-as-a-Service utilizado para armazenamento em tempo real e autenticação.

### Bibliotecas Principais
- **[Chart.js](https://www.chartjs.org/)**: Renderização de gráficos interativos para visualização de dados.
- **[SheetJS (xlsx)](https://sheetjs.com/)**: Processamento e leitura de planilhas Excel no navegador.
- **[html2canvas](https://html2canvas.hertzen.com/)**: Captura de tela do dashboard para exportação de imagens.

### Ferramentas de Desenvolvimento
- **[Vite](https://vitejs.dev/) / Live Server**: Servidor de desenvolvimento local.
- **[PostCSS](https://postcss.org/)**: Processamento de CSS.
- **[pnpm](https://pnpm.io/)** / **npm**: Gerenciamento de pacotes.

## 📦 Como Usar

1. **Instalação**:
   Certifique-se de ter o Node.js instalado.
   ```bash
   pnpm install
   # ou
   npm install
   ```

2. **Executar Localmente**:
   ```bash
   pnpm run dev
   # ou
   npm run dev
   ```

3. **Utilização**:
   - Abra o sistema no navegador.
   - Clique em **"Enviar Arquivo"** e carregue o extrato do TicketLog.
   - Utilize os botões de ação para gerenciar manutenções ou visualizar gráficos.

---
*Desenvolvido para simplificar a gestão de frotas da COMPESA.*

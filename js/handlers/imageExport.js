import { copyToClipboard } from '../utils.js';

function formatDateTime() {
  const now = new Date();
  const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][now.getDay()];
  return `SALDO! ${dayName} - ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

async function captureCanvas() {
    const content = document.getElementById('mainContent');
    const buttonContainer = document.querySelector('.button-container');

    // Armazenar estilos originais para restaurar depois
    const originalBodyOverflow = document.body.style.overflow;
    const originalContentWidth = content.style.width;
    const originalContentMaxWidth = content.style.maxWidth;
    const originalContentMargin = content.style.margin;
    const originalContentPosition = content.style.position;
    const originalContentLeft = content.style.left;
    const originalContentTransform = content.style.transform;

    // Temporariamente ocultar botões e rolar para o topo para uma captura limpa
    buttonContainer.style.display = 'none';
    window.scrollTo(0, 0);

    // --- Forçar dimensões de desktop para a captura ---
    document.body.style.overflow = 'hidden'; // Evita barras de rolagem indesejadas
    content.style.width = '1280px'; // Força a largura de desktop
    content.style.maxWidth = '1280px'; // Garante que não seja restringido por max-width menores
    content.style.margin = '0 auto'; // Centraliza o conteúdo
    content.style.position = 'relative'; // Reseta qualquer posicionamento mobile
    content.style.left = 'auto';
    content.style.transform = 'none'; // Reseta quaisquer transformações

    const canvas = await html2canvas(content, {
        scale: 2, // Mantém a escala para uma resolução mais alta
        useCORS: true,
        windowHeight: content.scrollHeight // Captura a altura total do conteúdo
    });

    // --- Restaurar estilos originais após a captura ---
    document.body.style.overflow = originalBodyOverflow;
    content.style.width = originalContentWidth;
    content.style.maxWidth = originalContentMaxWidth;
    content.style.margin = originalContentMargin;
    content.style.position = originalContentPosition;
    content.style.left = originalContentLeft;
    content.style.transform = originalContentTransform;
    buttonContainer.style.display = ''; // Exibe os botões novamente

    return canvas;
}

export async function downloadImage() {
  copyToClipboard(formatDateTime());
  const canvas = await captureCanvas();
  const link = document.createElement('a');
  link.download = 'Saldo dos Veiculos.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function shareImage() {
  copyToClipboard(formatDateTime());
  try {
    const canvas = await captureCanvas();
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'Saldo dos Veiculos.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Extrato de Veículos', text: 'Confira o saldo atualizado.' });
    } else {
      alert('Seu navegador não suporta compartilhamento de imagem.');
    }
  } catch (err) {
    alert('Erro ao compartilhar: ' + err.message);
  }
}
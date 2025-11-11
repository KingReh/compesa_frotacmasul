import { copyToClipboard } from '../utils.js';

function formatDateTime() {
  const now = new Date();
  const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][now.getDay()];
  return `SALDO! ${dayName} - ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

async function captureCanvas() {
    const content = document.getElementById('mainContent');
    const buttonContainer = document.querySelector('.button-container');
    buttonContainer.style.display = 'none';
    window.scrollTo(0, 0);
    const canvas = await html2canvas(content, { scale: 2, useCORS: true });
    buttonContainer.style.display = '';
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
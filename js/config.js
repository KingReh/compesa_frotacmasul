// Configuração do Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  'https://wnuialureqofvgefdfol.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudWlhbHVyZXFvZnZnZWZkZm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTQ2MzQsImV4cCI6MjA2OTczMDYzNH0.d_LEjNTIAuSagsaaJCsBWI9SaelBt4n8qzfxAPlRKgU'
);

// Dados Iniciais
export const desiredPlates = [
  'RZO3G50', 'RZO2H73', 'QYY0G07', 'SJG1G06', 'SJE0D78',
  'PCA5320', 'KII8770', 'SOD6G88', 'PEW3772', 'MAQ0005',
  'MAQ0003'
];

export const placasCPRSUL = ['SJG1G06', 'SJE0D78', 'MAQ0003', 'RZO2H73'];

export const coordinations = ['CMA SUL', 'CPR SUL'];

export const vehicles = [
  { plate: 'SJG1G06', locadora: 'CSfrotas' },
  { plate: 'SJE0D78', locadora: 'CSfrotas' },
  { plate: 'QYY0G07', locadora: 'Locadora de Veículos Caxangá' },
  { plate: 'RZO2H73', locadora: 'Locavel' },
  { plate: 'RZO3G50', locadora: 'Locavel' },
  { plate: 'SOD6G88', locadora: 'PBF' },
  { plate: 'KII8770', locadora: 'COMPESA' },
  { plate: 'PCA5320', locadora: 'COMPESA' },
  { plate: 'PEW3772', locadora: 'COMPESA' },
  { plate: 'PCA7534', locadora: 'COMPESA' }
];

export const drivers = [
  { name: 'Flávio Rosendo', contact: '(81) 99707-2067' },
  { name: 'Flávio Simões', contact: '(81) 98820-2260' },
  { name: 'João Alves', contact: '(81) 98870-1779' },
  { name: 'Swami', contact: '(81) 99488-5344' },
  { name: 'Jonas', contact: '(81) 98365-0294' },
  { name: 'Abraão', contact: '(81) 98336-1267' },
  { name: 'Jéssica Alves', contact: '(81) 99880-9252' }
];

export const units = [
  {
    name: 'ETA PIRAPAMA',
    address: 'ETA PIRAPAMA - BR Sul KM 100, SN - Pirapama, Cabo de Santo Agostinho - PE',
    maps: 'https://maps.app.goo.gl/yuG8uUnHr28QanT87'
  },
  {
    name: 'ETA SUAPE',
    address: 'ETA SUAPE - Complexo Portuário s/n - Engenho Massangana - Ipojuca-PE',
    maps: 'https://maps.app.goo.gl/qBFx6KXpLFefRUYx5'
  },
  {
    name: 'ETA GURJAU',
    address: 'ETA GURJAU - Rua do Vento, S/N - Gurjaú - Cabo de Santo Agostinho-PE',
    maps: 'https://maps.app.goo.gl/djcVeUS8tscNxpXo9'
  }
];

export const fuelPrices = {
  gasolina: 6.25,
  diesel: 6.20,
  gnv: 4.77,
  etanol: 4.27,
  arla32: 4.00
};

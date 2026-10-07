// Lee coverage/coverage-summary.json (generado por Jest) e imprime una tabla
// en Markdown. En GitHub Actions se manda también al "Job Summary".
import { readFileSync } from 'node:fs';

const THRESHOLD = 70;
const { total } = JSON.parse(
  readFileSync('coverage/coverage-summary.json', 'utf8'),
);

const rows = ['statements', 'branches', 'functions', 'lines'].map((key) => {
  const pct = total[key].pct;
  const ok = pct >= THRESHOLD ? '✅' : '❌';
  return `| ${key} | ${total[key].covered}/${total[key].total} | ${pct}% | ${ok} |`;
});

console.log(`## 📊 Cobertura de código (mínimo ${THRESHOLD}%)\n`);
console.log('| Métrica | Cubiertas | % | Estado |');
console.log('|---|---|---|---|');
console.log(rows.join('\n'));

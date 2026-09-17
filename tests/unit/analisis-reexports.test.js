import { describe, expect, it } from 'vitest';
import { ah } from '../../js/modules/analisis/ah.js';
import { av } from '../../js/modules/analisis/av.js';
import { razones } from '../../js/modules/analisis/razones.js';
import { dupont } from '../../js/modules/analisis/dupont.js';
import { cntCno } from '../../js/modules/analisis/cnt-cno.js';
import { eoaf } from '../../js/modules/analisis/eoaf.js';
import { efe } from '../../js/modules/analisis/efe.js';
import { computeAH, computeAV, computeRazones, computeDuPont,
  computeCNTCNO, computeEOAF, computeEFE } from '../../js/modules/analisis/index.js';

// These shells used to re-export names that index.js never exported, so importing
// them threw a SyntaxError. This test fails fast if the contract drifts again.
describe('reexportaciones de análisis', () => {
  it('los shells exponen funciones reales, no nombres inexistentes', () => {
    expect([ah, av, razones, dupont, cntCno, eoaf, efe].every(fn => typeof fn === 'function')).toBe(true);
    expect([computeAH, computeAV, computeRazones, computeDuPont,
      computeCNTCNO, computeEOAF, computeEFE].every(fn => typeof fn === 'function')).toBe(true);
  });
});

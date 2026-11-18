import { describe, it, expect } from 'vitest';
import { NPCS } from '../src/data/npcs.js';
import { createInitialGameState } from '../src/engine/gameState.js';
import {
  getNpcInteractionStatus,
  interactWithNpc,
  startDuoMissionWithNpc
} from '../src/engine/relationships.js';

describe('relationships — 20 NPC Canon, Límites Anuales, Romance, Alianzas y Dúos', () => {
  it('inicializa relaciones con los 20 personajes canon incluyendo confianza y romance', () => {
    const state = createInitialGameState({ name: 'Socializador', startAge: 16 });
    expect(Object.keys(state.relationships).length).toBe(20);
    expect(NPCS.length).toBe(20);

    const gojoRel = state.relationships.npc_satoru_gojo;
    expect(typeof gojoRel.friendship).toBe('number');
    expect(typeof gojoRel.respect).toBe('number');
    expect(typeof gojoRel.rivalry).toBe('number');
    expect(typeof gojoRel.trust).toBe('number');
    expect(typeof gojoRel.romance).toBe('number');
  });

  it('respeta el límite de 2 interacciones por NPC al año', () => {
    const state = createInitialGameState({ name: 'Límite Social', startAge: 16 });

    expect(getNpcInteractionStatus(state, 'npc_yuji_itadori').canInteract).toBe(true);
    expect(interactWithNpc(state, 'npc_yuji_itadori', 'talk').ok).toBe(true);
    expect(interactWithNpc(state, 'npc_yuji_itadori', 'talk').ok).toBe(true);

    expect(getNpcInteractionStatus(state, 'npc_yuji_itadori').canInteract).toBe(false);
    expect(interactWithNpc(state, 'npc_yuji_itadori', 'talk').ok).toBe(false);
  });

  it('permite citas románticas a los 15+ años, matrimonio a los 18+ años y misiones en dúo', () => {
    const teen = createInitialGameState({ name: 'Adolescente', startAge: 16 });
    teen.relationships.npc_yuta_okkotsu.friendship = 70;
    teen.relationships.npc_yuta_okkotsu.respect = 65;

    const dateRes = interactWithNpc(teen, 'npc_yuta_okkotsu', 'date_romance');
    expect(dateRes.ok).toBe(true);
    expect(teen.relationships.npc_yuta_okkotsu.romance).toBeGreaterThan(0);

    // A los 16 no puede casarse todavía
    teen.relationships.npc_yuta_okkotsu.romance = 80;
    expect(interactWithNpc(teen, 'npc_yuta_okkotsu', 'marry').ok).toBe(false);

    // A los 18+ sí puede casarse
    teen.player.age = 19;
    teen.turn.npcInteractions = {};
    teen.turn.totalSocialThisYear = 0;
    const marryRes = interactWithNpc(teen, 'npc_yuta_okkotsu', 'marry');
    expect(marryRes.ok).toBe(true);
    expect(teen.family.spouse).toBe('Yuta Okkotsu');

    const duoRes = startDuoMissionWithNpc(teen, 'npc_yuta_okkotsu', 'mission_abandoned_school');
    expect(duoRes.ok).toBe(true);
    expect(teen.combat.ally.name).toBe('Yuta Okkotsu');
  });
});

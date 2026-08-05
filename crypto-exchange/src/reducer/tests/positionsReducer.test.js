import { describe, it, expect } from 'vitest';
import { positionsReducer, initialPositionsState } from '../positionsReducer';

const samplePosition = { id: 1, type: 'LONG', leverage: 10, margin: 5, entryPrice: 100, liquidationPrice: 90 };

describe('positionsReducer', () => {
  it('starts with an empty array', () => {
    expect(initialPositionsState).toEqual([]);
  });

  it('OPEN_POSITION adds a position with status OPEN', () => {
    const state = positionsReducer([], { type: 'OPEN_POSITION', payload: samplePosition });
    expect(state).toHaveLength(1);
    expect(state[0].status).toBe('OPEN');
    expect(state[0].id).toBe(1);
  });

  it('CLOSE_POSITION removes only the matching id', () => {
    const secondPosition = { ...samplePosition, id: 2 };
    const state = [{ ...samplePosition, status: 'OPEN' }, { ...secondPosition, status: 'OPEN' }];
    const result = positionsReducer(state, { type: 'CLOSE_POSITION', payload: { id: 1 } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('LIQUIDATE_POSITION marks the matching position as LIQUIDATED without removing it', () => {
    const state = [{ ...samplePosition, status: 'OPEN' }];
    const result = positionsReducer(state, { type: 'LIQUIDATE_POSITION', payload: { id: 1 } });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('LIQUIDATED');
  });

  it('RESET clears all positions', () => {
    const state = [{ ...samplePosition, status: 'OPEN' }];
    expect(positionsReducer(state, { type: 'RESET' })).toEqual([]);
  });

  it('returns the same state for unknown action types', () => {
    const state = [{ ...samplePosition, status: 'OPEN' }];
    expect(positionsReducer(state, { type: 'UNKNOWN' })).toBe(state);
  });
});
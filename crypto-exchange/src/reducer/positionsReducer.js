// Position lifecycle এখন predictable action-এর মাধ্যমে বদলায় - real backend থেকে
// order fill/liquidation event আসলে সরাসরি এই একই actions dispatch করলেই হবে।
export const initialPositionsState = [];

export function positionsReducer(state, action) {
  switch (action.type) {
    case 'OPEN_POSITION':
      return [...state, { ...action.payload, status: 'OPEN' }];

    case 'CLOSE_POSITION':
      return state.filter((p) => p.id !== action.payload.id);

    case 'LIQUIDATE_POSITION':
      return state.map((p) =>
        p.id === action.payload.id ? { ...p, status: 'LIQUIDATED' } : p
      );

    case 'RESET':
      return initialPositionsState;

    default:
      return state;
  }
}
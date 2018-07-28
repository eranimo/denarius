// @flow

import { Analysis, Consideration } from '../analysis';

test('analysis', () => {

  const opinion: Analysis = new Analysis({
    opinion: 0
  });

  const good_1: Consideration = new Consideration(5, (state: any) => {
    return {
      ...state,
      opinion: state.opinion + 1
    };
  });

  opinion.add(good_1);

  expect(opinion.considerations.length).toBe(1);
  expect(opinion.decide().opinion).toBe(1);
});

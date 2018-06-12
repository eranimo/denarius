
// A consideration is a function that effects something
export class Consideration {
  impact: number;
  test: Function;

  constructor(impact: number, test: (state) => Object) {
    this.impact = impact;
    this.test = test;
  }
}

export class Analysis {
  state;
  considerations: Array<Consideration>;

  constructor(state) {
    this.state = state;
    this.considerations = [];
  }

  add(consideration: Consideration) {
    this.considerations.push(consideration);
  }

  decide() {
    this.considerations.forEach((con: Consideration) => {
      const newState = con.test(this.state);
      this.state = { ...newState };
    });

    return this.state;
  }
}

// @flow
export const LOGIC: { [LogicName]: string } = {
  producer: 'producer',
};

type LogicName = string;

export default class Logic {
  entity: any;

  constructor(entity: any) {
    this.entity = entity;
    this.onInit();
  }

  onInit() {}

  work() {
    throw new Error('Not implemented!');
  }

  onRoundEnd() {
    console.log('Round end');
  }
}

export class ProducerLogic extends Logic {
  idleRounds: number;

  onInit() {
    this.idleRounds = 0;
  }

  work(): boolean {
    return true;
  }
}

export const jobLogicMap: Map<LogicName, Class<Logic>> = new Map([
  [LOGIC.producer, ProducerLogic],
]);

export class LogicError extends Error {}

const emptyClass: Function = class {};
export const HasLogic: Function =
  (base: Function = emptyClass): Function =>
    // $FlowFixMe
    class extends base {
      logic: Set<LogicName>;

      constructor() {
        super();
        this.logic = new Set();
      }

      addLogic(logicName: LogicName): boolean {
        // does this logic exist
        if (!jobLogicMap.has(logicName)) {
          throw new LogicError(`Logic '${logicName}' not found`);
        }

        // do we have this logic?
        if (!this.hasLogic(logicName)) {
          // $FlowFixMe
          const logicClass: Class<Logic> = jobLogicMap.get(logicName);
          const logic: Logic = new logicClass(this);
          Object.defineProperty(this, logicName, {
            value: logic,
            enumerable: true
          });
          this.logic.add(logicName);

          return true;
        }
        throw new LogicError(`Already has logic '${logicName}'`);
      }

      hasLogic(logicName: LogicName): boolean {
        return this.logic.has(logicName);
      }
    };

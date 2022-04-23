import { checkpoint, retry, TryError } from '../src';

describe('index', () => {
  describe('checkpoint', () => {
    describe('when called with a function which always fails', () => {
      it('should end up raising an error', async () => {
        const result = await checkpoint({}, () => {
          retry();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof Error).toBe(true);
      });
    });

    describe('when called with a function which always succeeds', () => {
      it('should end up returning the result', async () => {
        const result = await checkpoint({}, () => {
          'it succeeds';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof Error).toBe(false);
      });
    });

    describe('when called with a function which fails before succeeding', () => {
      const functionSuccesses = [false, true];

      it('should not raise an error', async () => {
        let i = 0;
        const result = await checkpoint({}, () => {
          if (functionSuccesses[i]) return;

          i += 1;
          retry();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof Error).toBe(false);
      });

      it('should call the function as many times as it fails', async () => {
        let i = 0;
        await checkpoint({}, () => {
          if (functionSuccesses[i]) return;

          i += 1;
          retry();
        });

        expect(i).toBe(1);
      });
    });

    describe('when function fails unexpectedly', () => {
      it('should raise an error', async () => {
        const result = await checkpoint({}, () => {
          throw new Error('some unexpected error');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof Error).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(result.message).toBe('some unexpected error');
      });
    });

    describe('when nesting different checkpoints', () => {
      describe('when retry is called without specifying checkpoint', () => {
        const functionSuccesses = [false, false, true];
        it('should go back to the last checkpoint', async () => {
          let firstCheckpointCounter = 0;
          let secondCheckpointCounter = 0;
          await checkpoint({}, async () => {
            firstCheckpointCounter += 1;

            await checkpoint({}, () => {
              secondCheckpointCounter += 1;

              if (functionSuccesses[secondCheckpointCounter]) return;
              retry();
            });
          });

          expect(firstCheckpointCounter).toBe(1);
          expect(secondCheckpointCounter).toBe(2);
        });
      });
    });

    describe('when retry is called specifying an older checkpoint', () => {
      const functionSuccesses = [false, false, true];
      it('should go back to the older checkpoint', async () => {
        let firstCheckpointCounter = 0;
        let secondCheckpointCounter = 0;
        await checkpoint({ name: 'first' }, async () => {
          firstCheckpointCounter += 1;

          await checkpoint({}, () => {
            secondCheckpointCounter += 1;

            if (functionSuccesses[secondCheckpointCounter]) return;
            retry('first');
          });
        });

        expect(firstCheckpointCounter).toBe(2);
        expect(secondCheckpointCounter).toBe(2);
      });
    });

    describe('when retry is called specifying an unkown checkpoint', () => {
      it('should raise a TryError', async () => {
        const result = await checkpoint({}, () => {
          retry('unknown');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof TryError).toBe(true);
      });
    });

    describe('when an onRetry callback has been set', () => {
      it('should call the on retry callback', async () => {
        let onRetryCalled = false;
        function onRetry() {
          onRetryCalled = true;
        }

        await checkpoint({ onRetry }, () => {
          retry();
        }).catch(() => null);

        expect(onRetryCalled).toBe(true);
      });
    });
  });
});

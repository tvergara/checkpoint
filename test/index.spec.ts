import { checkpoint, Retry } from '../src';

describe('index', () => {
  describe('checkpoint', () => {
    describe('when called with a function which always fails', () => {
      it('should end up raising an error', async () => {
        const result = await checkpoint(1, () => {
          throw new Retry('failure');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof Error).toBe(true);
      });
    });

    describe('when called with a function which always succeeds', () => {
      it('should end up returning the result', async () => {
        const result = await checkpoint(1, () => {
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
        const result = await checkpoint(1, () => {
          if (functionSuccesses[i]) return;

          i += 1;
          throw new Retry('failure');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof Error).toBe(false);
      });

      it('should call the function as many times as it fails', async () => {
        let i = 0;
        await checkpoint(1, () => {
          if (functionSuccesses[i]) return;

          i += 1;
          throw new Retry('failure');
        });

        expect(i).toBe(1);
      });
    });

    describe('when function fails unexpectedly', () => {
      it('should raise an error', async () => {
        const result = await checkpoint(1, () => {
          throw new Error('some unexpected error');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        }).catch(error => error);

        expect(result instanceof Error).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(result.message).toBe('some unexpected error');
      });
    });
  });
});

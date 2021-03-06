export class TryError extends Error {}

export interface checkpointOptions {
  retries?: number;
  logger?: (arg0: string) => void;
  name?: string;
  onRetry?: () => void | Promise<void>;
}

export function retry(checkpointName?: string): void {
  throw new TryError(checkpointName);
}

export async function checkpoint(
  options: checkpointOptions = {},
  func: () => void | Promise<void>
): Promise<void> {
  const {
    retries = 1,
    logger = null,
    name = null,
    onRetry = () => {
      return;
    },
  } = options;

  logger?.('Checkpoint registered');
  for (let i = 0; i <= retries; i++) {
    logger?.(`Try number i: ${i}`);
    try {
      await func();
      logger?.('Checkpoint passed');
      return;
    } catch (error) {
      if (isRetryableError(error, name)) {
        logger?.(`Try number i: ${i} failed`);
        await onRetry();
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Checkpoint failed after ${retries} retries`);
}

function isRetryableError(
  error: Error,
  checkpointName: string | null
): boolean {
  return (
    error instanceof TryError &&
    (error.message === checkpointName || error.message === '')
  );
}

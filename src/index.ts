export class TryError extends Error {}

export function retry(): void {
  throw new TryError();
}

export async function checkpoint(
  maxRetries: number,
  func: () => void | Promise<void>
): Promise<void> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      await func();
      return;
    } catch (error) {
      if (error instanceof TryError) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(`checkpoint failed after ${maxRetries} retries`);
}

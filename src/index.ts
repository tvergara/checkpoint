export class Retry extends Error {}

export async function checkpoint(
  maxRetries: number,
  func: () => void | Promise<void>
) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      await func();
      return;
    } catch (error) {
      if (error instanceof Retry) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(`checkpoint failed after ${maxRetries} retries`);
}

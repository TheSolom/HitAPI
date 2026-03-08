export async function randomDelay(): Promise<void> {
    const delay = 100 + Math.random() * 400;
    await new Promise((resolve) => setTimeout(resolve, delay));
}

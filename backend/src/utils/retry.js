export async function retry(fn, retries = 3) {
  let delay = 500;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;

      await new Promise((res) => setTimeout(res, delay));

      delay *= 2;
    }
  }
}

export const AI_BATCH_SIZE = 10;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// 배치를 병렬로 실행하고, 실패한 배치는 건너뛴 채 성공한 결과만 모은다.
export async function runBatches<I, O>(
  items: I[],
  worker: (batch: I[]) => Promise<O[]>,
  size = AI_BATCH_SIZE,
): Promise<O[]> {
  const settled = await Promise.allSettled(chunk(items, size).map(worker));
  return settled.flatMap((r) => {
    if (r.status === "fulfilled") return r.value;
    console.error("Claude 배치 실패", r.reason);
    return [];
  });
}

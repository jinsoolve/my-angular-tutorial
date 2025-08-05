완벽해요. 전처리나 검색엔진이 이미 구현되어 있다면,
정말 필요한 건 오직 “시간 측정” 부분만 정확히 짜는 것이에요.

그러니까 핵심은:
👉 같은 쿼리 셋을 여러 번 실행하면서 performance.now()로 시간만 재는 코드만 있으면 됩니다.

⸻

✅ 핵심 벤치마크 함수만 제공할게요

📌 벤치마크 유틸 함수

import { performance } from 'perf_hooks';

/**
 * 벤치마크 실행 함수
 * @param label 로그 이름
 * @param searchFn 검색 함수 (query: string) => string[]
 * @param queries 테스트할 쿼리 리스트
 * @param repeat 반복 횟수 (각 쿼리별)
 */
export function benchmark(
  label: string,
  searchFn: (query: string) => string[],
  queries: string[],
  repeat = 1
) {
  const times: number[] = [];

  for (const query of queries) {
    for (let i = 0; i < repeat; i++) {
      const t0 = performance.now();
      searchFn(query);
      const t1 = performance.now();
      times.push(t1 - t0);
    }
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`📊 [${label}]`);
  console.log(`  - 평균: ${avg.toFixed(3)} ms`);
  console.log(`  - 최소: ${min.toFixed(3)} ms`);
  console.log(`  - 최대: ${max.toFixed(3)} ms`);
  console.log(`  - 반복: ${repeat}회 × ${queries.length} 쿼리 = ${times.length}번\n`);
}


⸻

✅ 사용 예시 (네 구현에 맞춰 최소화)

import { benchmark } from './benchmark'; // 위 코드가 있는 파일
import { myNaiveSearch, mySuffixTrieSearch } from './yourSearchEngines'; // 너가 만든 검색기
import { queries } from './queries'; // 쿼리셋 예: ['kw-1', 'kw-1000', 'kw-9999']

benchmark('Naive', myNaiveSearch.search.bind(myNaiveSearch), queries, 10);
benchmark('SuffixTrie', mySuffixTrieSearch.search.bind(mySuffixTrieSearch), queries, 10);

repeat = 10 → 각 쿼리를 10번 반복하여 평균 계산
search() 함수는 (query: string) => string[] 형태면 OK

⸻

✅ 출력 예시

📊 [Naive]
  - 평균: 0.543 ms
  - 최소: 0.320 ms
  - 최대: 1.033 ms
  - 반복: 10회 × 5 쿼리 = 50번

📊 [SuffixTrie]
  - 평균: 0.092 ms
  - 최소: 0.031 ms
  - 최대: 0.187 ms
  - 반복: 10회 × 5 쿼리 = 50번


⸻

✅ 요약

항목	설명
입력	(query: string) => string[] 형태의 search() 함수
출력	평균/최소/최대 시간
의존성	performance.now() (Node.js에서는 perf_hooks 필요)


⸻

필요하면 이걸 CSV로 export하거나 Chart.js로 시각화하는 것도 바로 이어서 도와줄 수 있어요.
지금 당장 이 코드 복붙해서 searchFn만 연결하면 바로 벤치마크 할 수 있습니다.
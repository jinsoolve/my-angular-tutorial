좋아요!
queries는 성능 테스트에 사용할 검색어 목록이에요.
→ 즉, search("light"), search("kw-100") 등 호출할 때 넘겨줄 테스트 쿼리 문자열 리스트를 의미합니다.

⸻

✅ 1. 간단한 예시 (수동 정의)

const queries = ['light', 'kw-1000', 'kw-1234', 'kw-9999', '조명'];

이렇게 직접 입력하면 됩니다.

⸻

✅ 2. 데이터 기반으로 랜덤하게 추출하는 법

만약 dummy_data.json을 기반으로 실존하는 키워드 중 일부를 자동 추출하고 싶다면:

🔧 예시 코드

function getRandomQueries(data: { id: string; keyword: string }[], count: number): string[] {
  const uniqueKeywords = Array.from(new Set(data.map(d => d.keyword)));
  const shuffled = uniqueKeywords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

✅ 사용 예

const flatData: { id: string; keyword: string }[] = JSON.parse(fs.readFileSync('dummy_data.json', 'utf-8'));
const queries = getRandomQueries(flatData, 10); // 10개의 랜덤 키워드


⸻

✅ 3. 주의: 존재하지 않는 쿼리도 넣고 싶다면?

성능 비교 시 아래처럼 존재하는 쿼리 + 존재하지 않는 쿼리 섞는 것도 좋아요:

const queries = ['light', 'kw-1234', 'zzzzz', '조명', 'nonexistent'];

	•	존재하는 쿼리: 일반적인 성능
	•	존재하지 않는 쿼리: 최악 시간 (miss case) 성능 확인

⸻

✅ 결론

목적	방법
빠르게 테스트	const queries = ['kw-1', 'light', '조명']
실제 데이터 기반 랜덤 추출	getRandomQueries(data, N) 사용
실패 케이스도 포함	'nonexistent', 'xxxxx' 같은 문자열 추가


⸻

필요하면 쿼리 길이/접두어/중간검색 등 특성별로 쿼리셋을 생성하는 함수도 만들어줄게요.
지금 바로 쿼리를 자동으로 뽑고 싶다면 어떤 기준으로 뽑을지 말해줘!
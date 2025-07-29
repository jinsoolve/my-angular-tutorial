https://github.com/ng-bootstrap/ng-bootstrap/blob/master/CONTRIBUTING.md

https://github.com/ng-bootstrap/ng-bootstrap/wiki/Contributions%3A-Code-conventions


“패턴을 포함하는 모든 기능(문자열) 찾기” — 전략별 해법

데이터 규모	가장 단순한 해법	한계
≤ 몇 백 줄	features.filter(f => f.includes(pattern))(JS/TS 한 줄, C++ std::string::find)	O(total length)지만 매 질의마다 스캔
수천 ~ 수만 줄 + 실시간 UI	Suffix Automaton(SAM) + 기능 ID 집합	선형 빌드, 질의 O(
수십만 ~ 이상 + 랭킹/오타	Meilisearch·Typesense 같은 전문 엔진	별도 서버 필요, 설정·운용 비용

아래는 “SAM 한 번만 빌드 → 패턴으로 상태 찾기 → 그 상태에 속한 기능 ID 목록 반환” 방식의 상세 설명과 코드 조각입니다.

⸻

1️⃣ 아이디어
	1.	모든 기능 문자열을 feature₀ + "#" + feature₁ + "$" + … 처럼 유일 구분 기호를 끼워 하나로 연결한다.
	2.	이 긴 문자열로 SAM을 한 번 빌드한다.
	3.	각 리프(= 접미사) 노드는 “어느 기능에서 왔는지” ID를 보유한다.
	4.	길이 역순으로 DP 하며 **각 상태에 “등장한 기능 ID 집합”**을 전파한다.
	5.	질의 패턴을 SAM에서 따라가 도착한 상태의 ID 집합을 그대로 반환한다.

➡️ 시간 O(total length) 빌드, 패턴 질의 O(|pattern| + 출현 기능 수)

⸻

2️⃣ C++17 예시 (핵심 변경만)

struct State {
    int len = 0, link = -1;
    array<int, 26> next{};           // 소문자 예시
    vector<int> ids;                 // 이 상태가 등장하는 기능 id list
    State() { next.fill(-1); }
};

vector<State> st;
int last = 0;

void extend(char ch, int featId) {
    int c = ch - 'a', cur = st.size();
    st.push_back(State());
    st[cur].len = st[last].len + 1;
    st[cur].ids.push_back(featId);          // 리프에 기능 id 저장

    int p = last;
    for (; p != -1 && st[p].next[c] == -1; p = st[p].link)
        st[p].next[c] = cur;

    if (p == -1) st[cur].link = 0;
    else {
        int q = st[p].next[c];
        if (st[p].len + 1 == st[q].len) st[cur].link = q;
        else {
            int clone = st.size();
            st.push_back(st[q]);
            st[clone].len = st[p].len + 1;
            st[clone].ids.clear();           // clone은 ids 비움
            for (; p != -1 && st[p].next[c] == q; p = st[p].link)
                st[p].next[c] = clone;
            st[q].link = st[cur].link = clone;
        }
    }
    last = cur;
}

/* --- DP: 상태별 ids 집합 합치기 --- */
void propagate() {
    vector<int> order(st.size());
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(),
        [&](int a, int b){return st[a].len > st[b].len;});
    for (int v : order) {
        if (st[v].link != -1) {
            auto &dst = st[ st[v].link ].ids;
            dst.insert(dst.end(), st[v].ids.begin(), st[v].ids.end());
        }
        sort(st[v].ids.begin(), st[v].ids.end());
        st[v].ids.erase(unique(st[v].ids.begin(), st[v].ids.end()), st[v].ids.end());
    }
}

/* --- 질의 --- */
vector<int> queryIds(const string& pat) {
    int v = 0;
    for (char ch : pat) {
        int c = ch - 'a';
        if (st[v].next[c] == -1) return {};   // 패턴 미존재
        v = st[v].next[c];
    }
    return st[v].ids;                         // 포함 기능 ID 리스트
}

	•	메모리 최적화
	•	ID 수가 64 이하라면 uint64_t bitmask 로도 대체 가능.
	•	큰 데이터셋이면 vector<int> 대신 std::bitset 혹은 boost::dynamic_bitset.

⸻

3️⃣ TypeScript / Angular 서비스 확장

export interface SamState {
  len: number;
  link: number;
  next: Map<string, number>;
  ids: Set<number>;          // 등장 기능 id
}

export class SuffixAutomaton {
  private st: SamState[] = [{ len: 0, link: -1, next: new Map(), ids: new Set() }];
  private last = 0;

  extend(ch: string, featId: number): void {
    const cur = this.st.length;
    this.st.push({ len: this.st[this.last].len + 1, link: 0, next: new Map(), ids: new Set([featId]) });

    let p = this.last;
    while (p !== -1 && !this.st[p].next.has(ch)) {
      this.st[p].next.set(ch, cur);
      p = this.st[p].link;
    }

    if (p === -1) {
      this.st[cur].link = 0;
    } else {
      const q = this.st[p].next.get(ch)!;
      if (this.st[p].len + 1 === this.st[q].len) {
        this.st[cur].link = q;
      } else {
        const clone = this.st.length;
        this.st.push({
          len: this.st[p].len + 1,
          link: this.st[q].link,
          next: new Map(this.st[q].next),
          ids: new Set()                // clone ids 비움
        });
        while (p !== -1 && this.st[p].next.get(ch) === q) {
          this.st[p].next.set(ch, clone);
          p = this.st[p].link;
        }
        this.st[q].link = this.st[cur].link = clone;
      }
    }
    this.last = cur;
  }

  build(features: string[]): void {
    let delim = 0xE000;                 // 유니코드 Private Use 영역
    features.forEach((f, id) => {
      for (const ch of f) this.extend(ch, id);
      this.extend(String.fromCharCode(delim++), -1); // 구분자, -1은 무시
    });
    /* DP: 집합 전파 */
    const order = [...this.st.keys()].sort((a, b) => this.st[b].len - this.st[a].len);
    for (const v of order) {
      const link = this.st[v].link;
      if (link !== -1) {
        for (const id of this.st[v].ids) this.st[link].ids.add(id);
      }
    }
  }

  featuresContaining(pattern: string): number[] {
    let v = 0;
    for (const ch of pattern) {
      const nxt = this.st[v].next.get(ch);
      if (nxt === undefined) return [];
      v = nxt;
    }
    return Array.from(this.st[v].ids).filter(i => i !== -1);
  }
}

// 사용 예시
const sam = new SuffixAutomaton();
sam.build(['turn on light', 'set timer', 'dim light']);

console.log(sam.featuresContaining('light')); // [0, 2]
console.log(sam.featuresContaining('timer')); // [1]


⸻

4️⃣ 복잡도

단계	비용
빌드	O(total length)
DP 전파	O(state · avg ids) ≤ O(total length · log W) (집합 머지 비용)
질의	O(


⸻

5️⃣ 언제 이 방법을 쓸까?
	•	기능(문자열) 개수가 많고, 실시간으로 패턴 입력이 자주 바뀌는 UI
	•	반복 질의 → SAM 한 번 구축 후 재사용
	•	기능이 수십~수백 건 정도라면 단순 filter 루프가 더 간단

🔑 요약
“여러 기능 목록에서 ‘어떤 패턴’을 포함하는 모든 기능을 찾아라”
→ SAM + 기능 ID 집합 전파를 쓰면 선형 빌드, 질의는 O(패턴) 으로 끝납니다.
작은 규모엔 단순 .includes, 대규모·고빈도 질의엔 SAM(또는 전문 검색 엔진) 을 선택하세요!
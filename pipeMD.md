# 💉 `@inject()` 쉽게 설명하기 (TypeScript / DI)

## 🎯 상황: `UserService`는 `Logger`가 필요해

```ts
class UserService {
  constructor(private logger: Logger) {}

  signup(name: string) {
    this.logger.log(`${name} signed up!`);
  }
}
```

이 `UserService`는 로그를 출력하기 위해 `Logger`가 필요해요. 그런데 누가 `Logger`를 만들어서 넣어줘야 할까요?

---

## 🤯 직접 만드는 방법 (❌ 좋지 않음)

```ts
class UserService {
  private logger = new Logger();  // 직접 만들기
}
```

이렇게 하면 `UserService`가 `Logger`에 **딱 붙어 있어서**, 바꾸기도 어렵고 테스트도 힘들어요.

---

## ✅ 좋은 방법: **밖에서 넣어주기**

```ts
class UserService {
  constructor(private logger: Logger) {}  // 외부에서 주입
}
```

이렇게 하면 `UserService`는 단지 **“Logger 하나만 주세요”** 하는 입장이고, 실제 Logger는 **밖에서 누가 넣어줘야 해요.**

---

## 🤖 여기서 `@inject()` 등장!

```ts
class UserService {
  constructor(@inject(Logger) private logger: Logger) {}
}
```

- `@inject(Logger)` 는 다음과 같은 의미예요:
  > "DI 컨테이너야, `Logger` 타입 객체 하나 나 대신 넣어줘!"

이제 DI 컨테이너가 아래처럼 사용할 수 있게 해줘요:

```ts
const userService = container.get(UserService);
```

- `Logger`는 자동으로 주입됨
- 테스트할 땐 `MockLogger`, `FakeLogger`도 쉽게 넣을 수 있음

---

## 🧃 비유로 정리

| 방식 | 설명 |
|------|------|
| **직접 만들기** | 커피 마시고 싶어서 직접 원두 사고, 갈고, 물 끓이고… |
| **의존성 주입** | “커피 주세요” 하면, 누가 알아서 타서 줌 ☕ |
| `@inject()` | “커피 달라고 요청하는 표시” |

---

## 💬 최종 요약

| 개념 | 쉽게 말하면 |
|------|--------------|
| `@inject()` | “필요한 거 자동으로 넣어줘!”라고 표시하는 도구 |
| 왜 씀? | 직접 만들지 않고, 외부에서 넣어주게 해서 **코드가 유연하고 테스트 쉬움** |
| 언제 씀? | 클래스가 뭔가(예: Logger, DB, API client 등)를 필요로 할 때 |
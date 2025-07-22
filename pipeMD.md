# 💠 `@injectable()` 쉽게 설명하기

## ✅ `@injectable()`이란?

> 이 클래스는 **DI 컨테이너가 생성할 수 있도록 허락한 클래스야!**

DI 컨테이너가 클래스 인스턴스를 자동으로 만들어서 주입하려면, 그 클래스는 **"나를 만들어도 돼"** 라고 허락해야 해요.  
바로 그 표시가 `@injectable()`입니다.

---

## 🧩 예시 없이 보면 이해 어렵다 → 바로 예시!

### ❌ `@injectable()` 없을 때

```ts
class Logger {
  log(message: string) {
    console.log("[LOG]", message);
  }
}

class UserService {
  constructor(private logger: Logger) {}

  signup(name: string) {
    this.logger.log(`${name} signed up!`);
  }
}
```

그리고 DI 컨테이너 설정:

```ts
container.bind(UserService).toSelf();
container.bind(Logger).toSelf();

const service = container.get(UserService); // ❌ 오류!
```

**🚫 오류 발생!**  
> "Logger 클래스가 injectable하지 않다고 TypeScript가 화냅니다"

---

### ✅ `@injectable()` 추가한 예시

```ts
import { injectable, inject } from "inversify";

@injectable()
class Logger {
  log(message: string) {
    console.log("[LOG]", message);
  }
}

@injectable()
class UserService {
  constructor(@inject(Logger) private logger: Logger) {}

  signup(name: string) {
    this.logger.log(`${name} signed up!`);
  }
}
```

그리고 DI 등록:

```ts
container.bind(Logger).toSelf();
container.bind(UserService).toSelf();

const service = container.get(UserService);  // ✅ 정상 작동!
```

---

## 🔑 요약

| 개념 | 설명 |
|------|------|
| `@injectable()` | **"이 클래스는 DI 컨테이너가 만들 수 있어요!"** 라는 표시 |
| 언제 필요해? | 다른 클래스의 생성자에 주입되거나, 직접 DI로 생성될 때 |
| 같이 쓰는 데코레이터 | `@inject()` (생성자 매개변수에 씀) |

---

## 📦 비유

| 역할 | 설명 |
|------|------|
| `@inject()` | "이런 게 필요해요!" 라고 요청 |
| `@injectable()` | "응, 날 써도 돼!" 라고 허락 |

---

## 🧪 Tip

DI를 쓸 때는 **`@injectable()` 없이는 `@inject()`도 제대로 작동하지 않아요.**
항상 **주입받는 클래스와 주입하는 클래스 양쪽 모두에 `@injectable()`을 써줘야 해요.**
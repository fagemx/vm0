# Agent Briefing: Page-Level Metadata Test

你的任務是為一個 Next.js page 的 `generateMetadata` 撰寫 integration tests。

> 本文件補充 `briefing.md`（API route 測試）。`page.tsx` 的 `generateMetadata` 與 `route.ts` 的 handler 是不同類別，需要不同的 mock 策略。

---

## 1. 適用範圍

| 改動位置 | 用哪個 briefing |
|---------|----------------|
| `app/api/.../route.ts` | `briefing.md`（API Route） |
| `app/[locale]/.../page.tsx` 的 `generateMetadata` | **本文件**（Page-Level） |

---

## 2. 測試檔位置

測試檔放在 page 同層的 `__tests__/page.test.ts`。

```
app/[locale]/blog/
├── page.tsx
└── __tests__/
    └── page.test.ts        ← 注意是 page.test.ts，不是 route.test.ts
```

---

## 3. 與 API Route 測試的關鍵差異

| 面向 | API Route (`route.test.ts`) | Page Metadata (`page.test.ts`) |
|------|---------------------------|-------------------------------|
| **測試對象** | `GET`/`POST` handler | `generateMetadata` 函數 |
| **Database** | 需要（`testContext`, `setupUser`） | 通常不需要 |
| **環境變數** | `setup.ts` 已涵蓋 | 需 `vi.hoisted()` 額外設定 |
| **外部 Mock** | `@clerk/nextjs/server`, `@e2b`, `@aws-sdk` | `next-intl/*`, `@clerk/nextjs`, `next/navigation` |
| **資料來源** | Real DB | MSW mock（Strapi 等 HTTP API） |
| **Helper** | `createTestRequest`, `testContext` | 不需要，直接呼叫 `generateMetadata` |

---

## 4. 必要的 Mock（完整清單）

page.tsx 會 import React component（Navbar, Footer, BlogContent 等），這些 component 的 transitive dependency 需要 mock：

```typescript
// 1. 環境變數 — 必須用 vi.hoisted()，在所有 import 之前生效
vi.hoisted(() => {
  vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://test.vm0.ai");
  vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", "https://test-strapi.example.com");
});

// 2. next-intl/server — page.tsx 的 getTranslations + i18n.ts 的 getRequestConfig
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => `mock-${key}`),
  getRequestConfig: vi.fn((fn: unknown) => fn),
}));

// 3. next-intl/navigation — navigation.ts 的 createNavigation（module-level 呼叫）
vi.mock("next-intl/navigation", () => ({
  createNavigation: vi.fn(() => ({
    Link: () => null,
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
  })),
}));

// 4. next-intl — component 使用的 useTranslations
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => `mock-${key}`),
}));

// 5. @clerk/nextjs — Navbar 的 useUser, useClerk
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({ user: null, isLoaded: true })),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
}));

// 6. next/navigation — BlogContent 的 useSearchParams, useParams + notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
  useRouter: vi.fn(() => ({})),
}));
```

### 為什麼這麼多 mock？

page.tsx import 了 component（Navbar, Footer, BlogContent），vitest 載入 module 時會解析所有 transitive import。這些 component 使用 `next-intl`, `@clerk/nextjs`, `next/navigation` 等外部套件。雖然我們只測 `generateMetadata`（不渲染 component），但 **module 載入時所有 import 都必須解析成功**。

---

## 5. 測試骨架：純 metadata（不需外部資料）

Blog list page 的 `generateMetadata` 只用 `getTranslations` + `BLOG_BASE_URL`，不需查資料庫或外部 API：

```typescript
import { describe, it, expect, vi } from "vitest";

vi.hoisted(() => {
  vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://test.vm0.ai");
  vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", "https://test-strapi.example.com");
});

// ... mock 區塊（見 section 4）

import { generateMetadata } from "../page";

describe("blog list page metadata", () => {
  it("includes canonical URL with locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(metadata.alternates?.canonical).toBe("https://test.vm0.ai/en/blog");
  });

  it("constructs canonical URL for non-English locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "ja" }),
    });

    expect(metadata.alternates?.canonical).toBe("https://test.vm0.ai/ja/blog");
  });
});
```

---

## 6. 測試骨架：需要外部資料（MSW）

Blog post page 的 `generateMetadata` 呼叫 `getPost(slug, locale)`，最終打 Strapi API。用 MSW mock：

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../../../../src/mocks/server";

const STRAPI_URL = "https://test-strapi.example.com" as const;

const mockArticle = {
  id: 1,
  documentId: "doc-1",
  title: "Test Post",
  description: "Test excerpt",
  slug: "test-post",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  publishedAt: "2024-01-01T00:00:00.000Z",
  cover: { url: "/covers/test.jpg" },
  author: { name: "Test Author" },
  category: { name: "Technology", slug: "technology" },
  blocks: [{ __component: "shared.rich-text", id: 1, body: "Test content" }],
};

vi.hoisted(() => {
  vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://test.vm0.ai");
  vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", "https://test-strapi.example.com");
});

// ... mock 區塊（見 section 4）

import { generateMetadata } from "../page";

describe("blog post page metadata", () => {
  beforeEach(() => {
    server.use(
      http.get(`${STRAPI_URL}/api/articles`, ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("filters[slug][$eq]");
        if (slug === "test-post") {
          return HttpResponse.json({ data: [mockArticle], meta: {} });
        }
        return HttpResponse.json({ data: [], meta: {} });
      }),
    );
  });

  it("includes canonical URL for existing post", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "test-post", locale: "en" }),
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://test.vm0.ai/en/blog/posts/test-post",
    );
  });

  it("returns no canonical URL when post does not exist", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "non-existent", locale: "en" }),
    });

    expect(metadata.title).toBe("Post Not Found");
    expect(metadata.alternates).toBeUndefined();
  });
});
```

---

## 7. 已知陷阱

### 1. `vi.hoisted()` 必須用字面值

```typescript
// ❌ 錯誤：STRAPI_URL 在 vi.hoisted() 時還沒初始化
const STRAPI_URL = "https://test-strapi.example.com";
vi.hoisted(() => {
  vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", STRAPI_URL);  // ReferenceError!
});

// ✅ 正確：在 vi.hoisted() 內用字面值
vi.hoisted(() => {
  vi.stubEnv("NEXT_PUBLIC_STRAPI_URL", "https://test-strapi.example.com");
});
const STRAPI_URL = "https://test-strapi.example.com" as const;
```

### 2. Module-level 常數需要環境變數提前就位

`BLOG_BASE_URL`（config.ts）和 `STRAPI_URL`（strapi.ts）都在 module load 時計算。如果 `vi.hoisted()` 沒設對應環境變數，import 就會 throw。

### 3. `params` 是 Promise

Next.js 15 的 `generateMetadata` 接收 `{ params: Promise<...> }`，不是 `{ params: ... }`：

```typescript
// ✅ 正確
await generateMetadata({ params: Promise.resolve({ locale: "en" }) });

// ❌ 錯誤
await generateMetadata({ params: { locale: "en" } });
```

### 4. MSW 用全域 server

blog 資料層的測試用自建 MSW server，但 page-level 測試用全域 `src/mocks/server`（setup.ts 已啟動，策略 `"bypass"`）。在 `beforeEach` 中用 `server.use()` 加 handler，`afterEach` 的 `server.resetHandlers()` 會自動清理。

### 5. 不要 mock 內部 component

page.tsx import 的 Navbar, Footer, BlogContent 是內部模組。依專案規範不可 mock（`vi.mock()` 路徑不能以 `../` 開頭）。正確做法是 mock 它們的**外部依賴**（`next-intl`, `@clerk/nextjs` 等）。

---

## 8. 驗證步驟（同 briefing.md section 11）

1. **跑測試** — `DATABASE_URL=postgresql://ubuntu:vm0dev@localhost:5432/vm0_dev pnpm vitest run <測試檔路徑>`
2. **跑 lint** — `pnpm turbo run lint --filter=web`
3. **跑 prettier** — `pnpm prettier --check <修改的檔案>`
4. **跑 type check** — `pnpm check-types --filter=web`

---

## 9. 何時該用這個 briefing

- 改了 `page.tsx` 的 `generateMetadata`（metadata 結構、canonical URL、OG tags 等）
- 改了 `page.tsx` 的 `generateStaticParams`
- 任何影響 Next.js build-time 行為的 page-level 改動

不適用：
- API route（`route.ts`）→ 用 `briefing.md`
- Blog 資料層（`lib/blog/`）→ 已有 `lib/blog/__tests__/` 用 MSW 測試

# 安全性審查報告

## 🔴 高風險問題

### 1. CLI Token 明文存儲

**位置**: `turbo/apps/web/src/db/schema/cli-tokens.ts:5`

**問題**: Token 以明文形式存儲在資料庫中，資料庫管理員可直接查看所有用戶 token。

```typescript
// cli-tokens.ts
export const cliTokens = pgTable("cli_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").unique().notNull(), // ⚠️ 明文存儲 vm0_live_xxxxx...
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**建議**: 改為存儲 token 的 SHA-256 雜湊值，驗證時比較雜湊。

```typescript
// 建議的改法
import { createHash } from "crypto";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// 存儲時
await db.insert(cliTokens).values({
  tokenHash: hashToken(token), // 存儲雜湊值
  tokenPrefix: token.slice(0, 10), // 存儲前綴用於識別
  // ...
});

// 驗證時
const tokenHash = hashToken(providedToken);
const result = await db.select().from(cliTokens)
  .where(eq(cliTokens.tokenHash, tokenHash));
```

---

### 2. 缺少 Rate Limiting

**位置**: 所有認證相關 API endpoints

**問題**: 登入、設備碼請求、token 交換等端點沒有速率限制，容易受暴力破解攻擊。

```typescript
// turbo/apps/web/app/api/cli/auth/device/route.ts
// 沒有任何速率限制檢查
export async function POST(request: Request) {
  // 直接處理請求...
}
```

**建議**: 使用 Upstash Ratelimit 或類似方案

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 每分鐘 5 次
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": remaining.toString() } }
    );
  }

  // 繼續處理...
}
```

---

### 3. Vercel 旁路密鑰暴露到沙箱

**位置**: `turbo/apps/web/src/lib/run/executors/e2b-executor.ts:265-269`

**問題**: Vercel 保護旁路密鑰被傳入沙箱環境變數，若沙箱被攻破可能洩漏。

```typescript
// e2b-executor.ts
const sandboxEnvVars: Record<string, string> = {
  VM0_API_URL: apiUrl,
  VM0_RUN_ID: context.runId,
  // ...
};

// ⚠️ 高風險：將 Vercel 保護旁路密鑰傳入沙箱
const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (vercelBypassSecret) {
  sandboxEnvVars.VERCEL_PROTECTION_BYPASS = vercelBypassSecret;
}
```

**建議**: 使用生命週期受限的專用 token，或透過 API 代理而非直接傳遞密鑰。

---

## 🟠 中風險問題

### 4. 環境變數透過 /tmp 傳遞

**位置**: `turbo/packages/core/src/sandbox/scripts/src/env-loader.ts:12-37`

**問題**: 環境變數（包含 secrets）透過 `/tmp/vm0-env.json` 傳遞，可能被其他進程讀取。

```typescript
// env-loader.ts
const ENV_JSON_PATH = "/tmp/vm0-env.json"; // ⚠️ 可能被其他進程讀取

if (fs.existsSync(ENV_JSON_PATH)) {
  const content = fs.readFileSync(ENV_JSON_PATH, "utf-8");
  const envData = JSON.parse(content) as Record<string, string>;
  for (const [key, value] of Object.entries(envData)) {
    process.env[key] = value;
  }
}
```

**建議**:
- 設定正確的檔案權限 (chmod 600)
- 讀取後立即刪除檔案
- 考慮使用 Unix domain socket 或 pipe

---

### 5. Secret 遮罩依賴編碼成功

**位置**: `turbo/apps/web/src/lib/run/executors/e2b-executor.ts:297-303`

**問題**: 若 base64/URL 編碼失敗，secrets 可能洩漏到日誌中。

```typescript
// e2b-executor.ts
if (context.secrets && Object.keys(context.secrets).length > 0) {
  const secretValues = Object.values(context.secrets);
  // ⚠️ 編碼失敗時會怎樣？
  const encodedValues = secretValues.map((v) =>
    Buffer.from(v).toString("base64"),
  );
  sandboxEnvVars.VM0_SECRET_VALUES = encodedValues.join(",");
}
```

**建議**: 添加 try-catch 和驗證邏輯

```typescript
try {
  const encodedValues = secretValues.map((v) => {
    const encoded = Buffer.from(v).toString("base64");
    // 驗證編碼成功
    const decoded = Buffer.from(encoded, "base64").toString();
    if (decoded !== v) {
      throw new Error("Encoding verification failed");
    }
    return encoded;
  });
  sandboxEnvVars.VM0_SECRET_VALUES = encodedValues.join(",");
} catch (error) {
  log.error("Failed to encode secrets for masking", { error });
  throw new Error("Secret encoding failed - aborting to prevent leakage");
}
```

---

### 6. 缺少明確的 CSRF 保護

**位置**: middleware 配置

**問題**: 沒有明確配置 CSRF 保護，依賴 Clerk/Next.js 內建機制。

**建議**: 明確配置 SameSite cookie 政策和驗證 Origin header。

---

## ✅ 安全性優點

### 良好實踐 1: AES-256-GCM 加密

**位置**: `turbo/apps/web/src/lib/crypto/secrets-encryption.ts`

```typescript
// 使用業界標準的加密算法
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;        // 96 bits - 符合 NIST 建議
const AUTH_TAG_LENGTH = 16;  // 128 bits

export function encryptSecret(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error("Encryption key must be exactly 32 bytes (256 bits)");
  }

  const iv = crypto.randomBytes(IV_LENGTH); // ✅ 每次加密使用隨機 IV
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  // 格式: iv:authTag:encryptedData
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}
```

### 良好實踐 2: HKDF 密鑰派生

**位置**: `turbo/apps/web/src/lib/auth/sandbox-token.ts:45-57`

```typescript
// ✅ 使用 HKDF 分離不同用途的密鑰
function deriveJwtKey(): Buffer {
  const keyHex = env().SECRETS_ENCRYPTION_KEY;
  const masterKey = Buffer.from(keyHex, "hex");

  // 派生專用的 JWT 簽名密鑰，不與加密密鑰共用
  return Buffer.from(
    hkdfSync("sha256", masterKey, "", "jwt-sandbox-signing", 32),
  );
}
```

### 良好實踐 3: 常數時間比較

**位置**: `turbo/apps/web/src/lib/auth/runner-auth.ts:33-56`

```typescript
// ✅ 使用 timingSafeEqual 防止計時攻擊
import { timingSafeEqual } from "crypto";

export function verifyRunnerSecret(providedSecret: string): boolean {
  const expectedSecret = process.env.OFFICIAL_RUNNER_SECRET;
  if (!expectedSecret) return false;

  const provided = Buffer.from(providedSecret);
  const expected = Buffer.from(expectedSecret);

  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}
```

### 良好實踐 4: Replay 攻擊防護

**位置**: `turbo/apps/web/src/lib/slack/verify.ts`

```typescript
// ✅ Slack webhook 時間戳驗證
export function verifySlackSignature(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string,
): boolean {
  // 拒絕 5 分鐘以上的請求
  const currentTime = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - requestTime) > 60 * 5) {
    return false; // ✅ 防止 replay 攻擊
  }

  const baseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac("sha256", signingSecret);
  const expectedSignature = `v0=${hmac.update(baseString).digest("hex")}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}
```

### 良好實踐 5: Token 隔離

**位置**: `turbo/apps/web/src/lib/auth/get-user-id.ts:31-35`

```typescript
// ✅ Sandbox JWT 不能用於普通 API
if (sandboxToken && !allowSandboxToken) {
  throw unauthorized(
    "Sandbox tokens are not allowed for this endpoint. Use a CLI token instead."
  );
}
```

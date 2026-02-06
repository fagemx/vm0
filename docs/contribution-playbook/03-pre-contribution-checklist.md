# 03 - 開始貢獻前檢查清單

> 在動手修改代碼之前，確認這些事項

## 1. 同步最新代碼

```bash
# 確保在最新的 main 分支
git fetch upstream
git checkout main
git reset --hard upstream/main

# 確認是最新
git log --oneline -3
```

---

## 2. 確認貢獻方向

### 檢查是否已有人在做

```bash
# 搜索相關的開放 PR
gh pr list --repo vm0-ai/vm0 --state open | grep -i "關鍵字"

# 搜索相關的開放 Issue
gh issue list --repo vm0-ai/vm0 --state open | grep -i "關鍵字"
```

### 檢查是否需要先討論

| 情況 | 行動 |
|------|------|
| 小改動（< 50 行） | 可直接 PR |
| 新功能 | 建議先開 Issue |
| 架構變更 | **必須**先開 Issue |
| 新增依賴 | **必須**先開 Issue |

---

## 3. 理解相關代碼

### 閱讀順序

1. **目標文件本身** - 理解當前實現
2. **相關的測試文件** - 理解預期行為
3. **相關的類型定義** - 理解數據結構
4. **調用這個模塊的代碼** - 理解使用方式

### 問自己

- [ ] 我理解這段代碼在做什麼嗎？
- [ ] 我的修改會影響哪些地方？
- [ ] 有沒有類似的實現可以參考？

---

## 4. 查看類似的 PR

```bash
# 找類似的合併 PR
gh pr list --repo vm0-ai/vm0 --state merged --limit 50 | grep -i "類似關鍵字"

# 查看 PR 詳情
gh pr view <PR_NUMBER> --repo vm0-ai/vm0
```

### 學習要點

- Commit message 格式
- PR 描述風格
- 代碼組織方式
- 測試覆蓋範圍

---

## 5. 創建工作分支

```bash
# 從最新 main 創建分支
git checkout main
git checkout -b feat/your-feature-name

# 分支命名規範
feat/xxx     # 新功能
fix/xxx      # Bug 修復
docs/xxx     # 文檔
refactor/xxx # 重構
```

---

## 6. 確認開發環境

### 安裝依賴

```bash
cd turbo
pnpm install
```

### 確認工具可用

```bash
# TypeScript
pnpm check-types

# ESLint
pnpm turbo run lint

# 測試（可選）
pnpm test
```

---

## 7. 風險評估

### 低風險 ✅

- 只添加新代碼，不修改現有邏輯
- 改動在單一文件內
- 有環境變數預設值（向後相容）
- 有現成的測試可以驗證

### 中風險 ⚠️

- 修改多個文件
- 修改公共接口
- 需要數據庫遷移
- 影響 CLI 命令行為

### 高風險 ❌

- 修改核心邏輯
- 影響多個模塊
- 需要新增依賴
- 涉及安全相關代碼

---

## 8. 檢查清單總結

### 必須確認

- [ ] 代碼已同步到最新
- [ ] 確認沒有人在做相同的事
- [ ] 理解要修改的代碼
- [ ] 創建了正確命名的分支
- [ ] 開發環境正常運作

### 建議確認

- [ ] 找到了類似的 PR 作為參考
- [ ] 評估了風險等級
- [ ] 確定了 PR 標題格式
- [ ] 準備好了測試計劃

---

## 9. 開始前的心理準備

### 預期可能發生的事

| 情況 | 應對 |
|------|------|
| PR 被要求修改 | 正常，按反饋修改 |
| PR 被關閉 | 學習原因，下次改進 |
| 維護者有更好的建議 | 接受建議，這是學習機會 |
| CI 失敗 | 檢查錯誤，修復後推送 |

### 心態

- 每個 PR 都是學習機會
- 被拒絕不代表失敗
- 維護者的時間寶貴，提交高品質 PR

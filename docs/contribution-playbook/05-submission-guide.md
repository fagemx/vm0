# 05 - 提交與推送指南

> 主代理負責最終驗證和推送 PR

## 1. 接收實作代理的修改

### 驗證清單

在推送前，主代理需要確認：

- [ ] 所有驗證檢查通過（參考 04-validation-guide.md）
- [ ] Commit message 符合 Conventional Commits
- [ ] 代碼風格符合專案規範
- [ ] 沒有無關的文件修改
- [ ] 改動範圍合理（不要太大）

---

## 2. 最終驗證

### 運行完整檢查

```bash
cd turbo

# TypeScript
pnpm check-types

# ESLint
pnpm turbo run lint

# 格式
pnpm format --check

# Knip（未使用代碼）
pnpm knip
```

### 檢查 Git 狀態

```bash
# 確認分支正確
git branch --show-current

# 確認修改的文件
git diff --name-only HEAD~1

# 確認 commit message
git log --oneline -3
```

---

## 3. Commit Message 最終檢查

### 格式要求

```
<type>(<scope>): <description>

[optional body]
```

### 檢查項目

| 項目 | 要求 |
|------|------|
| Type | 小寫: `feat`, `fix`, `docs`, etc. |
| Scope | 小寫: `web`, `cli`, `runner`, etc. |
| Description | 小寫開頭，祈使語氣，無句號 |
| 長度 | < 100 字元 |

### 如果需要修改

```bash
# 修改最後一個 commit message
git commit --amend -m "feat(web): new message"
```

---

## 4. 推送到 Fork

```bash
# 首次推送新分支
git push -u origin feat/your-feature-name

# 後續推送（如果有修改）
git push

# 強制推送（如果 amend 了 commit）
git push --force-with-lease
```

---

## 5. 創建 Pull Request

### 方法 1: 使用 GitHub CLI

```bash
gh pr create --repo vm0-ai/vm0 \
  --title "feat(web): your feature title" \
  --body "## Summary

Your summary here.

## Changes

- Change 1
- Change 2

## Testing

- [x] TypeScript passes
- [x] Linter passes"
```

### 方法 2: 使用瀏覽器

```bash
# 打開瀏覽器創建 PR
gh pr create --repo vm0-ai/vm0 --web
```

### PR 描述模板

```markdown
## Summary

簡述這個 PR 做了什麼。

## Changes

- 列出主要變更 1
- 列出主要變更 2

## Motivation

為什麼需要這個改動？（可選）

## Testing

- [x] TypeScript types check passes
- [x] Linter passes
- [x] Existing behavior unchanged when not configured
```

---

## 6. PR 創建後

### 等待 CI

- 外部貢獻者的 PR 需要維護者批准才能運行 CI
- 等待 `1 workflow awaiting approval` 被批准

### 監控 CI 狀態

```bash
# 查看 PR 狀態
gh pr view --repo vm0-ai/vm0

# 查看 CI 檢查
gh pr checks --repo vm0-ai/vm0
```

### 常見 CI 問題

| 問題 | 解決方案 |
|------|----------|
| lint 失敗 | 修復 lint 錯誤，推送更新 |
| type 失敗 | 修復類型錯誤，推送更新 |
| deploy 失敗 | 外部貢獻者正常，忽略 |
| test 失敗 | 檢查測試錯誤，修復 |

---

## 7. 回應維護者反饋

### 如果被要求修改

1. 閱讀反饋
2. 進行修改
3. 推送更新
4. 回覆評論說明已修改

```bash
# 進行修改後
git add .
git commit -m "address review feedback"
git push
```

### 如果有討論

- 保持專業和禮貌
- 解釋你的選擇
- 願意接受建議

---

## 8. PR 合併後

### 清理分支

```bash
# 刪除本地分支
git checkout main
git branch -d feat/your-feature-name

# 同步 main
git fetch upstream
git reset --hard upstream/main
git push origin main --force
```

### 記錄經驗

更新 `README.md` 的經驗記錄：

```markdown
| 日期 | PR | 結果 | 學習 |
|------|-----|------|------|
| YYYY-MM-DD | #XXXX | ✅ 合併 | 學到的經驗 |
```

---

## 9. 主代理檢查清單

### 推送前

- [ ] 所有驗證通過
- [ ] Commit message 正確
- [ ] 分支名稱正確
- [ ] 沒有無關文件

### 創建 PR 時

- [ ] 標題符合 Conventional Commits
- [ ] 描述清晰完整
- [ ] 選擇正確的 base branch (main)

### PR 創建後

- [ ] 監控 CI 狀態
- [ ] 及時回應反饋
- [ ] 追蹤直到合併或關閉

### 合併後

- [ ] 清理分支
- [ ] 記錄經驗
- [ ] 同步最新代碼

---

## 10. 緊急情況處理

### PR 被關閉

1. 閱讀關閉原因
2. 不要氣餒
3. 學習經驗
4. 考慮是否需要調整方向

### CI 持續失敗

1. 仔細閱讀錯誤日誌
2. 在本地重現問題
3. 如果無法解決，可以在 PR 中留言請求幫助

### 衝突

```bash
# 解決衝突
git fetch upstream
git rebase upstream/main
# 解決衝突後
git rebase --continue
git push --force-with-lease
```

# 藥學教育投影片自動化指南

## 目標
根據用戶提供的課程內容 JSON，自動生成一個完整的、可獨立運行的投影片 HTML 文件。

## 工作流
1. 用戶提供課程內容（JSON 格式）
2. 你根據本指南生成完整的 `index.html`
3. 用戶直接上傳到 GitHub 的 `topic-X/` 資料夾
4. 教育平台通過 iframe 嵌入該 HTML

---

## 重要提醒

**每次都要生成完整的 HTML 文件** - 不要只生成部分代碼。
用戶會直接複製整個文件到 `index.html`。

---

## HTML 基礎框架

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>藥學教育課程</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <!-- 樣式在這裡，保持現有 CSS 不變 -->
    <style>
        /* 完整的 CSS 複製自現有樣板，保持不變 */
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        <!-- React 代碼在這裡，只修改 slidesData -->
    </script>
</body>
</html>
```

---

## 核心改動：slidesData

每次只需要修改 JavaScript 代碼中的 `slidesData` 陣列。

**位置**（在 `<script type="text/babel">` 內）：

```javascript
useEffect(() => {
    const slidesData = [
        // ⬇️ 把用戶的 JSON 投影片陣列放這裡
    ];
    
    setTimeout(() => {
        setSlides(slidesData);
        setLoading(false);
    }, 300);
}, []);
```

---

## 支援的投影片類型

### 1. 標題投影片 (title)
```json
{
    "id": "slide-1",
    "type": "title",
    "title": "課程標題",
    "subtitle": "副標題（可選）",
    "meta": "難度：intermediate • 時長：10-15分鐘"
}
```

### 2. 文字投影片 (text)
```json
{
    "id": "slide-2",
    "type": "text",
    "title": "投影片標題",
    "content": "段落一\n段落二\n段落三"
}
```

### 3. 表格投影片 (table)
```json
{
    "id": "slide-3",
    "type": "table",
    "title": "表格標題",
    "data": {
        "headers": ["欄1", "欄2", "欄3"],
        "rows": [
            ["值1", "值2", "值3"],
            ["值4", "值5", "值6"]
        ]
    }
}
```

### 4. 圖表投影片 (chart)
```json
{
    "id": "slide-4",
    "type": "chart",
    "title": "圖表標題",
    "chartType": "bar",
    "data": {
        "labels": ["A", "B", "C"],
        "values": [45, 72, 38],
        "label": "數據標籤"
    }
}
```

**支援的 chartType**：`bar`、`line`、`pie`

### 5. 測驗投影片 (quiz)
```json
{
    "id": "slide-5",
    "type": "quiz",
    "title": "知識檢測",
    "questions": [
        {
            "id": "q1",
            "question": "問題文字？",
            "options": ["選項1", "選項2", "選項3"],
            "correctAnswer": 0,
            "explanation": "這是解釋（當答對時顯示）"
        }
    ]
}
```

### 6. 提醒投影片 (callout)
```json
{
    "id": "slide-6",
    "type": "callout",
    "severity": "warning",
    "title": "提醒標題",
    "content": "提醒內容\n可以多行"
}
```

**severity 選項**：`warning`、`info`、`success`、`error`

### 7. 可摺疊投影片 (accordion)
```json
{
    "id": "slide-7",
    "type": "accordion",
    "title": "可摺疊內容",
    "items": [
        {
            "title": "項目1",
            "content": "內容1\n可以多行"
        },
        {
            "title": "項目2",
            "content": "內容2"
        }
    ]
}
```

### 8. 清單投影片 (checklist)
```json
{
    "id": "slide-8",
    "type": "checklist",
    "title": "清單標題",
    "items": [
        "項目一",
        "項目二",
        "項目三"
    ]
}
```

---

## 完整範例

用戶可能會給你這樣的 JSON：

```json
[
    {
        "id": "title",
        "type": "title",
        "title": "常見藥物交互作用",
        "subtitle": "認識藥物之間的相互影響",
        "meta": "難度：intermediate • 時長：15分鐘"
    },
    {
        "id": "intro",
        "type": "text",
        "title": "什麼是藥物交互作用？",
        "content": "當兩種或以上的藥物同時服用時，它們可能會相互影響。\n改變其效能或增加副作用的風險。\n這稱為藥物交互作用。"
    },
    {
        "id": "table",
        "type": "table",
        "title": "常見交互作用表",
        "data": {
            "headers": ["藥物A", "藥物B", "影響", "嚴重程度"],
            "rows": [
                ["阿斯匹靈", "華法林", "增加出血風險", "高"],
                ["布洛芬", "高血壓藥", "降低降血壓效果", "中"],
                ["迷走神經阻斷劑", "異丙醇", "降低效能", "中"]
            ]
        }
    },
    {
        "id": "chart",
        "type": "chart",
        "title": "藥物代謝速度比較",
        "chartType": "bar",
        "data": {
            "labels": ["藥物A", "藥物B", "藥物C"],
            "values": [45, 72, 38],
            "label": "代謝時間（小時）"
        }
    },
    {
        "id": "quiz",
        "type": "quiz",
        "title": "知識檢測",
        "questions": [
            {
                "id": "q1",
                "question": "以下哪個組合最容易產生交互作用？",
                "options": [
                    "維生素C + 維生素D",
                    "華法林 + 阿斯匹靈",
                    "葉酸 + 鈣"
                ],
                "correctAnswer": 1,
                "explanation": "華法林是抗凝血藥，與阿斯匹靈合用會增加出血風險。"
            }
        ]
    },
    {
        "id": "warning",
        "type": "callout",
        "severity": "warning",
        "title": "⚠️ 重要提醒",
        "content": "患者如有任何疑問，應諮詢藥師或醫生。\n這個頁面僅供教育用途。"
    },
    {
        "id": "end",
        "type": "title",
        "title": "謝謝觀看",
        "subtitle": "有任何問題歡迎提問",
        "meta": "© 2026 藥學教育平台"
    }
]
```

你需要：
1. 複製完整的 HTML 框架
2. 把用戶的 JSON 陣列放到 `slidesData` 變量
3. 保持所有其他代碼不變
4. 輸出完整的 `index.html` 文件

---

## 生成檢查清單

生成完成後，檢查：

- ✓ HTML 結構完整（DOCTYPE、html、head、body 都在）
- ✓ 所有 CDN 腳本正確（React、Babel、Chart.js）
- ✓ CSS 完整保留（沒有刪減）
- ✓ slidesData 正確嵌入（JSON 格式正確）
- ✓ 所有投影片都支援的類型（title、text、table 等）
- ✓ 導航控制條存在（← / → 按鈕）
- ✓ 鍵盤快捷鍵支援（← / → 箭頭鍵）
- ✓ 沒有語法錯誤

---

## 輸出格式

**用戶會直接複製你的輸出存成 `index.html`，所以：**

1. 生成完整的 HTML 代碼
2. 用 ````html 和 ```` 包裹（代碼區塊）
3. 確保沒有截斷
4. 確保可以直接在瀏覽器打開

---

## 常見問題處理

**Q: 用戶的 JSON 格式有誤？**
A: 溫和地指出錯誤，給出正確格式的範例。

**Q: 用戶要求添加自訂樣式？**
A: 可以在 `<style>` 區塊中修改，但要保持整體結構。

**Q: 用戶要求新的投影片類型？**
A: 可以添加新的渲染邏輯到 `SlideRenderer` 組件，但要清楚解釋。

---

## 使用方式

用戶將給你這樣的提示：

```
你是一個藥學教育投影片生成器。
根據 GEMINI.md 的規則，為我生成一個投影片 HTML。

課程內容：
[貼上他們的 JSON]

要求：
[任何特殊要求，如 "改顏色" 之類]

請輸出完整的 index.html 代碼。
```

你應該：
1. 檢查 JSON 格式
2. 遵照此指南生成 HTML
3. 輸出完整代碼（可直接複製保存）
4. 簡短解釋結果

---

## 關鍵設計原則

- **保持簡潔**：每個 HTML 檔案都是自包含的（CDN 方式）
- **投影片優先**：左右滑動，像 PowerPoint
- **互動性**：支援測驗、清單等互動元素
- **響應式**：在手機、平板、桌面都能用
- **快速部署**：用戶複製文件 → 推 GitHub → 完成

---

## 最後提醒

**這個 GEMINI.md 就是你的工作說明書。**

用戶可能會說：
- "幫我生成投影片 HTML"
- "根據 GEMINI.md 生成課程"
- "用我提供的 JSON 生成一個投影片"

你就直接按照這份指南執行即可。

---

**模板位置**：
- 現有完整的 HTML 框架已經提供
- 只需要替換 `slidesData` 變量
- 保持 CSS 和 React 邏輯不變

祝你使用愉快！🎓
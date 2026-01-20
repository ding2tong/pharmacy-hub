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

## HTML 基礎框架 (高質感 React 統一版)

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
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <div class="progress-bar" id="progress"></div>
    <div class="nav-btn prev" onclick="moveSlide(-1)">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
    </div>
    <div class="nav-btn next" onclick="moveSlide(1)">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
    </div>
    <div class="font-controls">
        <button class="font-btn" onclick="changeFontSize(-0.1)" title="更小">A-</button>
        <button class="font-btn" onclick="changeFontSize(0.1)" title="更大">A+</button>
    </div>
    <div class="slide-indicator" id="dots"></div>

    <div id="root"></div>

    <script src="../slides.js"></script>
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        const { createRoot } = ReactDOM;

        // --- 組件庫 (Modern Premium 版) ---
        
        const ChartComponent = ({ data, chartType }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);
            useEffect(() => {
                if (chartInstance.current) chartInstance.current.destroy();
                const ctx = chartRef.current.getContext('2d');
                chartInstance.current = new Chart(ctx, {
                    type: chartType,
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: data.label || '數據',
                            data: data.values,
                            backgroundColor: chartType === 'pie' ? ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ecfdf5'] : '#10b981',
                            borderColor: '#ffffff',
                            borderWidth: 3
                        }]
                    },
                    options: { 
                        responsive: true, maintainAspectRatio: false, 
                        plugins: { legend: { labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true, padding: 20 } } } 
                    }
                });
                return () => { if (chartInstance.current) chartInstance.current.destroy(); };
            }, [data, chartType]);
            return <div className="h-72 mt-8 bg-black/5 p-6 rounded-[2.5rem]"><canvas ref={chartRef}></canvas></div>;
        };

        const TableComponent = ({ data }) => (
            <div className="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            {data.headers.map((h, i) => <th key={i}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, i) => (
                            <tr key={i}>
                                {row.map((c, j) => <td key={j}>{c}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        const QuizComponent = ({ questions }) => {
            const [answers, setAnswers] = useState({});
            return (
                <div className="quiz-container">
                    {questions.map(q => (
                        <div key={q.id} className="quiz-card">
                            <h4 className="quiz-question">
                                <span className="quiz-badge">Question</span>
                                {q.question}
                            </h4>
                            <div className="quiz-options">
                                {q.options.map((opt, idx) => {
                                    const isSelected = answers[q.id] === idx;
                                    const isCorrect = q.correctAnswer === idx;
                                    const showResult = answers[q.id] !== undefined;
                                    
                                    let statusClass = "";
                                    let icon = null;
                                    
                                    if (isSelected) {
                                        statusClass = isCorrect ? "correct selected" : "incorrect selected";
                                        icon = isCorrect ? (
                                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        );
                                    } else if (showResult && isCorrect) {
                                        statusClass = "revealed-correct";
                                        icon = <svg className="w-6 h-6 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>;
                                    }

                                    return (
                                        <button 
                                            key={idx} 
                                            disabled={showResult} 
                                            onClick={() => setAnswers({ ...answers, [q.id]: idx })}
                                            className={`quiz-option ${statusClass}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                                                <span className="option-text">{opt}</span>
                                            </div>
                                            <div className="status-icon">{icon}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            {answers[q.id] !== undefined && (
                                <div className="quiz-explanation">
                                    <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                        <span>解析</span>
                                    </div>
                                    <p className="opacity-90">{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        };

        const CalloutComponent = ({ severity, title, content }) => {
            const themes = { 
                warning: 'bg-amber-50/80 border-amber-200 text-amber-950', 
                info: 'bg-emerald-50/80 border-emerald-200 text-emerald-950', 
                success: 'bg-emerald-100/80 border-accent/30 text-emerald-950', 
                error: 'bg-red-50/80 border-red-200 text-red-950 shadow-red-100/50' 
            };
            const icons = { warning: '⚠️', info: '💡', success: '✅', error: '🚨' };
            return (
                <div className={`p-8 rounded-[3rem] border-2 mt-8 shadow-lg ${themes[severity] || themes.info} backdrop-blur-sm`}>
                    <div className="flex items-center mb-3 text-xl font-extrabold uppercase tracking-tight">
                        <span className="mr-3 text-2xl">{icons[severity] || icons.info}</span>{title}
                    </div>
                    <p className="text-[1.1rem] font-medium leading-relaxed opacity-80">{content}</p>
                </div>
            );
        };

        const AccordionComponent = ({ items }) => (
            <div className="mt-8 space-y-4">
                {items.map((item, idx) => (
                    <details key={idx} className="group border border-white/50 rounded-[2.5rem] overflow-hidden bg-white/30 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/50">
                        <summary className="p-6 cursor-pointer font-bold text-gray-900 list-none flex justify-between items-center group-open:bg-white/60">
                            <span className="flex items-center text-lg">{item.title}</span>
                            <span className="transition-transform duration-500 group-open:rotate-180 text-2xl opacity-40">↓</span>
                        </summary>
                        <div className="p-8 bg-white/40 text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-white/50 text-[1.05rem]">
                            {item.content}
                        </div>
                    </details>
                ))}
            </div>
        );

        const ChecklistComponent = ({ items }) => (
            <ul className="mt-8 space-y-4">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start p-6 bg-white/40 border border-white/60 rounded-[2.5rem] shadow-sm transition-all duration-300 hover:bg-white/60 hover:translate-x-1">
                        <div className="mt-1 mr-5">
                            <input type="checkbox" className="h-6 w-6 text-accent border-emerald-200 rounded-lg focus:ring-accent accent-accent transition-all cursor-pointer" />
                        </div>
                        <label className="text-gray-800 text-[1.1rem] font-semibold leading-relaxed">{item}</label>
                    </li>
                ))}
            </ul>
        );

        const ChoiceComponent = ({ choices }) => (
            <div className="choice-container">
                {choices.map((choice, idx) => (
                    <a key={idx} href={choice.url} className="choice-card">
                        <div className="choice-icon">{choice.icon || '📍'}</div>
                        <div className="choice-label">{choice.label}</div>
                        {choice.description && <div className="choice-desc">{choice.description}</div>}
                    </a>
                ))}
            </div>
        );

        const CalculatorComponent = ({ type }) => {
            // [此處可根據需要實作計算機邏輯，例如 Mounjaro 補打邏輯]
            return null;
        };

        const SlideRenderer = ({ slide }) => {
            const containerStyles = { title: 'text-center', text: '' };
            
            if (slide.type === 'pdf') {
                return (
                    <div className="pdf-slide-wrapper">
                        <iframe src={slide.url} className="pdf-full-frame" frameBorder="0"></iframe>
                    </div>
                );
            }

            return (
                <div className={`slide-content fade-in-up ${containerStyles[slide.type] || ''}`}>
                    {slide.title && (
                        <h2 className={`${slide.type === 'title' ? 'text-5xl' : 'text-3xl'} font-extrabold mb-6 flex items-center ${slide.type === 'title' ? 'justify-center' : ''} leading-tight`}>
                            {slide.icon && slide.type !== 'title' && <span className="mr-5 drop-shadow-sm">{slide.icon}</span>}
                            <span className="bg-clip-text text-transparent bg-gradient-to-br from-emerald-950 to-emerald-800">{slide.title}</span>
                        </h2>
                    )}
                    {slide.subtitle && <p className="text-2xl text-accent font-semibold tracking-wide text-center mb-10 opacity-80">{slide.subtitle}</p>}
                    {slide.type === 'title' && <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-emerald-200 to-transparent mx-auto mb-10 rounded-full"></div>}
                    {slide.content && <p className={`text-gray-700 ${slide.type === 'title' ? 'text-[1.15rem]' : 'text-[1.125rem]'} whitespace-pre-wrap leading-relaxed opacity-90`}>{slide.content}</p>}
                    {slide.type === 'table' && <TableComponent data={slide.data} />}
                    {slide.type === 'chart' && <ChartComponent data={slide.data} chartType={slide.chartType} />}
                    {slide.type === 'quiz' && <QuizComponent questions={slide.questions} />}
                    {slide.type === 'callout' && <CalloutComponent severity={slide.severity} title={slide.title} content={slide.content} />}
                    {slide.type === 'accordion' && <AccordionComponent items={slide.items} />}
                    {slide.type === 'checklist' && <ChecklistComponent items={slide.items} />}
                    {slide.type === 'choice' && <ChoiceComponent choices={slide.choices} />}
                    {slide.type === 'calculator' && <CalculatorComponent type={slide.calculatorType} />}
                    {slide.type === 'image' && (
                        <div className="mt-10 text-center">
                            <div className="relative inline-block">
                                <img src={slide.url} alt={slide.alt} className="mx-auto rounded-[3.5rem] shadow-2xl max-h-96 object-cover border-[8px] border-white/60 backdrop-blur-sm" />
                                <div className="absolute inset-0 rounded-[3.5rem] ring-1 ring-black/5"></div>
                            </div>
                            {slide.caption && <p className="mt-6 text-sm text-gray-400 italic font-semibold tracking-wide">{slide.caption}</p>}
                        </div>
                    )}
                    {slide.type === 'title' && <div className="mt-16 text-emerald-900/40 text-xs font-bold animate-pulse tracking-[0.3em] uppercase">← Swipe horizontally to explore →</div>}
                </div>
            );
        };

        const App = () => {
            const [slides, setSlides] = useState([]);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                const slidesData = [
                    // ⬇️ 把用戶的 JSON 投影片陣列放這裡
                ];
                setSlides(slidesData);
                setLoading(false);
            }, []);

            useEffect(() => {
                if (!loading && slides.length > 0 && window.initSlides) {
                    setTimeout(window.initSlides, 100);
                }
            }, [loading, slides]);

            if (loading) return <div className="flex h-screen items-center justify-center text-emerald-800 font-bold">載入中...</div>;
            return (
                <div className="slide-container" id="container">
                    {slides.map((s, idx) => (
                        <div key={idx} className={`slide ${s.type === 'pdf' ? 'fullscreen' : ''}`}>
                            <SlideRenderer slide={s} />
                        </div>
                    ))}
                </div>
            );
        };
        createRoot(document.getElementById('root')).render(<App />);
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

### 9. 選擇/選單投影片 (choice)
```json
{
    "id": "slide-9",
    "type": "choice",
    "title": "請選擇您的指南類型",
    "choices": [
        {
            "label": "藥局指南",
            "description": "適用於執業藥師與調劑人員",
            "icon": "🏥",
            "url": "./pharmacy/index.html"
        },
        {
            "label": "診所指南",
            "description": "適用於醫師與診所行政流程",
            "icon": "⚕️",
            "url": "./clinic/index.html"
        }
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
- ✓ 外部樣式引用預設連結至 `../styles.css`
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
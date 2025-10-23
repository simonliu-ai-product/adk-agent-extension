# Google ADK Agent Extension

這是一個 Gemini CLI 擴充功能，用於與 ADK (Agent Development Kit) 代理程式進行互動。

## 功能

### MCP 伺服器工具

此擴充功能提供一個 MCP 伺服器，其中包含以下工具：

*   `list_adks`: 獲取可用的 ADK 伺服器列表。
*   `list_adk_agents`: 從指定的 ADK 伺服器獲取可用的代理程式列表。
*   `create_session`: 為指定的代理程式建立一個新的會話。
*   `send_message_to_agent`: 向代理程式會話發送訊息並獲取結果。

### 自訂指令

此擴充功能提供以下自訂指令：

*   `/adk-ext:list_adks`: 列出可用 ADK 伺服器的捷徑。
*   `/adk-ext:list_adk_agent`: 從指定的 ADK 伺服器列出可用代理程式的捷徑。
*   `/adk-ext:agent_chat`: 以類似聊天的​​方式與代理程式互動的指令。
*   `/adk-ext:config_add_server`: 新增 ADK 伺服器設定。
*   `/adk-ext:config_list_servers`: 列出所有 ADK 伺服器設定。
*   `/adk-ext:config_remove_server`: 移除 ADK 伺服器設定。
*   `/adk-ext:create_agent`: 建立新的代理程式。
*   `/adk-ext:deploy_agent`: 部署代理程式。
*   `/adk-ext:evaluate_agent`: 評估代理程式。
*   `/adk-ext:interactive_chat`: 以互動模式與代理程式聊天。
*   `/adk-ext:list_agent_tools`: 列出代理程式的所有工具。
*   `/adk-ext:scan_safety`: 掃描安全問題。
*   `/adk-ext:visualize`: 視覺化代理程式系統結構。

## 安裝

您可以從其 Git 儲存庫安裝此擴充功能：

```bash
gemini extensions install https://github.com/simonliu-ai-product/adk-agent-extension
```

## 使用方式

安裝後，您可以在 Gemini CLI 會話中使用自訂指令。
如需更詳細的使用說明和範例，請參閱 [使用手冊](doc/zhtw/usage.md)。

**範例：**

1.  列出可用的 ADK：
    ```
    /adk-ext:list_adks
    ```

2.  列出 ADK 的代理程式：
    ```
    /adk-ext:list_adk_agent
    ```
    （系統將提示您輸入 ADK 伺服器 URL）

3.  與代理程式聊天：
    ```
    /adk-ext:agent_chat
    ```
    （系統將提示您輸入必要的參數）

您也可以在提示中直接使用 MCP 伺服器提供的工具。

## 設定

### `adk_agent_list.json`

此檔案用於設定可用的 ADK 代理程式列表。它應該放在擴充功能的根目錄中。

該檔案應包含一個帶有 `agents` 鍵的 JSON 物件，該鍵是一個代理程式物件的陣列。每個代理程式物件都應具有 `name` 和 `url`。

**`adk_agent_list.json` 範例：**

```json
{
  "agents": [
    {
      "name": "your-agent-name",
      "url": "your-agent-url"
    }
  ]
}
```

## 開發

### 先決條件

*   Node.js
*   TypeScript
*   Gemini CLI

### 設定

1.  **克隆儲存庫：**
    ```bash
    git clone <repository-url>
    cd google-adk-agent-extension
    ```

2.  **安裝相依套件：**
    ```bash
    npm install
    ```

3.  **建置擴充功能：**
    ```bash
    npm run build
    ```

4.  **連結以進行本機開發：**
    ```bash
    gemini extensions link .
    ```

連結後，重新啟動您的 Gemini CLI 會話以使用擴充功能的本機版本。

## 感謝

感謝 [APMIC](https://www.apmic.ai/) 提供資源和協助，讓我能夠完成此專案
感謝 [Thomas Chong](https://github.com/thomas-chong) 對此專案的貢獻。

## 關於作者
Simon Liu
APMIC MLOps 工程師 x Google 人工智慧開發者專家 (GDE)

人工智慧解決方案領域的技術愛好者，專注於協助企業落地生成式人工智慧 (Generative AI)、MLOps 和大型語言模型 (LLM) 技術，推動數位轉型和實際技術落地。

目前也是 AI 領域的 Google 開發者專家 (GDE)，積極參與技術社區，透過技術文章、演講和實踐經驗分享，推動人工智慧技術的應用和發展。迄今為止，他在 Medium 等平台上發表了百餘篇技術文章，涵蓋生成式人工智慧 (Generative AI)、RAG 和 AI Agents 等主題，並多次在技術研討會上擔任演講嘉賓，分享人工智慧和生成式人工智慧的實際應用。

相關連結：
APMIC 官網：https://www.apmic.ai/
個人社群媒體連結：https://simonliuyuwei.my.canva.site/link-in-bio
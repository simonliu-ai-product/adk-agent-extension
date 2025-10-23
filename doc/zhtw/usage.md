# Google ADK Agent Extension 使用手冊

本文件詳細介紹了如何安裝、設定和使用 Google ADK Agent Gemini CLI Extension。

## 總覽

這個擴充功能提供了一系列的工具和指令，讓您可以直接在 Gemini CLI 中與 ADK (Agent Development Kit) 代理程式進行互動，包括管理設定、建立、部署、評估和視覺化您的 AI 代理程式。

## 1. 安裝

您可以透過 `gemini extensions install` 指令從其 Git 儲存庫安裝此擴充功能：

```bash
gemini extensions install https://github.com/simonliu-ai-product/adk-agent-extension
```

## 2. 設定

安裝後，您需要設定可用的 ADK 代理程式伺服器列表。

### 2.1. `adk_agent_list.json` 檔案

此擴充功能的核心設定檔是 `adk_agent_list.json`，它應該被放在擴充功能的根目錄中。這個檔案包含了您的 ADK 伺服器列表。

**檔案格式範例：**

```json
{
  "agents": [
    {
      "name": "your-agent-name",
      "url": "your-agent-url"
    },
    {
      "name": "another-agent",
      "url": "another-agent-url"
    }
  ]
}
```

### 2.2. 管理伺服器設定

您可以使用以下指令來管理 `adk_agent_list.json` 中的伺服器列表：

*   **列出伺服器**
    ```bash
    /adk-ext:config_list_servers
    ```

*   **新增伺服器**
    ```bash
    /adk-ext:config_add_server <伺服器名稱> <伺服器網址>
    ```
    **範例:**
    ```bash
    /adk-ext:config_add_server my-adk-server https://my-adk-server.com
    ```

*   **移除伺服器**
    ```bash
    /adk-ext:config_remove_server <伺服器名稱>
    ```
    **範例:**
    ```bash
    /adk-ext:config_remove_server my-adk-server
    ```

## 3. 可用指令詳解

以下是所有可用的自訂指令的詳細說明。

---

### 3.1. `/adk-ext:list_adks`

*   **功能:** 列出在 `adk_agent_list.json` 中設定的所有 ADK 伺服器。
*   **參數:** 無。
*   **自然語言範例:**
    ```
    列出所有 ADK 伺服器
    ```
*   **使用範例:**
    ```
    /adk-ext:list_adks
    ```

---

### 3.2. `/adk-ext:list_adk_agent`

*   **功能:** 列出指定 ADK 伺服器上所有可用的代理程式。
*   **參數:**
    *   `adk_server_url` (可選): ADK 伺服器的網址。如果未提供，將會提示您從設定列表中選擇。
*   **自然語言範例:**
    ```
    列出所有 ADK 代理程式
    列出 https://your-adk-server.com 上的 ADK 代理程式
    ```
*   **使用範例:**
    ```
    /adk-ext:list_adk_agent
    ```
    或
    ```
    /adk-ext:list_adk_agent https://your-adk-server.com
    ```

---

### 3.3. `/adk-ext:agent_chat`

*   **功能:** 以類似聊天的方式與指定的代理程式進行互動。這是一個多步驟的指令，會自動處理 session 的建立和訊息的傳送。
*   **參數:**
    *   `agent_name` (可選): 您想要聊天的代理程式名稱。如果未提供，將會提示您選擇。
*   **自然語言範例:**
    ```
    與代理程式聊天
    與 my-agent 代理程式聊天
    ```
*   **使用範例:**
    ```
    /adk-ext:agent_chat
    ```
    或
    ```
    /adk-ext:agent_chat my-agent
    ```

---

### 3.4. `/adk-ext:interactive_chat`

*   **功能:** 啟動一個互動式的聊天 session，讓您可以連續地與代理程式對話，直到您輸入 `/exit` 為止。
*   **參數:**
    *   `--adk_server_url`: ADK 伺服器的網址。
    *   `--agent_name`: 代理程式的名稱。
*   **自然語言範例:**
    ```
    開始與 https://your-adk-server.com 上的 my-agent 代理程式進行互動式聊天
    ```
*   **使用範例:**
    ```
    /adk-ext:interactive_chat --adk_server_url https://your-adk-server.com --agent_name my-agent
    ```

---

### 3.5. `/adk-ext:create_agent`

*   **功能:** 在指定的目錄下建立一個新的 ADK 代理程式專案結構。
*   **參數:**
    *   `agent_name`: 新代理程式的名稱。
    *   `directory_path` (可選): 專案存放的目錄，預設為當前目錄。
*   **自然語言範例:**
    ```
    建立一個名為 my-new-agent 的新代理程式
    在 ./my-projects 目錄中建立一個名為 my-new-agent 的新代理程式
    ```
*   **使用範例:**
    ```
    /adk-ext:create_agent my-new-agent
    ```
    或
    ```
    /adk-ext:create_agent my-new-agent ./my-projects
    ```

---

### 3.6. `/adk-ext:deploy_agent`

*   **功能:** 將您的 ADK 代理程式部署到指定的平台。
*   **參數:**
    *   `agent_path`: 代理程式專案的本地路徑。
    *   `--target`: 部署目標，可選 `cloud-run` 或 `gke`。
    *   `--project`: 您的 Google Cloud 專案 ID。
    *   `--location`: 您的 Google Cloud 地區。
*   **自然語言範例:**
    ```
    將位於 ./my-agent 的代理程式部署到 cloud-run，專案 ID 為 my-gcp-project，地區為 us-central1
    ```
*   **使用範例:**
    ```
    /adk-ext:deploy_agent ./my-agent --target cloud-run --project my-gcp-project --location us-central1
    ```

---

### 3.7. `/adk-ext:evaluate_agent`

*   **功能:** 使用 `adk eval` 指令來評估您的代理程式。
*   **參數:**
    *   `agent_path`: 代理程式專案的本地路徑。
    *   `eval_set_path`: 用於評估的資料集路徑。
*   **自然語言範例:**
    ```
    使用 ./eval-data.json 評估位於 ./my-agent 的代理程式
    ```
*   **使用範例:**
    ```
    /adk-ext:evaluate_agent ./my-agent ./eval-data.json
    ```

---

### 3.8. `/adk-ext:list_agent_tools`

*   **功能:** 列出指定代理程式可用的所有工具。
*   **參數:**
    *   `agent_path`: 代理程式專案的本地路徑。
*   **自然語言範例:**
    ```
    列出位於 ./my-agent 的代理程式的所有工具
    ```
*   **使用範例:**
    ```
    /adk-ext:list_agent_tools ./my-agent
    ```

---

### 3.9. `/adk-ext:scan_safety`

*   **功能:** 掃描您的代理程式程式碼，尋找潛在的安全漏洞。
*   **參數:**
    *   `agent_path`: 代理程式專案的本地路徑。
*   **自然語言範例:**
    ```
    掃描位於 ./my-agent 的代理程式的安全性
    ```
*   **使用範例:**
    ```
    /adk-ext:scan_safety ./my-agent
    ```

---

### 3.10. `/adk-ext:visualize`

*   **功能:** 產生一個 Mermaid 格式的圖表，視覺化呈現代理程式的系統結構。
*   **參數:**
    *   `agent_path`: 代理程式專案的本地路徑。
*   **自然語言範例:**
    ```
    視覺化位於 ./my-agent 的代理程式系統
    ```
*   **使用範例:**
    ```
    /adk-ext:visualize ./my-agent
    ```

## 4. 核心工具 (進階使用)

除了上述的自訂指令，此擴充功能也提供了一系列核心工具，讓您可以透過 prompt 更靈活地與 ADK 互動。

*   `list_adks`: 列出設定的 ADK 伺服器。
*   `list_adk_agents`: 從指定 URL 獲取代理程式列表。
*   `create_session`: 為指定的代理程式建立一個新的 session。
*   `send_message_to_agent`: 向代理程式發送單次訊息並獲取結果。
*   `stream_message_to_agent`: 向代理程式發送訊息並以串流方式獲取回應。
*   `create_agent`: 建立新的 ADK 代理程式專案。
*   `deploy_agent`: 部署 ADK 代理程式。
*   `evaluate_agent`: 評估 ADK 代理程式。
*   `list_agent_tools`: 列出代理程式的工具。
*   `manage_chat_session`: 管理互動式聊天 session。
*   `add_adk_server`: 新增 ADK 伺服器到設定檔。
*   `remove_adk_server`: 從設定檔移除 ADK 伺服器。
*   `list_adk_servers`: 列出所有設定的 ADK 伺服器。
*   `visualize_agent_system`: 產生代理程式系統的 Mermaid 圖表。
*   `scan_agent_safety`: 掃描代理程式的安全性。

## 5. 開發

如果您想要修改或擴充此專案，請參考以下步驟。

### 先決條件

*   Node.js
*   TypeScript
*   Gemini CLI

### 設定步驟

1.  **克隆儲存庫：**
    ```bash
    git clone https://github.com/simonliu-ai-product/adk-agent-extension
    cd adk-agent-extension
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

連結後，重新啟動您的 Gemini CLI，即可使用您本機版本的擴充功能。

import { WebSocket, WebSocketServer } from "ws";
import { createServerProcess, createWebSocketConnection, forward } from "vscode-ws-jsonrpc/server";
import { toSocket } from "vscode-ws-jsonrpc";

const LSP_COMMANDS = {
  python: ["pyright-langserver", ["--stdio"]],
  cpp: ["clangd"],
  java: ["jdtls"],           // or path to jdtls launch script
  javascript: ["typescript-language-server", ["--stdio"]],
  typescript: ["typescript-language-server", ["--stdio"]],
  go: ["gopls"],
  rust: ["rust-analyzer"],
}

const wss = new WebSocketServer({
  port: 3002
});


wss.on("connection", (ws: WebSocket, req) => {
  const lang = req.url!.replace("/", "").toLowerCase()
  //@ts-ignore
  const config = LSP_COMMANDS[lang];
  if (!config) {
    ws.close(1008, `No LSP for language: ${lang}`)
    return
  }

  console.log(`[LSP] Starting server for: ${lang}`)
  const [cmd, args = []] = config
  const socket = toSocket(ws)
  const wsConnection = createWebSocketConnection(socket)
  const serverConnection = createServerProcess(`${lang} LSP`, cmd, args)

  if (!serverConnection) {
    ws.close(1011, `Failed to start LSP: ${lang}`)
    return
  }

  forward(wsConnection, serverConnection)
})

console.log("server running on port 3002");

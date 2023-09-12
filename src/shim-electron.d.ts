import { WebviewTag } from 'electron'

declare module 'react' {
  // Shim for the `webview` tag
  interface JSXIntrinsicElements {
    webview: React.DetailedHTMLProps<React.HTMLAttributes<WebviewTag>, WebviewTag>
  }
}

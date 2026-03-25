import { SidebarItem } from "@/components/Sidebar";
import { PropDefinition } from "@/components/PropsPanel";

// sdpf-theme のストーリー階層に準拠したサイドバー構造
export const sidebarItems: SidebarItem[] = [
  // デザイントークン（最上位）
  { id: "colors", label: "Color", category: "Tokens" },
  { id: "typography", label: "Typography", category: "Tokens" },
  { id: "spacing", label: "Spacing", category: "Tokens" },
  // コンポーネント
  { id: "button", label: "Button", category: "UI" },
  { id: "card", label: "Card", category: "UI" },
  { id: "chip", label: "Chip", category: "UI" },
  { id: "alert", label: "Alert", category: "UI" },
  { id: "textfield", label: "TextField", category: "Form" },
];

// Figma の Description フィールドから取得される説明
export interface ComponentDescription {
  summary: string;
  usage?: string;
  figmaLink?: string;
  guidelines?: string[];
}

export const componentDescriptions: Record<string, ComponentDescription> = {
  button: {
    summary:
      "ユーザーのアクションを誘導するためのインタラクション要素。フォーム送信、ダイアログの確認、ナビゲーションに使用。",
    usage:
      "**バリアント:**\n- `contained`: 最も重要なアクション（1画面に1〜2個まで）\n- `outlined`: 副次的なアクション、キャンセル\n- `text`: テキストリンクに近い軽いアクション\n\n**サイズ:**\n- `large`: CTA、ヒーロー\n- `medium`: フォーム、ダイアログ\n- `small`: テーブル内、ツールバー",
    guidelines: [
      "ラベルは動詞で始める（「保存する」「送信する」）",
      "disabledの理由をツールチップで表示",
      "ローディング中はスピナーを表示し二重送信を防ぐ",
    ],
  },
  textfield: {
    summary:
      "ラベル上配置のカスタムテキスト入力。MUIの浮動ラベルではなく、常にフィールド上部にラベルが表示される一般的なフォームパターンを採用。",
    usage:
      "**MUI標準との違い:**\n- ラベルがフィールド上部に常に表示（position: static）\n- 浮動アニメーションなし\n- 必須マーク・ツールチップアイコン対応\n\n**バリアント:**\n- `outlined`: デフォルト。フォーム全般\n- `filled`: 背景色がある領域で使用\n- `standard`: インラインの軽い入力",
    guidelines: [
      "必須項目にはラベル末尾に赤い「*」を表示",
      "エラー時は helperText に具体的な修正方法を表示",
      "tooltipで項目の補足説明を提供可能",
    ],
  },
  card: {
    summary:
      "関連する情報をグループ化するコンテナ。一覧表示やダッシュボードのタイルとして使用。",
    usage:
      "**elevation:**\n- `0`: フラット。borderで区別\n- `1〜3`: 通常のカード\n- `4〜8`: フローティング。強調表示",
    guidelines: [
      "カード内のアクションは2つまで",
      "クリック可能なカードにはhoverエフェクトを付ける",
    ],
  },
  chip: {
    summary: "タグ、ステータス、フィルター条件などコンパクトな情報の表示と操作に使用。",
    usage:
      "**用途:**\n- タグ: `outlined` + 削除不可\n- フィルター: `filled` + 選択/削除可能\n- ステータス: `filled` + color で状態表現",
    guidelines: [
      "1行に収まらない場合は「+N」で省略",
      "削除可能な場合は onDelete を設定",
    ],
  },
  alert: {
    summary: "操作結果の通知、警告、エラー表示に使用するフィードバックメッセージ。",
    usage:
      "**severity:**\n- `error`: 操作失敗、バリデーションエラー\n- `warning`: 注意が必要な状態\n- `info`: 補足情報、ヒント\n- `success`: 操作完了の確認",
    guidelines: [
      "自動で消えるのは success と info のみ",
      "error と warning は手動で閉じるまで表示",
    ],
  },
};

export const componentProps: Record<string, PropDefinition[]> = {
  button: [
    { name: "variant", type: "select", defaultValue: "contained", options: ["contained", "outlined", "text"] },
    { name: "color", type: "select", defaultValue: "primary", options: ["primary", "secondary", "error", "warning", "info", "success"] },
    { name: "size", type: "select", defaultValue: "medium", options: ["small", "medium", "large"] },
    { name: "disabled", type: "boolean", defaultValue: false },
    { name: "label", type: "string", defaultValue: "ボタン" },
  ],
  textfield: [
    { name: "variant", type: "select", defaultValue: "outlined", options: ["outlined", "filled", "standard"] },
    { name: "size", type: "select", defaultValue: "medium", options: ["small", "medium"] },
    { name: "label", type: "string", defaultValue: "メールアドレス" },
    { name: "placeholder", type: "string", defaultValue: "example@email.com" },
    { name: "required", type: "boolean", defaultValue: false },
    { name: "disabled", type: "boolean", defaultValue: false },
    { name: "error", type: "boolean", defaultValue: false },
    { name: "helperText", type: "string", defaultValue: "" },
  ],
  card: [
    { name: "title", type: "string", defaultValue: "カードタイトル" },
    { name: "content", type: "string", defaultValue: "カードの内容がここに表示されます。" },
    { name: "elevation", type: "number", defaultValue: 1, min: 0, max: 24 },
  ],
  chip: [
    { name: "label", type: "string", defaultValue: "チップ" },
    { name: "variant", type: "select", defaultValue: "filled", options: ["filled", "outlined"] },
    { name: "color", type: "select", defaultValue: "primary", options: ["primary", "secondary", "error", "warning", "info", "success"] },
    { name: "size", type: "select", defaultValue: "medium", options: ["small", "medium"] },
  ],
  alert: [
    { name: "severity", type: "select", defaultValue: "info", options: ["error", "warning", "info", "success"] },
    { name: "variant", type: "select", defaultValue: "standard", options: ["standard", "filled", "outlined"] },
    { name: "message", type: "string", defaultValue: "これはアラートメッセージです。" },
  ],
};

export function generateCode(componentId: string, values: Record<string, unknown>): string {
  switch (componentId) {
    case "button": {
      const p = [];
      if (values.variant !== "contained") p.push(`variant="${values.variant}"`);
      if (values.color !== "primary") p.push(`color="${values.color}"`);
      if (values.size !== "medium") p.push(`size="${values.size}"`);
      if (values.disabled) p.push("disabled");
      return `import Button from "@mui/material/Button";\n\n<Button ${p.join(" ")}>\n  ${values.label || "ボタン"}\n</Button>`;
    }
    case "textfield": {
      const p = [];
      if (values.label) p.push(`label="${values.label}"`);
      if (values.placeholder) p.push(`placeholder="${values.placeholder}"`);
      if (values.variant !== "outlined") p.push(`variant="${values.variant}"`);
      if (values.size !== "medium") p.push(`size="${values.size}"`);
      if (values.required) p.push("required");
      if (values.disabled) p.push("disabled");
      if (values.error) p.push("error");
      if (values.helperText) p.push(`helperText="${values.helperText}"`);
      return `import { CustomTextField } from "@sdpf/theme";\n\n<CustomTextField\n  ${p.join("\n  ")}\n/>`;
    }
    case "card":
      return `import Card from "@mui/material/Card";\nimport CardContent from "@mui/material/CardContent";\nimport Typography from "@mui/material/Typography";\n\n<Card elevation={${values.elevation}}>\n  <CardContent>\n    <Typography variant="h6">${values.title}</Typography>\n    <Typography variant="body2">${values.content}</Typography>\n  </CardContent>\n</Card>`;
    case "chip": {
      const p = [`label="${values.label}"`];
      if (values.variant !== "filled") p.push(`variant="${values.variant}"`);
      if (values.color !== "primary") p.push(`color="${values.color}"`);
      if (values.size !== "medium") p.push(`size="${values.size}"`);
      return `import Chip from "@mui/material/Chip";\n\n<Chip ${p.join(" ")} />`;
    }
    case "alert":
      return `import Alert from "@mui/material/Alert";\n\n<Alert severity="${values.severity}" variant="${values.variant}">\n  ${values.message}\n</Alert>`;
    default:
      return "// コンポーネントを選択してください";
  }
}

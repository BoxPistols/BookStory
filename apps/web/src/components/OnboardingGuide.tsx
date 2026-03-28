"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";

interface OnboardingGuideProps {
  error?: string | null;
}

const steps = [
  {
    number: "1",
    title: "Figma Plugin をインストール",
    desc: "Figma で BookStory プラグインを追加し、コンポーネントとトークンをスキャンします。",
  },
  {
    number: "2",
    title: "コンポーネントを公開",
    desc: "プラグインの「公開」ボタンで、デザインデータが GitHub に自動コミットされます。",
  },
  {
    number: "3",
    title: "カタログを確認",
    desc: "Vercel が自動デプロイし、ブラウザ上でデザインの完全再現が確認できます。",
  },
];

export function OnboardingGuide({ error }: OnboardingGuideProps) {
  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, md: 5 }, py: { xs: 3, md: 6 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          BookStory へようこそ
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
          Figma で作成したコンポーネントをブラウザ上で完全再現するカタログです。
          まだコンポーネントが登録されていません。以下の手順で始めましょう。
        </Typography>

        {error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          {steps.map((step) => (
            <Paper
              key={step.number}
              variant="outlined"
              sx={{ display: "flex", gap: 2.5, p: 2.5, borderRadius: 2 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  flexShrink: 0,
                }}
              >
                {step.number}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {step.desc}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Paper
          variant="outlined"
          sx={{ p: 2.5, borderRadius: 2, bgcolor: "action.hover" }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            <strong>Figma ワークフロー:</strong> Figma でコンポーネントを作成 → プラグインで「スキャン」→「公開」→
            ブラウザでリアルタイム確認。デザイナーはターミナルに触れる必要はありません。
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

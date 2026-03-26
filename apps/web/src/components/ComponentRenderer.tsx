"use client";

import { createElement, ReactNode } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Slider from "@mui/material/Slider";
import Rating from "@mui/material/Rating";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Snackbar from "@mui/material/Snackbar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InboxIcon from "@mui/icons-material/Inbox";
import StarIcon from "@mui/icons-material/Star";
import MailIcon from "@mui/icons-material/Mail";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import Box from "@mui/material/Box";

// --- MUIコンポーネント自動レジストリ ---
// Figmaのコンポーネント名（小文字）→ レンダラー関数
// 新規コンポーネント追加時はここに1行追加するだけ

type V = Record<string, unknown>;
type Renderer = (v: V) => ReactNode;

// MUI propsに渡すための安全なキャスト
/* eslint-disable @typescript-eslint/no-explicit-any */
const s = (v: unknown, fallback: string = "") => (v as string) || fallback;
const n = (v: unknown, fallback: number = 0) => (typeof v === "number" ? v : fallback);
const b = (v: unknown) => v === true;

const REGISTRY: Record<string, Renderer> = {
  button: (v) => <Button variant={s(v.variant,"contained") as any} color={s(v.color,"primary") as any} size={s(v.size,"medium") as any} disabled={b(v.disabled)}>{s(v.label,"ボタン")}</Button>,
  iconbutton: (v) => <IconButton color={s(v.color,"primary") as any} size={s(v.size,"medium") as any}><MailIcon /></IconButton>,
  fab: (v) => <Fab color={s(v.color,"primary") as any} size={s(v.size,"medium") as any}><AddIcon /></Fab>,
  chip: (v) => <Chip label={s(v.label,"チップ")} variant={s(v.variant,"filled") as any} color={s(v.color,"primary") as any} size={s(v.size,"medium") as any} />,
  checkbox: (v) => <FormControlLabel control={<Checkbox checked={b(v.checked)} color={s(v.color,"primary") as any} />} label={s(v.label,"チェック")} />,
  radio: (v) => <RadioGroup value={s(v.value,"a")}><FormControlLabel value="a" control={<Radio />} label={s(v.label,"選択肢 A")} /><FormControlLabel value="b" control={<Radio />} label="選択肢 B" /></RadioGroup>,
  switch: (v) => <FormControlLabel control={<Switch checked={v.state === "on" || b(v.checked)} size={s(v.size,"medium") as any} />} label={s(v.label,"トグル")} />,
  slider: (v) => <Box sx={{ width: 200 }}><Slider defaultValue={n(v.value,50)} size={s(v.size,"medium") as any} color={s(v.color,"primary") as any} /></Box>,
  rating: (v) => <Rating value={n(v.value,3)} size={s(v.size,"medium") as any} />,
  textfield: (v) => {
    const label = s(v.label);
    return (
      <FormControl fullWidth disabled={b(v.disabled)} error={b(v.error)} sx={{ maxWidth: 360 }}>
        {label && <InputLabel shrink sx={{ position: "static", transform: "none", mb: 0.5, fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}>{label}{b(v.required) && <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Box>}</InputLabel>}
        <TextField variant={s(v.variant,"outlined") as any} size={s(v.size,"medium") as any} disabled={b(v.disabled)} error={b(v.error)} placeholder={s(v.placeholder)} />
        {s(v.helperText) && <FormHelperText>{s(v.helperText)}</FormHelperText>}
      </FormControl>
    );
  },
  alert: (v) => <Alert severity={s(v.severity,"info") as any} variant={s(v.variant,"standard") as any} sx={{ minWidth: 300 }}>{s(v.message,"アラートメッセージ")}</Alert>,
  badge: (v) => <Badge badgeContent={n(v.count,4)} color={s(v.color,"primary") as any}><MailIcon color="action" /></Badge>,
  avatar: (v) => <Avatar sx={{ width: v.size === "large" ? 56 : v.size === "small" ? 24 : 40, height: v.size === "large" ? 56 : v.size === "small" ? 24 : 40, bgcolor: "primary.main" }}>{v.variant === "icon" ? <PersonIcon /> : s(v.label,"A")}</Avatar>,
  tooltip: (v) => <Tooltip title={s(v.title,"ツールチップ")} open><Button variant="outlined">{s(v.label,"ホバー")}</Button></Tooltip>,
  skeleton: (v) => <Skeleton variant={s(v.variant,"rectangular") as any} width={n(v.width,200)} height={n(v.height,40)} />,
  breadcrumbs: () => <Breadcrumbs><Link underline="hover" color="inherit" href="#">ホーム</Link><Link underline="hover" color="inherit" href="#">カテゴリ</Link><Typography color="text.primary">現在のページ</Typography></Breadcrumbs>,
  pagination: (v) => <Pagination count={n(v.count,10)} color={s(v.color,"primary") as any} size={s(v.size,"medium") as any} />,
  card: (v) => <Card elevation={n(v.elevation,1)} sx={{ maxWidth: 345 }}><CardContent><Typography variant="h6" gutterBottom>{s(v.title,"カード")}</Typography><Typography variant="body2" color="text.secondary">{s(v.content,"カードの内容")}</Typography></CardContent></Card>,
  divider: () => <Box sx={{ width: 300 }}><Typography variant="body2" sx={{ mb: 1 }}>上のコンテンツ</Typography><Divider /><Typography variant="body2" sx={{ mt: 1 }}>下のコンテンツ</Typography></Box>,
  linearprogress: (v) => <Box sx={{ width: 300 }}><LinearProgress variant="determinate" value={n(v.value,60)} color={s(v.color,"primary") as any} /></Box>,
  circularprogress: (v) => <CircularProgress variant="determinate" value={n(v.value,60)} color={s(v.color,"primary") as any} size={v.size === "large" ? 56 : v.size === "small" ? 24 : 40} />,

  // 複合コンポーネント（常に開いた状態でプレビュー）
  dialog: (v) => (
    <Paper elevation={24} sx={{ width: 360, borderRadius: 2 }}>
      <DialogTitle>{s(v.title,"確認")}</DialogTitle>
      <DialogContent><Typography variant="body2">{s(v.message,"この操作を実行しますか？")}</Typography></DialogContent>
      <DialogActions><Button color="inherit">キャンセル</Button><Button variant="contained">{s(v.action,"確認")}</Button></DialogActions>
    </Paper>
  ),

  drawer: () => (
    <Paper elevation={8} sx={{ width: 240, height: 300, overflow: "hidden" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}><Typography variant="h6" fontSize={16}>メニュー</Typography></Box>
      <List disablePadding>
        <ListItemButton selected><ListItemIcon><InboxIcon /></ListItemIcon><ListItemText primary="受信トレイ" /></ListItemButton>
        <ListItemButton><ListItemIcon><StarIcon /></ListItemIcon><ListItemText primary="スター付き" /></ListItemButton>
        <ListItemButton><ListItemIcon><MailIcon /></ListItemIcon><ListItemText primary="送信済み" /></ListItemButton>
      </List>
    </Paper>
  ),

  snackbar: (v) => (
    <Paper elevation={6} sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, borderRadius: 1, minWidth: 280 }}>
      <Typography variant="body2" sx={{ flex: 1 }}>{s(v.message,"操作が完了しました")}</Typography>
      <Button size="small" color="primary">閉じる</Button>
    </Paper>
  ),

  tabs: (v) => (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={0} textColor="primary" indicatorColor="primary">
        <Tab label="タブ 1" /><Tab label="タブ 2" /><Tab label="タブ 3" />
      </Tabs>
    </Box>
  ),

  stepper: (v) => (
    <Stepper activeStep={n(v.step,1)} sx={{ width: 400 }}>
      <Step><StepLabel>入力</StepLabel></Step>
      <Step><StepLabel>確認</StepLabel></Step>
      <Step><StepLabel>完了</StepLabel></Step>
    </Stepper>
  ),

  accordion: (v) => (
    <Box sx={{ width: 360 }}>
      <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{s(v.title,"セクション 1")}</Typography></AccordionSummary><AccordionDetails><Typography variant="body2" color="text.secondary">アコーディオンの内容がここに表示されます。</Typography></AccordionDetails></Accordion>
      <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>セクション 2</Typography></AccordionSummary><AccordionDetails><Typography variant="body2" color="text.secondary">追加のコンテンツ。</Typography></AccordionDetails></Accordion>
    </Box>
  ),

  appbar: () => (
    <AppBar position="static" sx={{ width: 400, borderRadius: 1 }}>
      <Toolbar variant="dense"><Typography variant="h6" sx={{ flexGrow: 1, fontSize: 16 }}>アプリタイトル</Typography><IconButton color="inherit"><MailIcon /></IconButton></Toolbar>
    </AppBar>
  ),

  table: () => (
    <Paper variant="outlined" sx={{ width: 360, borderRadius: 2, overflow: "hidden" }}>
      <Table size="small">
        <TableHead><TableRow><TableCell>名前</TableCell><TableCell>役割</TableCell><TableCell align="right">スコア</TableCell></TableRow></TableHead>
        <TableBody>
          <TableRow><TableCell>田中</TableCell><TableCell>デザイナー</TableCell><TableCell align="right">92</TableCell></TableRow>
          <TableRow><TableCell>鈴木</TableCell><TableCell>エンジニア</TableCell><TableCell align="right">88</TableCell></TableRow>
          <TableRow><TableCell>佐藤</TableCell><TableCell>PM</TableCell><TableCell align="right">95</TableCell></TableRow>
        </TableBody>
      </Table>
    </Paper>
  ),
};

// --- エクスポート ---

interface ComponentRendererProps {
  componentId: string;
  values: Record<string, unknown>;
}

export function ComponentRenderer({ componentId, values }: ComponentRendererProps) {
  const renderer = REGISTRY[componentId];

  if (renderer) {
    return <>{renderer(values)}</>;
  }

  return (
    <Box>
      <Typography color="text.secondary">
        コンポーネントを選択してください
      </Typography>
    </Box>
  );
}

// レジストリに登録済みかチェック（外部から使用）
export function hasRenderer(id: string): boolean {
  return id in REGISTRY;
}

// 登録済みコンポーネント名一覧
export const REGISTERED_COMPONENTS = Object.keys(REGISTRY);

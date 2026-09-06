# 現場レシート デモ

T conference 2026 のプレゼン資料に QR コードで載せる、観客体験用デモアプリです。
審査員がスマホで 1〜2 分触って「現場レシート」の提案内容を理解できるように作っています。

トラックドライバーの待機時間・契約外作業を自動記録し、
「現場レシート」として運送会社と荷主の両方に同時に届ける流れを体験できます。

## ローカルで起動する

```bash
git clone https://github.com/gunetaro/genba-receipt.git
cd genba-receipt
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。
スマホ表示の確認には、DevTools のモバイルビュー（iPhone SE / 360px 幅）を使ってください。

## Vercel にデプロイする

1. [vercel.com](https://vercel.com) にログイン
2. 「Add New...」→「Project」を選択
3. 「Import Git Repository」で `gunetaro/genba-receipt` を選ぶ
4. フレームワークは Next.js が自動検出される。設定はそのままで「Deploy」を押す
5. デプロイ完了後、表示される URL がそのままデモ用 URL になる

## 技術構成

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- 外部サービス・DB・認証なし。状態は React state のみ
- フォント: Noto Sans JP（next/font で最適化読み込み）

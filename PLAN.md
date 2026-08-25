<!-- 作成日: 2026-08-25 -->

# MDLinkCopy 作成手順書

## 目的

`MDLinkCopy` は、現在開いているページのタイトルとURLを Markdown リンク形式でクリップボードにコピーする Firefox 拡張機能です。

コピー形式:

```md
[ページタイトル](https://example.com/path)
```

主な機能:

- Firefox のツールバーにコピーボタンを表示する
- ツールバーボタンを押すと現在のページを Markdown リンクとしてコピーする
- ホットキーでもコピーできる
- コピー時にページ上へ `コピーしました` のトーストを表示する
- 設定画面で削除したいURLパラメータを管理する
- 商品IDなど、削除すべきでないパラメータは残せるようにする

## 技術方針

Firefox の WebExtensions API を使って実装します。

- Manifest は `manifest_version: 3` を採用する
- ツールバーボタンは `action` を使う
- ホットキーは `commands` を使う
- 設定画面は `options_ui` を使う
- 設定値は `browser.storage.local` に保存する
- クリップボード書き込みには `clipboardWrite` 権限を使う
- トースト表示は現在のタブへ content script を注入して表示する

参考:

- [MDN: manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- [MDN: action](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)
- [MDN: commands](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands)
- [MDN: permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions)

## 完成時のディレクトリ構成

```text
MDLinkCopy/
  manifest.json
  background.js
  content/
    toast.js
  options/
    options.html
    options.css
    options.js
  icons/
    clipboard-chain-16.png
    clipboard-chain-32.png
    clipboard-chain-48.png
    clipboard-chain-128.png
  README.md
```

## 実装手順

### 1. プロジェクト初期化

まず、拡張機能に必要な最低限のファイルを作成します。

```sh
mkdir -p content options icons
touch manifest.json background.js content/toast.js
touch options/options.html options/options.css options/options.js
touch README.md
```

この段階ではビルドツールを入れず、素の JavaScript / HTML / CSS で作ります。Firefox 拡張機能は `manifest.json` があれば読み込めるため、最初は小さく動かします。

### 2. manifest.json を作成

`manifest.json` に拡張機能の名前、権限、ツールバーボタン、ホットキー、設定画面を定義します。

```json
{
  "manifest_version": 3,
  "name": "MDLinkCopy",
  "version": "0.1.0",
  "description": "Copy the current page as a Markdown link.",
  "permissions": ["activeTab", "clipboardWrite", "storage", "scripting"],
  "background": {
    "scripts": ["background.js"]
  },
  "action": {
    "default_title": "Copy as Markdown link",
    "default_icon": {
      "16": "icons/clipboard-chain-16.png",
      "32": "icons/clipboard-chain-32.png"
    }
  },
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+C",
        "mac": "Command+Shift+C"
      },
      "description": "Copy the current page as a Markdown link"
    }
  },
  "options_ui": {
    "page": "options/options.html",
    "open_in_tab": true
  },
  "icons": {
    "48": "icons/clipboard-chain-48.png",
    "128": "icons/clipboard-chain-128.png"
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "mdlinkcopy@example.com"
    }
  }
}
```

注意点:

- `action` は Manifest V3 でツールバーボタンを定義するために使う
- `_execute_action` はツールバーボタンを押した時と同じ処理をホットキーから呼ぶために使う
- `scripting` はトースト表示用の script を現在のタブに注入するために使う
- `storage` は削除対象パラメータなどの設定保存に使う

### 3. コピー処理を background.js に実装

ツールバーボタンまたはホットキーが実行されたら、現在のタブ情報を取得して Markdown リンクを生成します。

実装する処理:

1. アクティブタブを取得する
2. タブの `title` と `url` を取得する
3. URLから不要なクエリパラメータを削除する
4. `[title](url)` 形式の文字列を作る
5. クリップボードにコピーする
6. 現在のタブにトーストを表示する

サンプル実装:

```js
const DEFAULT_REMOVE_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "gad_source",
  "source"
];

browser.action.onClicked.addListener(copyCurrentTabAsMarkdown);

async function copyCurrentTabAsMarkdown(tab) {
  if (!tab || !tab.url || !tab.title) {
    return;
  }

  const cleanUrl = await sanitizeUrl(tab.url);
  const markdown = `[${escapeMarkdownTitle(tab.title)}](${cleanUrl})`;

  await navigator.clipboard.writeText(markdown);
  await showToast(tab.id);
}

async function sanitizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  const settings = await browser.storage.local.get({
    removeParams: DEFAULT_REMOVE_PARAMS,
    keepParams: []
  });

  const removeParams = new Set(settings.removeParams);
  const keepParams = new Set(settings.keepParams);

  for (const key of [...url.searchParams.keys()]) {
    if (keepParams.has(key)) {
      continue;
    }

    if (removeParams.has(key)) {
      url.searchParams.delete(key);
    }
  }

  return url.toString();
}

function escapeMarkdownTitle(title) {
  return title.replaceAll("[", "\\[").replaceAll("]", "\\]");
}

async function showToast(tabId) {
  await browser.scripting.executeScript({
    target: { tabId },
    files: ["content/toast.js"]
  });
}
```

### 4. URLパラメータ削除ルールを設計

設定は2種類に分けます。

```json
{
  "removeParams": ["utm_source", "gad_source", "source"],
  "keepParams": ["id", "product_id", "item_id", "asin"]
}
```

考え方:

- `removeParams` に含まれるキーは削除する
- `keepParams` に含まれるキーは削除対象に入っていても残す
- 商品IDや記事IDの可能性があるキーは初期状態では削除しない

初期削除候補:

```text
utm_source
utm_medium
utm_campaign
utm_term
utm_content
fbclid
gclid
gad_source
source
ref
spm
yclid
mc_cid
mc_eid
```

初期保持候補:

```text
id
product_id
item_id
asin
sku
p
page
article_id
```

ただし `p` や `page` はサイトによって意味が変わるため、初期保持に入れるかは慎重に決めます。

### 5. トースト表示用 content/toast.js を作成

コピー完了時、現在のページに短時間だけ `コピーしました` を表示します。

サンプル実装:

```js
const existingToast = document.getElementById("mdlinkcopy-toast");

if (existingToast) {
  existingToast.remove();
}

const toast = document.createElement("div");
toast.id = "mdlinkcopy-toast";
toast.textContent = "コピーしました";
toast.style.position = "fixed";
toast.style.right = "24px";
toast.style.bottom = "24px";
toast.style.zIndex = "2147483647";
toast.style.padding = "10px 14px";
toast.style.borderRadius = "6px";
toast.style.background = "#202124";
toast.style.color = "#ffffff";
toast.style.fontSize = "14px";
toast.style.fontFamily = "system-ui, sans-serif";
toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";
toast.style.opacity = "0";
toast.style.transition = "opacity 160ms ease";

document.documentElement.appendChild(toast);

requestAnimationFrame(() => {
  toast.style.opacity = "1";
});

setTimeout(() => {
  toast.style.opacity = "0";

  setTimeout(() => {
    toast.remove();
  }, 180);
}, 1600);
```

### 6. 設定画面を作成

`options/options.html` には、削除対象と保持対象のパラメータを編集するUIを作ります。

必要なUI:

- 削除するパラメータ一覧
- 削除しないパラメータ一覧
- パラメータ追加フォーム
- パラメータ削除ボタン
- デフォルトに戻すボタン
- 保存完了メッセージ

画面例:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <title>MDLinkCopy Settings</title>
    <link rel="stylesheet" href="options.css">
  </head>
  <body>
    <main>
      <h1>MDLinkCopy</h1>

      <section>
        <h2>削除するパラメータ</h2>
        <textarea id="removeParams" rows="10"></textarea>
      </section>

      <section>
        <h2>削除しないパラメータ</h2>
        <textarea id="keepParams" rows="10"></textarea>
      </section>

      <button id="save">保存</button>
      <button id="reset" type="button">デフォルトに戻す</button>
      <p id="status" role="status"></p>
    </main>

    <script src="options.js"></script>
  </body>
</html>
```

`options/options.js` では、textarea の内容を1行1パラメータとして読み書きします。

```js
const DEFAULT_REMOVE_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "gad_source", "source"];
const DEFAULT_KEEP_PARAMS = ["id", "product_id", "item_id", "asin", "sku"];

const removeParamsInput = document.getElementById("removeParams");
const keepParamsInput = document.getElementById("keepParams");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
const status = document.getElementById("status");

restoreOptions();

saveButton.addEventListener("click", saveOptions);
resetButton.addEventListener("click", resetOptions);

async function restoreOptions() {
  const settings = await browser.storage.local.get({
    removeParams: DEFAULT_REMOVE_PARAMS,
    keepParams: DEFAULT_KEEP_PARAMS
  });

  removeParamsInput.value = settings.removeParams.join("\n");
  keepParamsInput.value = settings.keepParams.join("\n");
}

async function saveOptions() {
  await browser.storage.local.set({
    removeParams: parseLines(removeParamsInput.value),
    keepParams: parseLines(keepParamsInput.value)
  });

  status.textContent = "保存しました";
  setTimeout(() => {
    status.textContent = "";
  }, 1600);
}

async function resetOptions() {
  removeParamsInput.value = DEFAULT_REMOVE_PARAMS.join("\n");
  keepParamsInput.value = DEFAULT_KEEP_PARAMS.join("\n");
  await saveOptions();
}

function parseLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
```

### 7. Firefox で読み込んで動作確認

Firefox の一時的な拡張機能として読み込みます。

1. Firefox で `about:debugging#/runtime/this-firefox` を開く
2. `一時的なアドオンを読み込む` を押す
3. `MDLinkCopy/manifest.json` を選択する
4. ツールバーにアイコンが表示されることを確認する
5. 任意のWebページを開く
6. ツールバーボタンを押す
7. クリップボードに Markdown リンクが入ることを確認する
8. ページ上に `コピーしました` のトーストが表示されることを確認する
9. `Ctrl+Shift+C` または macOS では `Command+Shift+C` でもコピーできることを確認する

確認例:

```md
[Example Domain](https://example.com/)
```

### 8. URLパラメータ削除のテスト

次のようなURLで確認します。

```text
https://example.com/article?id=123&utm_source=newsletter&gad_source=abc
```

期待結果:

```text
https://example.com/article?id=123
```

確認観点:

- `utm_source` が削除される
- `gad_source` が削除される
- `id=123` は残る
- 設定画面で `id` を削除対象に入れても、保持対象に `id` があれば残る
- `?` だけが残らない
- ハッシュ `#section` は残る

### 9. エラーケースを確認

次のページではコピーやトースト注入が失敗する可能性があります。

- `about:` ページ
- `moz-extension:` ページ
- Firefox の内部設定ページ
- 権限が制限されているページ

対応方針:

- コピーできない場合は何もしない
- 可能なら `browser.notifications` を使って拡張機能側の通知を出す
- 初期版では通常のWebページを対象にする

### 10. README.md を作成

README には以下を記載します。

- 拡張機能の概要
- 機能一覧
- インストール方法
- 一時的なアドオンとして読み込む方法
- 設定画面の使い方
- ホットキー
- 開発メモ

### 11. アイコンを追加

`icons/` にツールバーとアドオン一覧で使うアイコンを配置します。

```text
clipboard-chain-16.png
clipboard-chain-32.png
clipboard-chain-48.png
clipboard-chain-128.png
```

初期版ではシンプルなリンクアイコンや Markdown の `M` を使ったアイコンで十分です。

### 12. リリース前チェック

リリース前に以下を確認します。

- `manifest.json` に不要な権限がない
- 設定値が保存、復元できる
- ツールバーボタンでコピーできる
- ホットキーでコピーできる
- コピー後にトーストが表示される
- URLパラメータ削除が期待どおりに動く
- 商品IDや記事IDが消えない
- Markdown の `[` と `]` がタイトルに含まれても壊れない
- Firefox のアドオンデバッグ画面でエラーが出ていない

## 実装順序

おすすめの順番:

1. `manifest.json` を作る
2. `background.js` でコピー処理を作る
3. ツールバーボタンでコピーできるところまで確認する
4. `content/toast.js` でトーストを表示する
5. `commands` でホットキーを設定する
6. `options/` で設定画面を作る
7. URLパラメータ削除ルールを調整する
8. README とアイコンを整える
9. Firefox で一通り手動テストする

## 最初のマイルストーン

最初の完成目標は以下です。

- Firefox に一時的なアドオンとして読み込める
- ツールバーボタンを押すと Markdown リンクがコピーされる
- `utm_source` と `gad_source` が削除される
- コピー後に `コピーしました` と表示される

この状態まで作れば、あとは設定画面とパラメータルールを育てていけます。

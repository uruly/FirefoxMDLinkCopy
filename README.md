# MDLinkCopy

MDLinkCopy is a Firefox extension that copies the current page as a Markdown link.

```md
[Page Title](https://example.com/)
```

## Features

- Copy the active page from the Firefox toolbar button.
- Copy with `Ctrl+Shift+C`, or `Command+Shift+C` on macOS.
- Remove tracking query parameters before copying.
- Keep product IDs and article IDs when configured.
- Show a `コピーしました` toast after copying.

## Development

Load the extension temporarily in Firefox:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click `Load Temporary Add-on`.
3. Select `manifest.json` in this directory.
4. Open a normal `http` or `https` page.
5. Click the MDLinkCopy toolbar button.

## Settings

Open the extension options page from Firefox Add-ons Manager.

- `削除するパラメータ`: query parameter names to remove.
- `削除しないパラメータ`: query parameter names to keep even if they appear in the remove list.

Each setting uses one parameter name per line.

Example:

```text
https://example.com/article?id=123&utm_source=newsletter&gad_source=abc
```

Copies as:

```text
https://example.com/article?id=123
```

## Notes

Internal Firefox pages such as `about:` pages cannot be copied by this extension.

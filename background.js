browser.action.onClicked.addListener(copyCurrentTabAsMarkdown);

async function copyCurrentTabAsMarkdown(tab) {
  if (!canCopyTab(tab)) {
    return;
  }

  try {
    const cleanUrl = await sanitizeUrl(tab.url);
    const markdown = `[${escapeMarkdownTitle(tab.title)}](${cleanUrl})`;

    await navigator.clipboard.writeText(markdown);
    await showToast(tab.id, "コピーしました");
  } catch (error) {
    console.error("Failed to copy Markdown link:", error);
    await showToast(tab.id, "コピーできませんでした");
  }
}

function canCopyTab(tab) {
  return Boolean(
    tab &&
      Number.isInteger(tab.id) &&
      tab.title &&
      tab.url &&
      /^https?:\/\//.test(tab.url)
  );
}

async function sanitizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  const settings = await browser.storage.local.get({
    removeParams: [...MDLinkCopyDefaults.removeParams],
    keepParams: [...MDLinkCopyDefaults.keepParams]
  });

  const removeParams = toParamSet(settings.removeParams);
  const keepParams = toParamSet(settings.keepParams);

  for (const key of [...url.searchParams.keys()]) {
    const normalizedKey = key.toLowerCase();

    if (keepParams.has(normalizedKey)) {
      continue;
    }

    if (removeParams.has(normalizedKey)) {
      url.searchParams.delete(key);
    }
  }

  return url.toString();
}

function toParamSet(params) {
  if (!Array.isArray(params)) {
    return new Set();
  }

  return new Set(
    params
      .map((param) => String(param).trim().toLowerCase())
      .filter(Boolean)
  );
}

function escapeMarkdownTitle(title) {
  return title
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replaceAll("\n", " ");
}

async function showToast(tabId, message) {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["content/toast.js"]
    });

    await browser.scripting.executeScript({
      target: { tabId },
      func: (toastMessage) => {
        globalThis.MDLinkCopyShowToast?.(toastMessage);
      },
      args: [message]
    });
  } catch (error) {
    console.error("Failed to show toast:", error);
  }
}

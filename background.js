const TOOLBAR_ICON_PATHS = {
  16: "icons/chatgpt-chain-16.png",
  32: "icons/chatgpt-chain-32.png",
  48: "icons/chatgpt-chain-48.png",
  128: "icons/chatgpt-chain-128.png"
};

browser.runtime.onInstalled.addListener(setToolbarIcon);
browser.runtime.onStartup.addListener(setToolbarIcon);
browser.action.onClicked.addListener(copyCurrentTabAsMarkdown);

setToolbarIcon();

async function setToolbarIcon() {
  try {
    await browser.action.setIcon({ path: TOOLBAR_ICON_PATHS });
  } catch (error) {
    console.error("Failed to set toolbar icon:", error);
  }
}

async function copyCurrentTabAsMarkdown(tab) {
  if (!canCopyTab(tab)) {
    return;
  }

  try {
    const cleanUrl = await sanitizeUrl(tab.url);
    const markdown = `[${MDLinkCopyUrl.escapeMarkdownTitle(tab.title)}](${MDLinkCopyUrl.escapeMarkdownUrl(cleanUrl)})`;

    await navigator.clipboard.writeText(markdown);
    await showToast(tab.id, "サイト名とリンクをコピーしました");
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

  return MDLinkCopyUrl.sanitizeUrlWithRules(
    url.toString(),
    settings.removeParams,
    settings.keepParams
  );
}

async function showToast(tabId, message) {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: showToastInPage,
      args: [message]
    });
  } catch (error) {
    console.error("Failed to show toast:", error);
  }
}

function showToastInPage(message) {
  const existingToast = document.getElementById("mdlinkcopy-toast");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "mdlinkcopy-toast";
  toast.setAttribute("role", "status");

  Object.assign(toast.style, {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: "2147483647",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "6px",
    background: "#202124",
    color: "#ffffff",
    fontSize: "12px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    lineHeight: "1.4",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    opacity: "0",
    transform: "translateY(-6px)",
    transition: "opacity 160ms ease, transform 160ms ease"
  });

  const check = document.createElement("span");
  check.textContent = "✓";
  Object.assign(check.style, {
    display: "inline-grid",
    placeItems: "center",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "#2e7d32",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "700",
    lineHeight: "1",
    flex: "0 0 auto"
  });

  const text = document.createElement("span");
  text.textContent = message;

  toast.append(check, text);
  document.documentElement.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-6px)";

    setTimeout(() => {
      toast.remove();
    }, 180);
  }, 1600);
}

globalThis.MDLinkCopyShowToast = (message) => {
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
    transition: "opacity 160ms ease"
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
  });

  setTimeout(() => {
    toast.style.opacity = "0";

    setTimeout(() => {
      toast.remove();
    }, 180);
  }, 1600);
};

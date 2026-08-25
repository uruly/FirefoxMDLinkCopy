globalThis.MDLinkCopyShowToast = (message) => {
  const existingToast = document.getElementById("mdlinkcopy-toast");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "mdlinkcopy-toast";
  toast.textContent = message;
  toast.setAttribute("role", "status");

  Object.assign(toast.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: "2147483647",
    padding: "10px 14px",
    borderRadius: "6px",
    background: "#202124",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    lineHeight: "1.4",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    opacity: "0",
    transition: "opacity 160ms ease"
  });

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

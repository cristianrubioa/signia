document.querySelectorAll('link[rel="stylesheet"][media="print"]').forEach(function (link) {
  function activate() {
    link.media = "all";
  }
  // Fetching this external script takes its own round trip, so the print-media
  // stylesheet may already be loaded (link.sheet set) by the time we get here —
  // its "load" event won't fire again, so check for that case explicitly.
  if (link.sheet) {
    activate();
  } else {
    link.addEventListener("load", activate, { once: true });
  }
});

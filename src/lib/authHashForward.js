/** HTML that forwards to the client auth page WITHOUT losing URL hash tokens. */
export function authHashForwardHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Signing you in…</title>
</head>
<body>
  <p>Signing you in…</p>
  <script>
    (function () {
      var target = "/onboarding/auth/callback" + window.location.search + window.location.hash;
      window.location.replace(target);
    })();
  </script>
</body>
</html>`;
}

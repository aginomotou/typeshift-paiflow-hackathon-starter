// Public Paiflow hosted pages for this deployment, derived from the public
// deployment URL (origin + UUID only; no token). Paiflow sends
// X-Frame-Options: DENY, so these open in a new tab or via QR, never an iframe.
export type HostedLinks = { embedUrl: string; triggerUrl: string };

export function hostedLinks(deploymentUrl: string | null): HostedLinks | null {
  if (!deploymentUrl) return null;
  try {
    const url = new URL(deploymentUrl);
    const match = /^\/deployments\/([0-9a-f-]{36})\/?$/i.exec(url.pathname);
    if (!match) return null;
    return {
      embedUrl: `${url.origin}/deployments/${match[1]}/embed`,
      triggerUrl: `${url.origin}/trigger/${match[1]}`,
    };
  } catch {
    return null;
  }
}

// The trigger page takes a token amount hint (e.g. "50"), not stroops.
// The payer can still change it on Paiflow's page.
export function triggerWithAmount(triggerUrl: string, amount: string) {
  return /^\d+(\.\d{1,7})?$/.test(amount)
    ? `${triggerUrl}?amount=${encodeURIComponent(amount)}`
    : triggerUrl;
}

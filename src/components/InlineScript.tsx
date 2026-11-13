/**
 * A script that runs while the HTML is parsed, before first paint. The type
 * switch stops React re-running it on the client (see the Next.js guide
 * "How to prevent flash before hydration").
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

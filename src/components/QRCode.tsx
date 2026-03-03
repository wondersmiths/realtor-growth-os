"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";

export default function QRCode({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCodeLib.toDataURL(url, { width: 128, margin: 1 }).then(setSrc);
  }, [url]);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!src) return null;

  return (
    <div className="flex items-center gap-3 mt-2">
      <img src={src} alt="QR Code" width={128} height={128} />
      <div className="flex flex-col gap-1">
        <a
          href={url}
          className="text-xs text-blue-600 underline break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
        <button
          onClick={copyLink}
          className="text-xs text-gray-500 hover:text-gray-700 text-left"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

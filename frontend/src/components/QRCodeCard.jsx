import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { MapPin, Printer, Loader2 } from "lucide-react";

/**
 * Gera e exibe o QR Code de um local.
 * O QR aponta para `${origem}/chamado?local=:codigo` — a rota PÚBLICA
 * de abertura de chamado (sem login). Esse é o fluxo principal: quem
 * escaneia não precisa de conta para comunicar um problema.
 */
export default function QRCodeCard({ local }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [gerando, setGerando] = useState(true);

  const url = `${window.location.origin}/chamado?local=${local.codigo}`;

  useEffect(() => {
    let cancelado = false;
    setGerando(true);

    QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: "#181C21" } })
      .then((dataUrl) => {
        if (!cancelado) setQrDataUrl(dataUrl);
      })
      .finally(() => {
        if (!cancelado) setGerando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [url]);

  function imprimir() {
    if (!qrDataUrl) return;

    const janela = window.open("", "_blank", "width=420,height=560");
    janela.document.write(`
      <html>
        <head>
          <title>QR Code — ${local.nome}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 32px 16px; }
            img { width: 240px; height: 240px; }
            h1 { font-size: 16px; margin: 20px 0 4px; }
            p { font-size: 12px; color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${qrDataUrl}" onload="window.print(); window.onafterprint = () => window.close();" />
          <h1>${local.nome}</h1>
          <p>${local.bloco || ""}</p>
          <p>Manutenção IFMS Campus Jardim</p>
        </body>
      </html>
    `);
    janela.document.close();
  }

  return (
    <div className="surface-card p-4 flex flex-col items-center text-center">
      <div className="w-full flex items-center gap-2 text-left mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-800 truncate">{local.nome}</p>
          <p className="text-xs text-neutral-400 truncate">{local.bloco || "Sem bloco definido"}</p>
        </div>
      </div>

      <div className="w-full aspect-square max-w-[180px] rounded-lg border border-neutral-200 bg-white flex items-center justify-center overflow-hidden">
        {gerando ? (
          <Loader2 className="w-5 h-5 text-neutral-300 animate-spin" />
        ) : (
          <img src={qrDataUrl} alt={`QR Code do local ${local.nome}`} className="w-full h-full object-contain p-2" />
        )}
      </div>

      <p className="font-mono text-xs text-neutral-400 mt-3">{local.codigo}</p>

      <button
        onClick={imprimir}
        disabled={gerando}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
      >
        <Printer className="w-3.5 h-3.5" /> Imprimir
      </button>
    </div>
  );
}

"use client"

import { useState } from "react"
import { QrCode, Printer } from "lucide-react"

export default function RoomQRCode({ roomId, roomName }: { roomId: string; roomName: string }) {
  const [show, setShow] = useState(false)
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/rooms/${roomId}`
    : `/rooms/${roomId}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=300x300&format=png&margin=10`

  function printQR() {
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html><head><title>QR – ${roomName}</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 40px; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        p { color: #555; margin-bottom: 24px; }
        img { width: 280px; height: 280px; }
      </style></head>
      <body>
        <h1>${roomName}</h1>
        <p>Scan to book a laundry slot</p>
        <img src="${qrSrc}" />
        <p style="margin-top:16px;font-size:12px;color:#999">${url}</p>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode size={18} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">QR Code</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Print and post this QR code in the laundry room. Residents scan it to go directly to the booking page.
      </p>

      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <QrCode size={15} />
          Show QR code
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt={`QR code for ${roomName}`} width={220} height={220} className="rounded-xl border border-gray-100" />
          <p className="text-xs text-gray-400 text-center">{url}</p>
          <div className="flex gap-3">
            <button
              onClick={printQR}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={() => setShow(false)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              Hide
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

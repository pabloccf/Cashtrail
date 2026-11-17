// Saves a file that is already in memory (a Blob) to the user's device.
// A temporary object URL ("blob:http://localhost:5173/…") points to the Blob, and clicking an
// <a download> with it makes the browser save the file instead of navigating to it
export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // The URL keeps the Blob in memory until it is revoked. Revoking it right after the click works in
  // Chrome, but some browsers (Safari) start the download a moment later and would cancel it
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

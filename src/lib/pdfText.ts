// Reads the text out of a statement PDF on this device. The file is never uploaded.
// pdf.js is large, so it only loads when someone actually opens a statement.

export class NeedsPassword extends Error {
  constructor(public wrong: boolean) {
    super('This statement is protected by a password.')
  }
}

type Item = { str: string; x: number; y: number }

/** PDF text comes in loose pieces. Put them back into rows by their position on the page. */
function toLines(items: Item[]) {
  const rows: Item[][] = []
  for (const item of [...items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows.find((r) => Math.abs(r[0].y - item.y) < 3)
    if (row) row.push(item)
    else rows.push([item])
  }
  return rows.map((r) =>
    r
      .sort((a, b) => a.x - b.x)
      .map((i) => i.str)
      .join('  ')
      .replace(/ {3,}/g, '  ')
      .trim(),
  )
}

export async function readPdf(file: File, password?: string) {
  // The legacy build keeps statements working on older Android phones.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const { default: worker } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker
  try {
    const task = pdfjs.getDocument({ data: await file.arrayBuffer(), password })
    const doc = await task.promise
    const lines: string[] = []
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n)
      const content = await page.getTextContent()
      const items = content.items.flatMap((i) => ('str' in i && i.str.trim() ? [{ str: i.str, x: i.transform[4] as number, y: i.transform[5] as number }] : []))
      lines.push(...toLines(items))
    }
    await task.destroy()
    return lines.join('\n')
  } catch (e) {
    if (e instanceof Error && e.name === 'PasswordException') throw new NeedsPassword(!!password)
    throw e
  }
}

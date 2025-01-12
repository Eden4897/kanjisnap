import parse from "node-html-parser";

type Word = {
  text: string
  tokens: { original: string, furigana: string }[]
  link: string
  type: string
}

export async function analyse(text: string): Promise<Word[]> {
  const res = await fetch(`https://jisho.org/search/${text}`)
  const raw = await res.text()
  const root = parse(raw)
  const tokenDOMs = root.querySelectorAll('#zen_bar>ul>li')
  const words: Word[] = []
  for (const tokenDOM of tokenDOMs) {
    let tokens = []
    const furiganas = tokenDOM.querySelectorAll('.japanese_word__furigana_wrapper')
    const original = tokenDOM.querySelectorAll('.japanese_word__text_wrapper')
    const link = 'https://jisho.org/' + tokenDOM.querySelector('span>a')?.attributes['href']
    const type = tokenDOM.getAttribute('data-pos') ?? ''
    for (let i = 0; i < original.length; i++) {
      tokens.push({
        original: original[i].text.replace(/[ \n]/g, ''),
        furigana: furiganas[i].classList.contains('japanese_word__furigana-invisible') ? '' : furiganas[i].text.replace(/[ \n]/g, '')
      })
    }
    if (tokens.length === 0) {
      tokens = [{ original: tokenDOM.text.replace(/[ \n]/g, ''), furigana: '' }]
    }
    words.push({
      text: tokens.map(token => token.original).join('') || tokenDOM.text.replace(/[ \n]/g, ''),
      tokens,
      link,
      type
    })
  }
  return words
}
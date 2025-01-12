import parse from "node-html-parser";
import axios from "axios";

type Fragment = { original: string, furigana: string }

type Word = {
  fragments: Fragment[]
  partsOfSpeaches: string[]
  definitions: string[]
}

export async function analyse(text: string): Promise<[Word[], string]> {
  // If it doesn't end with a punctuation mark, add a period
  const hasPunctuation = /[。！？!]$/.test(text)
  if (!hasPunctuation) {
    text += "。"
  }
  const response = await axios.get(`https://jpdb.io/search?q=${text}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    }
  })
  const html = response.data
  const root = parse(html)
  
  const words: Word[] = []
  
  const wordElements = root.querySelectorAll('.floating-sentence>div')
  const detailBoxes = root.querySelectorAll('.result.vocabulary').map(definitionHTML => {
    return {
      partsOfSpeaches: definitionHTML.querySelectorAll('.part-of-speech>div').map(partOfSpeachElement => partOfSpeachElement.text),
      definitions: definitionHTML.querySelectorAll('.subsection-meanings>*>.description').map(definitionElement => definitionElement.text)
    }
  })
  let detailsBoxIndex = 0
  
  for (const wordElement of wordElements) {
    if (wordElement.childNodes[0].rawTagName == "") {
      words.push({
        fragments: [{ original: wordElement.childNodes[0].rawText, furigana: "" }],
        partsOfSpeaches: ["Punctuation"],
        definitions: []
      })
      continue
    }
    const fragments: Fragment[] = []
    for (const fragmentElement of wordElement.childNodes[0].childNodes) {
      if (fragmentElement.rawTagName == "") {
        fragments.push({ original: fragmentElement.rawText, furigana: "" })
      } else if (fragmentElement.rawTagName == "ruby") {
        const furigana = fragmentElement.childNodes[1].rawText
        const original = fragmentElement.childNodes[0].rawText
        fragments.push({ original, furigana })
      }
    }
    words.push({
      fragments,
      partsOfSpeaches: detailBoxes[detailsBoxIndex].partsOfSpeaches,
      definitions: detailBoxes[detailsBoxIndex].definitions
    })
    detailsBoxIndex += 1
  }
  if (!hasPunctuation) {
    words.pop()
  }
  return [words, root.querySelector('#machine-translation')?.text || ""]
}
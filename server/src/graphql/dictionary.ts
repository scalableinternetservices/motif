export default class Dictionary {
  dictionary: string[] = []
  constructor() {
    this.initalizeDictionary()
  }
  initalizeDictionary() {
    const fs = require('fs')
    const res = fs.readFileSync('./common/src/words.txt', 'utf8')
    this.dictionary = res.split('\n')
  }
  isInDictionary(word: string) {
    const n = this.dictionary.length

    let left = 0
    let right = n - 1
    let middle = 0
    while (left <= right) {
      middle = Math.floor((left + right) / 2)
      //console.log(this.dictionary[middle] + ' ' + middle + ' ' + left + ' ' + right)
      if (word === this.dictionary[middle]) return true

      if (this.dictionary[middle] > word) {
        right = middle - 1
      } else {
        left = middle + 1
      }
    }
    return false
  }
}

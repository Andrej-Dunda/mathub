import { useState } from 'react';
import './NewBookAnalysis.scss'
import BookInput from '../../components/book-input/BookInput';

const NewBookAnalysis = () => {
  const [bookInfo, setBookInfo] = useState({
    bookName: '',
    bookYear: '',
    bookAuthor: '',
    excerptContext: '',
    themeAndMotive: '',
    spaceTime: '',
    composition: '',
    literaryTypeAndGenre: '',
    narratorOrLyricalSubject: '',
    character: '',
    narrativeWays: '',
    typesOfSpeeches: '',
    verseConstruction: '',
    languageResources: '',
    tropesAndFigures: '',
    excerptCharacteristic: '',
    contextOfAuthorsWork: '',
    literaryAndCultureContext: ''
  })

  const handleChange = (event: any) => {
    const { value, name } = event.target
    setBookInfo((prevNote: any) => ({
      ...prevNote, [name]: value
    })
    )
  }

  return (
    <div className="new-book-analysis">
      <div className="new-book-analysis-form">
        <h1>Nový rozbor díla k maturitě</h1>
        <div className="book-analysis-form">
          <div className="book-meta-info">
            <BookInput
              label='Název díla:'
              divClassName='book-name'
              inputId='book-name'
              inputName='bookName'
              value={bookInfo.bookName}
              onChange={handleChange}
              placeholder='Farma zvířat'
              textarea={false}
            />
            <BookInput
              label='Autor díla:'
              divClassName='book-author'
              inputId='book-author'
              inputName='bookAuthor'
              value={bookInfo.bookAuthor}
              onChange={handleChange}
              placeholder='George Orwell'
              textarea={false}
            />
            <BookInput
              label='Rok vydání:'
              divClassName='book-year'
              inputId='book-year'
              inputName='bookYear'
              value={bookInfo.bookYear}
              onChange={handleChange}
              placeholder='1945'
              textarea={false}
            />
          </div>
          <div className="fiction-text-analysis">
            <h2>Analýza uměleckého textu</h2>
            <div className="part-1 part">
              <h3>I. část</h3>
              <BookInput
                label='Zasazení výňatku do kontextu díla:'
                divClassName='excerpt-context'
                inputId='excerpt-context'
                inputName='excerptContext'
                value={bookInfo.excerptContext}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Téma a motiv:'
                divClassName='theme-and-motive'
                inputId='theme-and-motive'
                inputName='themeAndMotive'
                value={bookInfo.themeAndMotive}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Časoprostor:'
                divClassName='spacetime'
                inputId='spacetime'
                inputName='spaceTime'
                value={bookInfo.spaceTime}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Kompoziční výstavba:'
                divClassName='composition'
                inputId='composition'
                inputName='composition'
                value={bookInfo.composition}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Literární druh a žánr:'
                divClassName='literary-type-and-genre'
                inputId='literary-type-and-genre'
                inputName='literaryTypeAndGenre'
                value={bookInfo.literaryTypeAndGenre}
                onChange={handleChange}
                placeholder='...'
              />
            </div>
            <div className="part-2 part">
              <h3>II. část</h3>
              <BookInput
                label='Vypravěč / lyrický subjekt:'
                divClassName='narrator-or-lyrical-subject'
                inputId='narrator-or-lyrical-subject'
                inputName='narratorOrLyricalSubject'
                value={bookInfo.narratorOrLyricalSubject}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Postava:'
                divClassName='character'
                inputId='character'
                inputName='character'
                value={bookInfo.character}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Vyprávěcí způsoby:'
                divClassName='narrative-ways'
                inputId='narrative-ways'
                inputName='narrativeWays'
                value={bookInfo.narrativeWays}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Typy promluv:'
                divClassName='types-of-speeches'
                inputId='types-of-speeches'
                inputName='typesOfSpeeches'
                value={bookInfo.typesOfSpeeches}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Veršová výstavba:'
                divClassName='verse-construction'
                inputId='verse-construction'
                inputName='verseConstruction'
                value={bookInfo.verseConstruction}
                onChange={handleChange}
                placeholder='...'
              />
            </div>
            <div className="part-3 part">
              <h3>III. část</h3>
              <BookInput
                label='Jazykové prostředky a jejich funkce ve výňatku:'
                divClassName='language-resources'
                inputId='language-resources'
                inputName='languageResources'
                value={bookInfo.languageResources}
                onChange={handleChange}
                placeholder='...'
              />
              <BookInput
                label='Tropy a figury a jejich funkce ve výňatku:'
                divClassName='tropes-and-figures'
                inputId='tropes-and-figures'
                inputName='tropesAndFigures'
                value={bookInfo.tropesAndFigures}
                onChange={handleChange}
                placeholder='...'
              />
            </div>
            <div className="part-4 part">
              <h3>IV. část</h3>
              <BookInput
                label='Charakteristika úryvku po stránce gramatické, morfologické, lexikální, sytaktické a stylistické:'
                divClassName='excerpt-characteristic'
                inputId='excerpt-characteristic'
                inputName='excerptCharacteristic'
                value={bookInfo.excerptCharacteristic}
                onChange={handleChange}
                placeholder='...'
              />
            </div>
          </div>
          <div className="literary-historical-context">
            <BookInput
              label='Kontext autorovy tvorby:'
              divClassName='context-of-authors-work'
              inputId='context-of-authors-work'
              inputName='contextOfAuthorsWork'
              value={bookInfo.contextOfAuthorsWork}
              onChange={handleChange}
              placeholder='...'
            />
            <BookInput
              label='Literární / obecně kulturní kontext:'
              divClassName='literary-and-culture-context'
              inputId='literary-and-culture-context'
              inputName='literaryAndCultureContext'
              value={bookInfo.literaryAndCultureContext}
              onChange={handleChange}
              placeholder='...'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default NewBookAnalysis;
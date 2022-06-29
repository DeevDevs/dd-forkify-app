import View from './View.js';
import icons from 'url:../../img/icons.svg';

//This file exists only to generate the preview of one of the recipes that will later be used in both the resultsView and the bookmarksView (здесь генерируется HTML с превью и закладками)
class PreviewView extends View {
  _parentElement = '';

  /**
   * generates the HTML code to preview the recipe (создает HTML контент для превью рецептов)
   * @param {none}
   * @returns {string} HTML code to render
   * @this {Object} previewView instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  _generateMarkup() {
    const id = window.location.hash.slice(1);
    return `
            <li class="preview" draggable="false">
                <a class="preview__link ${this._data.id === id ? `preview__link--active` : ''}" href="#${this._data.id}">
                <figure class="preview__fig">
                    <img src="${this._data.image}" alt="${this._data.title}" />
                </figure>
                <div class="preview__data">
                    <h4 class="preview__title">${this._data.title}</h4>
                    <p class="preview__publisher">${this._data.publisher}</p>
                    <div class="preview__user-generated ${this._data.key ? '' : 'hidden'}">
                      <svg>
                       <use href="${icons}#icon-user"></use>
                      </svg>
                    </div>   
                </div>
                </a>
            </li>
    `;
  }
}

export default new PreviewView();

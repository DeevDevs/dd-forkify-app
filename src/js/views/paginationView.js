import View from './View.js';
import icons from 'url:../../img/icons.svg';

// this class is an extension of the View class and is responsible for the buttons at the bottom of the search results block (это расширение класса View, которое отвечает за кнопки перелистывания результатов поиска, находящиеся внизу соответствующего блока)
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  /**
   * triggers the function that changes the page with search results (запускает перелистывание страниц с результатами поиска)
   * @param {function} function to trigger
   * @returns {undefined}
   * @this {Object} paginationView instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  /**
   * generates the buttons elements depending on the number of found recipes and the user manipulations (создает елементы кнопок в зависимости от страницы  количества найденных рецептов)
   * @param {none}
   * @returns {string} HTML code to render
   * @this {Object} paginationView instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
    //if - Page 1, and there are other pages (если первая страница и есть еще)
    if (curPage === 1 && numPages > 1) {
      return `${this._generateButtonMarkup(curPage + 1, true)}
        <br /><br /><br /><div class="pagination--total">
          <span>Total number of pages: ${numPages > 1 ? numPages : ''}</span>
        </div>
      `;
    }
    //if - Last page (если последняя страница)
    if (curPage === numPages && numPages > 1) {
      return `${this._generateButtonMarkup(curPage - 1, false)}
        <br /><br /><br /><div class="pagination--total">
          <span>Total number of pages: ${numPages > 1 ? numPages : ''}</span>
        </div>
      `;
    }
    //if - some other page (если любая другая страница)
    if (curPage < numPages) {
      return `
        ${this._generateButtonMarkup(curPage - 1, false)}
        ${this._generateButtonMarkup(curPage + 1, true)}
        <br /><br /><br /><div class="pagination--total">
          <span>Total number of pages: ${numPages > 1 ? numPages : ''}</span>
        </div>
      `;
    }
    //if - Page 1, and there are NO other pages (если есть только одна страница)
    return ``;
  }

  /**
   * generates the button element (создает DOM-элемент кнопки)
   * @param {number} page
   * @param {boolean} true - right and false - left
   * @returns {string} HTML code to render
   * @this {Object} paginationView instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  _generateButtonMarkup(num, direction) {
    return `
    <button data-goto="${num}" class="btn--inline pagination__btn--${direction ? 'next' : 'prev'}">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-${direction ? 'right' : 'left'}"></use>
      </svg>
      <span>Page ${num}</span>
    </button>`;
  }
}

export default new PaginationView();

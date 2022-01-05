import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  /**
   * triggers the function that changes the page with search results
   * @param {function} function to trigger
   * @returns {undefined}
   * @this {Object} paginationView instance
   * @author Jonas Shmedtmann
   */
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      //here we retrieve the data from the button HTML to know where to move... we also convert it to Number
      const goToPage = +btn.dataset.goto;
      //we let the function in the controller (handler) use this retrieved page number to render corresponding recipes from the search results array...
      handler(goToPage);
    });
  }

  /**
   * generates the buttons depending on the number of found recipes and the user manipulations
   * @param {none}
   * @returns {string} HTML code to render
   * @this {Object} paginationView instance
   * @author Jonas Shmedtmann
   */
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    //if - Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      //prettier-ignore
      return `${this._generateButtonMarkup(curPage + 1, true)}

        <br /><br /><br /><div class="pagination--total">
          <span>Total number of pages: ${numPages > 1 ? numPages : ''}</span>
        </div>
      `;
    }
    //if - Last page
    if (curPage === numPages && numPages > 1) {
      //prettier-ignore
      return `${this._generateButtonMarkup(curPage - 1, false)}
        
        <br /><br /><br /><div class="pagination--total">
          <span>Total number of pages: ${numPages > 1 ? numPages : ''}</span>
        </div>
      `;
    }
    //if - some other page
    if (curPage < numPages) {
      //prettier-ignore
      return `
        ${this._generateButtonMarkup(curPage - 1, false)}
        ${this._generateButtonMarkup(curPage + 1, true)}

        <br /><br /><br /><div class="pagination--total">
          <span>Total number of pages: ${numPages > 1 ? numPages : ''}</span>
        </div>
      `;
    }
    //if - Page 1, and there are NO other pages
    return ``;
  }

  /**
   * generates the button element
   * @param {number} page
   * @param {boolean} true - right and false - left
   * @returns {string} HTML code to render
   * @this {Object} paginationView instance
   * @author Dmitriy Vnuchkov
   */
  _generateButtonMarkup(num, direction) {
    return `
    <button data-goto="${num}" class="btn--inline pagination__btn--${
      direction ? 'next' : 'prev'
    }">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-${direction ? 'right' : 'left'}"></use>
      </svg>
      <span>Page ${num}</span>
    </button>`;
  }
}

export default new PaginationView();

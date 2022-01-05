import View from './View.js';
import PreviewView from './previewView.js';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = `No recipes found for your query! Please, try again.`;
  _successMessage = ``;

  //////////////////////////////// ADDONS /////////////////////////////////
  _buttonBox = document.querySelector('.buttons__box');
  _btnSortTime = document.querySelector('.btn--sort--time');
  _btnSortIngredients = document.querySelector('.btn--sort--ings');

  /**
   * previews of the recipes are generated in the PreviewView and are assembled here to get rendered
   * @param {none}
   * @returns {string} HTML code to render
   * @this {Object} resultsView instance
   * @author Jonas Shmedtmann
   */
  _generateMarkup() {
    return this._data.map(result => PreviewView.render(result, false)).join('');
  }

  //////////////////////////////// ADDONS /////////////////////////////////
  //it makes the sorting buttons visible once search results are displayed
  showSortingBtns() {
    this._btnSortIngredients.classList.remove('hidden');
    this._btnSortTime.classList.remove('hidden');
  }

  /**
   * See controller.js ... it initiates sorting either by cooking time, or by number of ingredients
   * @param {function} function that is triggered
   * @returns {undefined}
   * @this {Object} resultsView instance
   * @author Dmitriy Vnuchkov
   */
  addHandlerSorting(handler) {
    this._buttonBox.addEventListener('click', function (e) {
      e.preventDefault();
      if (e.target.closest('.btn--sort--time')) handler(true);
      if (e.target.closest('.btn--sort--ings')) handler(false);
    });
  }
}

export default new ResultsView();

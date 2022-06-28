import View from './View.js';
import PreviewView from './previewView.js';

// class is based on the View parent class. It is responsible for the search results container ('этот класс основан на View классе-родителе. Он отвечает за контейнер с результатами поиска)
class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = `No recipes found for your query! Please, try again.`;
  _successMessage = ``;
  _buttonBox = document.querySelector('.buttons__box');
  _btnSortTime = document.querySelector('.btn--sort--time');
  _btnSortIngredients = document.querySelector('.btn--sort--ings');

  /**
   * previews of the recipes are generated in the PreviewView and are assembled here to get rendered (превью каждого рецепта создается в previewView.js, и собирается здесь для рендеринга)
   * @param {none}
   * @returns {string} HTML code to render
   * @this {Object} resultsView instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  _generateMarkup() {
    return this._data.map(result => PreviewView.render(result, false)).join('');
  }

  /**
   * it makes sorting buttons visible once the results are available (отображает кнопки для сортировки вместе с результатами поиска)
   * @param {Array}
   * @returns {string} HTML code to render
   * @this {Object} resultsView instance
   * @author Dmitriy Vnuchkov
   */
  showSortingBtns(arrayOfResults) {
    if (arrayOfResults.length === 0 && !this._btnSortIngredients.classList.contains('hidden')) {
      this._btnSortIngredients.classList.add('hidden');
      this._btnSortTime.classList.add('hidden');
    } else if (arrayOfResults.length === 0 && this._btnSortIngredients.classList.contains('hidden')) {
      {
        return;
      }
    } else if (arrayOfResults.length > 0) {
      this._btnSortIngredients.classList.remove('hidden');
      this._btnSortTime.classList.remove('hidden');
    }
  }

  /**
   * initiates sorting either by cooking time, or by number of ingredients (запускает сортировку либо по времени приготовления, либо по количеству ингредиентов)
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

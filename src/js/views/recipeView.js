import View from './View.js';
import icons from 'url:../../img/icons.svg';
import fracty from 'fracty';

// this is an extension of the View class. It is responsible for the main window with the recipe details (Это расширение класса View, ответственное за отображение контента в основном окне с деталями рецептов)
class RecipeView extends View {
  _parentElement = document.querySelector('.recipe');
  _errorMessage = `We could not find the recipe. Please, try to find another one!`;
  _successMessage = ``;
  _ghostElement;
  _btnCalendar = document.querySelector('.btn-add-to-calendar');

  constructor() {
    super();
    //add listeners to the main recipe window to allow dragged elements and make it draggable (добавляет приемники событий к основному рецепту чтобы активировать перетаскивание)
    this.addHandlerDraggable();
    this.addHandlerDragEnd();
    this.addHandlerDraggedOver();
  }

  // it triggers rendering in the main recipe window (запускает смену рецепта в основном окне)
  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  /**
   * triggers the change in the number of servings (запускает процесс смены количества порций)
   * @param {function} function that updates the number of servings
   * @returns {undefined}
   * @this {Object} recipeView instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      const { updateTo } = btn.dataset;
      if (+updateTo > 0) handler(+updateTo);
    });
  }

  /**
   * triggers adding/removing bookmars (запускает процесс добавления/удаления закладки)
   * @param {function} function that updates the number of servings
   * @returns {undefined}
   * @this {Object} recipeView instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;
      handler();
    });
  }

  //
  /**
   * generates DOM-elements that represent content of the main recipe window (создает DOM-элементы которые отображают контент главного блока с рецептом)
   * @param {none}
   * @returns {string} HTML code to render
   * @this {Object} recipeView instance
   * @author Jonas Shmedtmann
   */
  _generateMarkup() {
    return `
        <figure class="recipe__fig">
            <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
            <h1 class="recipe__title">
              <span>${this._data.title}</span>
            </h1>
          </figure>
          <div class="recipe__details">
            <div class="recipe__info">
              <svg class="recipe__info-icon">
                <use href="${icons}#icon-clock"></use>
              </svg>
              <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
              <span class="recipe__info-text">minutes</span>
            </div>
            <div class="recipe__info">
              <svg class="recipe__info-icon">
                <use href="${icons}#icon-users"></use>
              </svg>
              <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
              <span class="recipe__info-text">servings</span>
              <div class="recipe__info-buttons">
                <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings - 1}">
                  <svg>
                    <use href="${icons}#icon-minus-circle"></use>
                  </svg>
                </button>
                <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings + 1}">
                  <svg>
                    <use href="${icons}#icon-plus-circle"></use>
                  </svg>
                </button>
              </div>
            </div>
            <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
               <svg>
                 <use href="${icons}#icon-user"></use>
               </svg>
            </div>      
            <button class="btn--round btn--bookmark">
              <svg class="">
                <use href="${icons}#icon-bookmark${this._data.bookmarked ? '-fill' : ''}"></use>
              </svg>
            </button>
          </div>
          <div class="recipe__ingredients">
            <h2 class="heading--2">Recipe ingredients</h2>
            <ul class="recipe__ingredient-list">
      ${this._data.ingredients.map(this._generateMarkupIngredient).join(' ')}
            </ul>
          </div>
          <div class="recipe__directions">
            <h2 class="heading--2">How to cook it</h2>
            <p class="recipe__directions-text">
              This recipe was carefully designed and tested by
              <span class="recipe__publisher">${this._data.publisher}</span>. Please check out
              directions at their website.
            </p>
            <a
              class="btn--small recipe__btn"
              href="${this._data.sourceURL}"
              target="_blank"
            >
              <span>Directions</span>
              <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
              </svg>
            </a>
          </div>`;
  }

  /**
   * generates HTML code for an ingredient from the recipes (создает HTML для каждого ингредиента)
   * @param {object} object an ingredient object from the array of ingredients in the recipe
   * @returns {string} HTML code to render
   * @this {Object} recipeView instance
   * @author Jonas Shmedtmann
   */
  _generateMarkupIngredient(ing) {
    return `
                <li class="recipe__ingredient">
                  <svg class="recipe__icon">
                    <use href="${icons}#icon-check"></use>
                  </svg>
                  <div class="recipe__quantity">${ing.quantity ? fracty(ing.quantity.toFixed(1)) : ''}</div> 
                  <div class="recipe__description">
                    <span class="recipe__unit">${ing.unit}</span>
                    ${ing.description}
                  </div>
                </li>
              `;
  }

  /**
   * adds listener to the main recipe window to let it be dragged to the weekly plan (добавляет приемник событий в главное окно с рецептом, чтобы рецепт можно было перетаскивать в еэенеднльное меню)
   * @param {none}
   * @returns {undefined}
   * @this {Object} recipeView instance
   * @author Dmitriy Vnuchkov
   */
  addHandlerDraggable() {
    this._parentElement.addEventListener(
      'dragstart',
      function (e) {
        if (!this._parentElement.innerHTML.trim().startsWith('<fig')) return;
        e.dataTransfer.setData('text/plain', JSON.stringify(this._data));
        this._ghostElement = document.createElement('div');
        //generates the element that is dragged instead of the main window ghost (создает элемент-призрак, который перетаскивается вместе с данными)
        this._ghostElement.innerHTML = `<span class="ghost">
                <figure class="ghost__fig">
                    <img src="${this._data.image}" alt="${this._data.title}" />
                </figure>
                <div class="ghost__data">
                    <h4 class="ghost__title">${this._data.title}</h4> 
                </div>
                </a>
            </span>`;
        document.body.appendChild(this._ghostElement.firstChild);
        const ghost = document.querySelector('.ghost');
        e.dataTransfer.setDragImage(ghost, 0, 0);
      }.bind(this)
    );
  }

  /**
   * removes the ghost element once drag is over (убирает элемент-призрак по окончании перетаскивания)
   * @param {none}
   * @returns {undefined}
   * @this {Object} recipeView instance
   * @author Dmitriy Vnuchkov
   */
  addHandlerDragEnd() {
    this._parentElement.addEventListener('dragend', function () {
      let ghost;
      if (document.querySelector('.ghost')) {
        ghost = document.querySelector('.ghost');
        document.body.removeChild(ghost);
      }
    });
  }

  /**
   * trigger data acceptance to update the weekly plan (запускает принятие и анализ данных для рендеринга еженедельного плана)
   * @param {none}
   * @returns {undefined}
   * @this {Object} recipeView instance
   * @author Dmitriy Vnuchkov
   */
  addHandlerDropTo(handler) {
    this._parentElement.addEventListener('drop', function (e) {
      e.preventDefault();
      handler(e.dataTransfer.getData('text/plain'));
    });
  }

  //allows the element to be dragged over for the recipes from the weekly plan (позволяет окну быть полем для перетаскивания, чтобы рендерить рецепты из еженедельного плана)
  addHandlerDraggedOver() {
    this._parentElement.addEventListener('dragover', function (e) {
      e.preventDefault();
    });
  }
}

export default new RecipeView();

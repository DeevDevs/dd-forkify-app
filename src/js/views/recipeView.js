import View from './View.js';
import icons from 'url:../../img/icons.svg';
import fracty from 'fracty';

class RecipeView extends View {
  _parentElement = document.querySelector('.recipe');
  //here we create a message that will be shown as error by default
  _errorMessage = `We could not find the recipe. Please, try to find another one!`;
  //and here is a message that we use for success (or for showing the default suggestion to go and search for the recipe)
  _successMessage = ``;

  //////////////////////////////// MY ADDONS /////////////////////////////////
  _ghostElement;
  _btnCalendar = document.querySelector('.btn-add-to-calendar');

  constructor() {
    super();
    //add listeners to the main recipe window to allow dragged elements and make it draggable
    this.addHandlerDraggable();
    this.addHandlerDragEnd();
    this.addHandlerDraggedOver(); //TESTING
  }
  ///////////////////////////////////////

  //see Controller.js ... it triggers rendering in the main recipe window
  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  /**
   * Render the received object to the DOM
   * @param {function} function that updates the number of servings
   * @returns {undefined}
   * @this {Object} recipeView instance
   * @author Jonas Shmedtmann
   */
  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      const { updateTo } = btn.dataset;
      //it retrieves the number of servings from the button data and sends it to the controller
      if (+updateTo > 0) handler(+updateTo);
    });
  }

  //See Controller.js ... this function triggers the adding/removing Bookmark function
  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;
      handler();
    });
  }

  //inside, we map over the array of ingredients to create a list of ingredients using html code. So, the function there will return a string of html code for those ingredients.
  /**
   * generates the recipe DOM element that is later rendered in the main window
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
   * generates HTML code for an ingredient from the recipes (used in _generateMarkup)
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

  //////////////////////////////// MY ADDONS /////////////////////////////////

  /**
   * adds listener to the main recipe window to let it be dragged to the weekly plan
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
        //generates the element that is dragged instead of the main window ghost
        this._ghostElement.innerHTML = `<span class="ghost">
                <figure class="ghost__fig">
                    <img src="${this._data.image}" alt="${this._data.title}" />
                </figure>
                <div class="ghost__data">
                    <h4 class="ghost__title">${this._data.title}</h4> 
                </div>
                </a>
            </span>`;
        //and appends it
        document.body.appendChild(this._ghostElement.firstChild);
        const ghost = document.querySelector('.ghost');
        e.dataTransfer.setDragImage(ghost, 0, 0);
      }.bind(this)
    );
  }

  //removes the ghost once the drag is over
  addHandlerDragEnd() {
    this._parentElement.addEventListener('dragend', function () {
      let ghost;
      if (document.querySelector('.ghost')) {
        ghost = document.querySelector('.ghost');
        document.body.removeChild(ghost);
      }
    });
  }

  //See controller.js triggers the function that can render the weekly plan
  addHandlerDropTo(handler) {
    this._parentElement.addEventListener('drop', function (e) {
      e.preventDefault();
      handler(e.dataTransfer.getData('text/plain'));
    });
  }

  //allows the element to be dragged over (for the recipes from the weekly plan to be rendered in the main window)
  addHandlerDraggedOver() {
    this._parentElement.addEventListener('dragover', function (e) {
      e.preventDefault();
    });
  }
}

export default new RecipeView();

import View from './View.js';
import {
  minNumberOfIngredients,
  maxNumberOfIngredients,
  defaultNumberOfIngredients,
  MODAL_REFRESH_SEC,
} from '../config.js';
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.add-recipe-window');
  _successMessage = `Recipe was successfully uploaded!`;

  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');

  ///////////////////////////// MY ADDONS ///////////////////////////
  _numOfIngredients = defaultNumberOfIngredients;

  // ** WITH MY ADDONS
  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
    this._addHandlerMoreIngredients();
    this._addHandlerLessIngredients();
  }

  //hides/shows the uploadRecipe form
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._btnOpen.blur();
    this._parentElement.classList.toggle('hidden');
  }

  //adds listener to a button
  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  //adds listeners to the doc.body and form ** WITH MY ADDONS
  _addHandlerHideWindow() {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        if (e.target.closest('.btn--close-modal')) this.toggleWindow();
      }.bind(this)
    );

    document.body.addEventListener(
      'keydown',
      function (e) {
        if (
          e.key === 'Escape' &&
          !this._parentElement.classList.contains('hidden')
        )
          this.toggleWindow();
      }.bind(this)
    );

    this._overlay.addEventListener(
      'click',
      function () {
        if (!this._parentElement.classList.contains('hidden'))
          this.toggleWindow();
      }.bind(this)
    );
  }

  /** WITH MY ADDONS
   * adds handler to the button in UI to add extra HTML code that is an extra row in the ingredients column
   * @param {function} function that processes the recipe upload
   * @returns {undefined}
   * @this {Object} AddRecipeView instanse
   * @author Dmitriy Vnuchkov and Jonas Shmedtmann
   */
  addHandlerUpload(handler) {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        if (e.target.closest('.upload__btn')) {
          const dataArr = new FormData(document.querySelector('.upload'));
          const data = Object.fromEntries(dataArr);
          handler(data);
          this._numOfIngredients = defaultNumberOfIngredients;
        }
      }.bind(this)
    );
  }

  ///////////////////////////////////////
  //////////////////// ADDONS: ADDING EXTRA INGREDIENTS ///////////////////

  /**
   * adds handler to the button in UI to add extra HTML code that is an extra row in the ingredients column
   * @param {none}
   * @returns {undefined}
   * @this {Object} AddRecipeView instanse
   * @author Dmitriy Vnuchkov
   */
  _addHandlerMoreIngredients() {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        if (this._numOfIngredients === maxNumberOfIngredients) return;
        if (e.target.closest('.btn--add--ing')) {
          this._numOfIngredients++;
          document
            .querySelector('.ingredients__column')
            .insertAdjacentHTML('beforeend', this._newIngredientMarkup());
        }
        document
          .getElementById(`label-${this._numOfIngredients}`)
          .scrollIntoView();
      }.bind(this)
    );
  }

  /**
   * adds handler to the button in UI to remove one row in the ingredients column
   * @param {none}
   * @returns {undefined}
   * @this {Object} AddRecipeView instanse
   * @author Dmitriy Vnuchkov
   */
  _addHandlerLessIngredients() {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        if (this._numOfIngredients === minNumberOfIngredients) return;
        if (e.target.closest('.btn--remove--ing')) {
          document.getElementById(`label-${this._numOfIngredients}`).remove();
          document.getElementById(`div-${this._numOfIngredients}`).remove();
          this._numOfIngredients--;
        }
      }.bind(this)
    );
  }

  /**
   * generates an element that is later an extra row in the ingredient column
   * @param {none}
   * @returns {string} HTML code with a row of input fields for a new ingredient
   * @this {Object} AddRecipeView instanse
   * @author Dmitriy Vnuchkov
   */
  _newIngredientMarkup() {
    return `
          <label class="extra__ing"  id="label-${this._numOfIngredients}">Ingredient ${this._numOfIngredients}</label>
          <div class="upload__row__ingredients extra__ing" id="div-${this._numOfIngredients}">
            <span><input value="" type="text" required name="ingredient-q-${this._numOfIngredients}" placeholder="Quantity" size="4"/></span>
            <span><input value="" type="text" required name="ingredient-u-${this._numOfIngredients}" placeholder="Unit" size="2"/></span>
            <span><input value="" type="text" required name="ingredient-d-${this._numOfIngredients}" placeholder="Description" size="6"/></span>
          </div>`;
  }

  ///////////////////////////////////////
  //////////////////// MY ADDONS: FIXING ERROR ///////////////////
  // Only single attempt to upload a new recipe was possible before

  /**
   * hides and returns the elements in the form after the new recipe started to upload
   * @param {none}
   * @returns {undefined}
   * @this {Object} AddRecipeView instanse
   * @author Dmitriy Vnuchkov
   */
  returnUploadForm() {
    setTimeout(
      function () {
        this.defaultWindowContent();
      }.bind(this),
      MODAL_REFRESH_SEC * 1000
    );
  }

  /**
   * generates a new form and adds it to UI
   * @param {none}
   * @returns {undefined}
   * @this {Object} AddRecipeView instanse
   * @author Dmitriy Vnuchkov
   */
  defaultWindowContent() {
    const formHTML = `
      <button class="btn--close-modal">&times;</button>
      <form class="upload" id="form1">
        <div class="upload__column">
          <h3 class="upload__heading">Recipe data</h3>
          <label>Title</label>
          <input value="" required name="title" type="text" />
          <label>URL</label>
          <input value="" required name="sourceUrl" type="text" />
          <label>Image URL</label>
          <input value="" required name="image" type="text" />
          <label>Publisher</label>
          <input value="" required name="publisher" type="text" />
          <label>Prep time</label>
          <input value="" required name="cookingTime" type="number" />
          <label>Servings</label>
          <input value="" required name="servings" type="number" />
        </div>
        <div class="upload__column ingredients__column">
          <h3 class="upload__heading ingredients__name">Ingredients</h3>
          <label id="label-1">Ingredient 1</label>
          <div class="upload__row__ingredients" id="div-1">
            <span><input value="" type="text" required name="ingredient-q-1" placeholder="Quantity" size="4"/></span>
            <span><input value="" type="text" required name="ingredient-u-1" placeholder="Unit" size="2"/></span>
            <span><input value="" type="text" required name="ingredient-d-1" placeholder="Description" size="6"/></span>
          </div>
          <label id="label-2">Ingredient 2</label>
          <div class="upload__row__ingredients" id="div-2">
            <span><input value="" type="text" required name="ingredient-q-2" placeholder="Quantity" size="4"/></span>
            <span><input value="" type="text" required name="ingredient-u-2" placeholder="Unit" size="2"/></span>
            <span><input value="" type="text" required name="ingredient-d-2" placeholder="Description" size="6"/></span>
          </div>
          <label id="label-3">Ingredient 3</label>
          <div class="upload__row__ingredients" id="div-3">
            <span><input value="" type="text" required name="ingredient-q-3" placeholder="Quantity" size="4"/></span>
            <span><input value="" type="text" required name="ingredient-u-3" placeholder="Unit" size="2"/></span>
            <span><input value="" type="text" required name="ingredient-d-3" placeholder="Description" size="6"/></span>
          </div>
          <label id="label-4">Ingredient 4</label>
          <div class="upload__row__ingredients" id="div-4">
            <span><input value="" type="text" required name="ingredient-q-4" placeholder="Quantity" size="4"/></span>
            <span><input value="" type="text" required name="ingredient-u-4" placeholder="Unit" size="2"/></span>
            <span><input value="" type="text" required name="ingredient-d-4" placeholder="Description" size="6"/></span>
          </div>
          <label id="label-5">Ingredient 5</label>
          <div class="upload__row__ingredients" id="div-5">
            <span><input value="" type="text" required name="ingredient-q-5" placeholder="Quantity" size="4"/></span>
            <span><input value="" type="text" required name="ingredient-u-5" placeholder="Unit" size="2"/></span>
            <span><input value="" type="text" required name="ingredient-d-5" placeholder="Description" size="6"/></span>
          </div>
          <label id="label-6">Ingredient 6</label>
          <div class="upload__row__ingredients" id="div-6">
            <span><input value="" type="text" required name="ingredient-q-6" placeholder="Quantity" size="4"/></span>
            <span><input value="" type="text" required name="ingredient-u-6" placeholder="Unit" size="2"/></span>
            <span><input value="" type="text" required name="ingredient-d-6" placeholder="Description" size="6"/></span>
          </div>
        </div>
        <button type="submit" class="btn upload__btn" form="form1">
          <svg>
            <use href="${icons}#icon-upload-cloud"></use>
          </svg>
          <span>Upload</span>
        </button>
      </form>
      <div class="upload__buttons">
        <button class="btn btn__extra btn--add--ing">Add Ingredient</button>
        <button class="btn btn__extra btn--remove--ing">Remove Ingredient</button>
      </div>`;
    this._parentElement.innerHTML = formHTML;
  }

  ///////////////////////////////
}

export default new AddRecipeView();
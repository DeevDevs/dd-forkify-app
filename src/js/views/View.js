//here we create the View class which is used as a parent for other views. Functions inside the View class are unified to the same variables (which are unique for each child class)
import 'regenerator-runtime/runtime'; // it is for polyfilling async await
import 'core-js/stable'; // it is for polyfilling everything else
import icons from 'url:../../img/icons.svg';
import { async } from 'regenerator-runtime';

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, creates markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup is returned if render is false
   * @this {Object} View instance
   * @author Jonas Shmedtmann
   */
  render(data, render = true) {
    //guard clause here
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.renderError();
    }
    //store the data
    this._data = data;
    //we store new html code that comes from the generateMarkup (which in turn is based on the #data)
    const markup = this._generateMarkup();
    //markup is returned, if we do not want to render it
    if (!render) return markup;
    //empty the container first
    this._clear();
    //and now we add html code to the container
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * update servings details (when number of servings is changed)... also, we use it in resultsView to make selected recipe remain highlighted...the idea is that this time we do not update the entire list, but rather just update those that were changed after user's manipulation
   * @param {Object | Object[]} data The data to be updated (e.g. recipe)
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann
   */
  update(data) {
    //store the data
    this._data = data;
    //create new markup based on the old one
    const newMarkup = this._generateMarkup();
    //use a method that will form a DOM element
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    //address the elements there, and they will not be parts of a string, but rather individual DOM elements... with this star we select all the elements that exist in the chosen parent element
    const newElements = Array.from(newDOM.querySelectorAll('*')); // originally, it is a nodeList, so we have to convert it into an array
    const curElements = Array.from(this._parentElement.querySelectorAll('*')); // originally, it is a nodeList, so we have to convert it into an array
    //and now we can start the actual comparison...
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      //compare elements with each other and check if the content in the nodes is the same... OVERALL, we only update changed textContent here
      //prettier-ignore
      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
        curEl.textContent = newEl.textContent; //So, we change the text, BUT we do not change the attributes yet
      }
      //and here we update changed attributes... we do it to update dataset in html elements, etc...
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  /**
   * clear the element where data will be rendered
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann
   */
  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * create and add the spinner element to spin while data is loading
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann
   */
  renderSpinner() {
    const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
  `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * rendering error messages
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann
   */
  renderError(message = this._errorMessage) {
    const markup = `
        <div class="error">
          <div>
             <svg>
              <use href="${icons}#icon-alert-triangle"></use>
             </svg>
          </div>
          <p>${message}</p>
       </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * rendering success messages
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann
   */
  renderMessage(message = this._successMessage) {
    const markup = `
        <div class="message">
          <div>
             <svg>
              <use href="${icons}#icon-smile"></use>
             </svg>
          </div>
          <p>${message}</p>
       </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}

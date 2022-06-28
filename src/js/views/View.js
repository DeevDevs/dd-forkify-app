import 'regenerator-runtime/runtime';
import 'core-js/stable';
import icons from 'url:../../img/icons.svg';
import { async } from 'regenerator-runtime';

//here we create the View class which is used as a parent for other views. Functions inside the View class are unified to the same variables (which end up being unique for each child class). Тут мы создаем View класс, который является родителем других view классов. Функции внутри этого класса будут доступны и другим классам, и будут работать с уникальными для классов-детей значениями.
export default class View {
  _data;

  /**
   * Render the received object to the DOM (рендерит полученные данные)
   * @param {Object | Array} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, creates markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup is returned if render is false
   * @this {Object} View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.renderError();
    }
    //store the data (сохраняем данные)
    this._data = data;
    //we store new html code that comes from the generateMarkup (which in turn is based on the #data) (сохраняем HTML элементы созданные на базе сохраненных данных)
    const markup = this._generateMarkup();
    //markup is returned, if we do not want to render it (возвращаем HTMl-элементы, если не хотим рендерить их)
    if (!render) return markup;
    //empty the container first (опустошаем выбранный контейнер)
    this._clear();
    //and now we add html code to the container (добавляем созданный html в очищенный контейнер)
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * update HTML content instead of deleting/rendering it again (обновляет HTML контент вместо того, чтобы перезаписывать его полностью)
   * @param {Object | Array} data The data to be updated (e.g. recipe)
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  update(data) {
    //store the data (сохраняет данные)
    this._data = data;
    //create new markup based on the old one (создает HTML на базе новых данных)
    const newMarkup = this._generateMarkup();
    //use a method that will form a DOM element (воссоздает DOM-элемент в воображаемом контексте)
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    //turn all elements in the new DOM into a nodelist that is then turned into an array (превращает воссозданные DOM элементы в нодлист, который затем трансформирует в массив)
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    // turn all elements in the already existing and rendered DOM content into the nodelist,and then array (превращает уже отображаемый DOM контент в нодлист, и затем в массив)
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));
    //and now we can start the actual comparison (и начинает сравнение)
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      //compare elements with each other and check if the content in the nodes is the same. Overall, we only update changed textContent here (сравнивает старые элементы с новыми и обновляет только тот контент, который пережил изменения)
      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
        curEl.textContent = newEl.textContent; // here we change the text (тут мы обновляет текстовый контент)
      }
      //and here we update changed attributes (тут мы обновляем атрибуты)
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
      }
    });
  }

  /**
   * clear the element where data will be rendered (опустошаем элемент, в котором будем рендерить новый контент)
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * create and add the spinner element to spin while data is loading (рендерит спиннер загрузки)
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
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
   * rendering error messages (рендерит сообщения об ошибке)
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
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
   * rendering success messages (рендерит сообщения об успешном проведении операции)
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
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

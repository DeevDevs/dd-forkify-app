import View from './View.js';

//////////////////////////// MY ADDONS ///////////////////////////////
class ExtraView extends View {
  _parentElement = document.querySelector('.modal__window');
  _btnOpen = document.querySelector('.nav__btn--open-functions');
  _btnClose = document.querySelector('.btn--close-modal__window');
  // Shopping List btn
  _btnAddToList = document.querySelector('.btn--shop--list');
  // Calories API btn
  _btnUseApi = document.querySelector('.btn--api--use');
  _totalCalories = document.querySelector('.calories__api');
  _shoppingList = document.querySelector('.shopping__list');

  constructor() {
    super();
    this._addHandlerWindow();
    this._makeWindowDraggable(this._parentElement);
  }

  //displays and hides the weekly plan window
  _toggleWindow() {
    this._parentElement.classList.toggle('hidden');
    this._btnOpen.blur();
  }

  //activates the buttons and commands that open/hide the weekly plan window
  _addHandlerWindow() {
    this._btnOpen.addEventListener('click', this._toggleWindow.bind(this));
    this._btnClose.addEventListener('click', this._toggleWindow.bind(this));

    document.body.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape' && !this._parentElement.classList.contains('hidden')) this._toggleWindow();
      }.bind(this)
    );
  }

  ///////////////////// CALORIES API FUNCTIONS ///////////////////
  //See controller.js ... the handler initiates the request to count calories per serving
  addHandlerApi(handler) {
    this._btnUseApi.addEventListener(
      'click',
      function () {
        handler();
      }.bind(this)
    );
  }

  //displays the number of calories
  postCalories(value) {
    this._totalCalories.textContent = `Approximate number of calories per serving is ${value}`;
  }

  ///////////////////// SHOPPING LIST FUNCTIONS ///////////////////
  //See controller.js ... the handler initiates the generation of the shopping list
  addHandlerShoppingList(handler) {
    this._btnAddToList.addEventListener('click', handler);
  }

  renderShoppingList(data) {
    console.log(data);
    const fullList = data.map(item => `<span>${item}</span><br />`);
    this._shoppingList.innerHTML = `<div>${fullList.join('')}</div>`;
  }

  ///////////////////// DRAGGABLE WINDOW ///////////////////

  /**
   * allows user to drag the weekly plan window
   * @param {DOM element} element to drag
   * @returns {undefined}
   * @author Dmitriy Vnuchkov // used https://www.w3schools.com/howto/howto_js_draggable.asp
   */
  _makeWindowDraggable(modalWindow) {
    // prettier-ignore
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    document.querySelector('.draggingbar').onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      const maxWidth = document.querySelector('.body').offsetWidth;
      const maxHeight = document.querySelector('.body').offsetHeight;
      // set the element's new position
      modalWindow.style.top = modalWindow.offsetTop - pos2 + 'px';
      modalWindow.style.left = modalWindow.offsetLeft - pos1 + 'px';
      if (modalWindow.offsetTop - pos2 < 0) modalWindow.style.top = 0 + 'px';
      if (modalWindow.offsetLeft - pos1 < 0) modalWindow.style.left = 0 + 'px';
      if (modalWindow.offsetLeft - pos1 > maxWidth - modalWindow.offsetWidth / 2)
        modalWindow.style.left = maxWidth - modalWindow.offsetWidth / 2 + 'px';
      //prettier-ignore
      if (modalWindow.offsetTop - pos2 >maxHeight - modalWindow.offsetHeight / 2)
        modalWindow.style.top = maxHeight - modalWindow.offsetHeight / 2 + 'px';
    }

    function closeDragElement() {
      // stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}

export default new ExtraView();

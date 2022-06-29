//CHALLENGE - create a generateMarkupButton and generate buttons because they are repeating themselves... LATER
import View from './View.js';

//this class is an extension of the View class. Because the window does not need to have any HTML generated, this module is a little different from the rest. (Это расширение класса View. Из-за отсутствия неободимости создавать HTML, он немного отличается от остальных модулей)
class GetIdView extends View {
  _parentElement = document.querySelector('.key__window');
  _navPanel = document.querySelector('.nav');
  _btnClose = document.querySelector('.btn--close-key__window');
  _keyField = document.querySelector('.new__key__field');
  _notification = document.querySelector('.key__child__notes');
  _overlay = document.querySelector('.overlay');
  _confirmWindow = document.querySelector('.confirm__window');
  _confirmMessage = document.querySelector('.confirm-message');
  _btnYes = document.querySelector('.btn-confirm');
  _btnCancel = document.querySelector('.btn-cancel');
  _btnDeleteKey = document.querySelector('.btn-delete-key');

  constructor() {
    super();
    this.addHandlerToggleWindow();
    this._addListenerCancelDeleting();
    this.addHandlerDeleteKey();
  }

  /**
   * checks if the key is available on pageload (проверяет, доступен ли ключ при загрузке страницы)
   * @param {string} key from the storage
   * @returns {undefined}
   * @author Dmitriy Vnuchkov
   */
  _addHandlerCheckKeyAtStart(key) {
    window.addEventListener(
      'load',
      function () {
        this.displayKeyNotification(key);
        if (key === '') {
          document.querySelector('.nav__btn--get-Key').style.backgroundColor = '#e65e5e';
          this._btnDeleteKey.classList.add('hidden');
        }
      }.bind(this)
    );
  }

  // displays/hides the modal window (открывает/закрывает окно)
  _toggleWindow() {
    this._parentElement.classList.toggle('hidden');
    this._overlay.classList.toggle('hidden');
  }

  // adds display/hide listeners to the modal window (добавляет приемники событий для открытия/закрытия окна)
  addHandlerToggleWindow() {
    this._navPanel.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.nav__btn--get-Key')) this._toggleWindow();
      }.bind(this)
    );
    this._btnClose.addEventListener('click', this._toggleWindow.bind(this));
    document.body.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape' && !this._parentElement.classList.contains('hidden')) this._toggleWindow();
      }.bind(this)
    );
    this._overlay.addEventListener(
      'click',
      function () {
        if (!this._parentElement.classList.contains('hidden')) this._toggleWindow();
      }.bind(this)
    );
  }

  /**
   * checks if the key is available in the Key field (проверяет наличие ключа в поле ввода)
   * @param {function} function that triggers the change of the Key
   * @returns {undefined}
   * @author Dmitriy Vnuchkov
   */
  addHandlerAddNewKey(handler) {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.btn-save-key')) {
          const newKey = this._keyField.value;
          if (handler(newKey)) {
            this._keyField.value = '';
            document.querySelector('.nav__btn--get-Key').style.backgroundColor = '#f9f5f3';
            this._btnDeleteKey.classList.remove('hidden');
            this._toggleWindow();
          }
        }
      }.bind(this)
    );
  }

  /**
   * generates a message in the window depending on the presence/absence of the key (генерирует сообщение в зависимости от наличия/отсутствия ключа)
   * @param {string} key
   * @returns {undefined}
   * @author Dmitriy Vnuchkov
   */
  displayKeyNotification(key) {
    this._notification.innerHTML = `
      Without the Key you cannot add or save recipes. Remember, if you are
      going to change the key you used before, all your previous Bookmarks
      will disappear. <br />
      Also, you will not have access to those recipes you have uploaded so
      far. To be on a safe side, save your previous Key somewhere, before
      generating a new one. You can use it to access the recipes you have
      uploaded. ${
        key.length > 0 ? `Your currently used Key is: <span class="current__key">${key}</span>` : `Currently, no Key is being used.`
      }`;
  }

  /**
   * generates a message in a new window to confirm key deleting (открывает диалоговое окно чтобы подтвердить удаление)
   * @param {string} key
   * @returns {undefined}
   * @author Dmitriy Vnuchkov
   */
  addHandlerDeleteKey() {
    this._btnDeleteKey.addEventListener(
      'click',
      function () {
        this._confirmMessage.textContent = `Are you sure you want to delete your old Key? All your Bookmarks will be deleted and you will not be able to add/save new recipes unless you add the Key.`;
        this._confirmWindow.classList.toggle('hidden');
        this._parentElement.classList.toggle('hidden');
      }.bind(this)
    );
  }

  // cancels key deleting (отменяет удаление ключа)
  _addListenerCancelDeleting() {
    this._btnCancel.addEventListener(
      'click',
      function () {
        this._confirmWindow.classList.toggle('hidden');
        this._parentElement.classList.toggle('hidden');
      }.bind(this)
    );
  }

  // confirms key deleting (подтверждает удаление ключа)
  addListenerConfirmDeleting(handler) {
    this._btnYes.addEventListener(
      'click',
      function () {
        console.log('Deleting old Key');
        handler();
        this._overlay.classList.toggle('hidden');
        this._confirmWindow.classList.toggle('hidden');
        document.querySelector('.nav__btn--get-Key').style.backgroundColor = '#e65e5e';
        this._btnDeleteKey.classList.add('hidden');
      }.bind(this)
    );
  }
}

export default new GetIdView();

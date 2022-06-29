import View from './View.js';

// this is an extension of the View class, and it is responsible for displaying messages and the loading spinner in the notifications window. (Это расширения класса View, которое отвечает за отображение сообщений или спиннера загрузки в окне оповещений)
class DialogueWindowView extends View {
  _parentElement = document.querySelector('.dialogue__window');
  _successMessage = 'Shopping list has been successfully created';
  _timer1;
  _timer2;

  // display the notifications window (отображает окно оповещений)
  displayDialogueWindow() {
    this._parentElement.classList.remove('hidden');
    this._parentElement.style.opacity = 1;
  }

  /**
   * makes the dialogue window get dimmer and then disappear (заставляет окно оповещений медленно исчезать)
   * @param {none}
   * @returns {undefined}
   * @this {Object} dialogueWindowView instance
   * @author Dmitriy Vnuchkov
   */
  setDefaultDialogueWindow() {
    if (this._timer1 || this._timer2) {
      clearTimeout(this._timer1);
      clearTimeout(this._timer2);
    }

    this._timer1 = setTimeout(
      function () {
        this._parentElement.style.opacity = 0;
        this._timer2 = setTimeout(
          function () {
            this._parentElement.classList.add('hidden');
            this._parentElement.textContent = '';
          }.bind(this),
          2500
        );
      }.bind(this),
      2000
    );
  }
  ///////////////////////////////
}

export default new DialogueWindowView();

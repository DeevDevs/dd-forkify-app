import View from './View.js';

// this is an extension of the View class that is responsible for the weekly plan functionality. (Это расширение класса View, которое отвечает за функциональность еженедельного меню)
class CalendarView extends View {
  _parentElement = document.querySelector('.calendar');
  _errorMessage = `We could not find the recipe ! Please, open the recipe that you want to add.`;
  _floatingButtons = document.querySelector('.floating__buttons');
  _calendarDays = document.querySelectorAll('.calendar__day');
  _btnCalendar = document.querySelector('.btn-add-to-calendar');
  _btnEmptyDay = document.querySelector('.btn--empty--day');
  _btnEmptyCalendar = document.querySelector('.btn--empty--calendar');
  _ghostElement;
  _curRecipe;
  _activeRecipe = false;
  _draggedOverDay = false;
  _lastDraggedOverDayInnerHTML;
  _switch = true;

  constructor() {
    super();
    this.addHandlerActivateRecipe();
    this.addHandlerDraggedTo();
    this.addHandlerDraggableCalendarDays();
  }
  renderCalendarAtStart(handler) {
    window.addEventListener('load', handler);
  }

  // triggers adding the recipe to the weekly plan (запускает добавление рецепта в еженедельное меню)
  addHandlerAddToCalendar(handler) {
    this._btnCalendar.addEventListener(
      'click',
      function () {
        handler();
        this.hideFloatingButtons();
        this.defaultCalendarParameters();
      }.bind(this)
    );
  }

  // triggers removing the recipe from the weekly plan (запускает удаление рецепта из еженедельного меню)
  addHandlerEmptyCalendarDay(handler) {
    this._btnEmptyDay.addEventListener(
      'click',
      function () {
        if (!this._activeRecipe) return;
        handler(this._curRecipe);
        this.hideFloatingButtons();
        this.defaultCalendarParameters();
      }.bind(this)
    );
  }

  // triggers emptying all days in the weekly calendar (запускает удаление всех рецептов из еженедельного меню)
  addHandlerEmptyCalendar(handler) {
    this._btnEmptyCalendar.addEventListener('click', handler);
  }

  /**
   * highlights the recipe that the user selects with dblclick, and removes the selection in certain conditions (выделяет рецепт после двойного клика, и убирает выделение в определенных условиях)
   * @param {none} none
   * @returns {undefined}
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  addHandlerActivateRecipe() {
    this._parentElement.addEventListener(
      'dblclick',
      function (e) {
        if (!e.target.closest('.calendar__day')) return;

        //changes the BG color of all days (изменяет цвет всех превью рецептов в меню)
        this._parentElement.querySelectorAll('.calendar__day').forEach(day => (day.style.backgroundColor = '#f9f5f3'));

        //checks if the last selected day is the same as the newly selected and, if so - deselects everything (проверяет последний выделенный рецепт, и если это тот же что и новый - отменяет выделение)
        if (this._curRecipe === +e.target.closest('.calendar__day').dataset.day) {
          this.hideFloatingButtons();
          this.defaultCalendarParameters();
        } else {
          //if not, it highlights the chosen day, determines its current location and lets the buttons appear next to it (а если это другой рецепт, определяет его и выводит кнопки управления)
          const mousePosition = this.countMousePosition(e);
          this._floatingButtons.style.left = mousePosition[0];
          this._floatingButtons.style.top = mousePosition[1];
          this._floatingButtons.style.display = 'inline-flex';
          this._floatingButtons.classList.remove('hidden');
          this._activeRecipe = true;
          const currentRecipe = e.target.closest('.calendar__day');
          this._curRecipe = +currentRecipe.dataset.day;
          currentRecipe.style.backgroundColor = '#d3c7c3';
        }
      }.bind(this)
    );
    document.body.addEventListener(
      'click',
      function (e) {
        // removes selection and buttons in certain conditions (снимает выделене и прячет кнопки управления в нужных условиях)
        if (
          !e.target.closest('.calendar__day') ||
          (e.target.closest('.calendar__day').dataset.day !== this._curRecipe && this._activeRecipe === true)
        ) {
          this._parentElement.querySelectorAll('.calendar__day').forEach(day => (day.style.backgroundColor = '#f9f5f3'));
          this.hideFloatingButtons();
          this.defaultCalendarParameters();
        }
      }.bind(this)
    );
  }

  // determines mouse position (определяет местоположение курсора)
  countMousePosition(e) {
    const parentPosition = document.body.getBoundingClientRect();
    const mouseCurX = e.clientX - parentPosition.left;
    const mouseCurY = e.clientY - parentPosition.top;
    return [mouseCurX + 'px', mouseCurY + 'px'];
  }

  //hides the buttons (прячет кнопки управления)
  hideFloatingButtons() {
    this._floatingButtons.classList.add('hidden');
    this._floatingButtons.style.display = 'none';
  }

  //returns weekly plan day selection settings to default conditions (возвращает настройки и параметры меню к изначальным)
  defaultCalendarParameters() {
    this._activeRecipe = false;
    this._curRecipe = '';
  }

  //uses data and a function that generates HTML code to then combine it for rendering (объединяет HTML контент для создания рецептов в меню)
  _generateMarkup() {
    return this._data.map(day => this._generateCalendarRecipeMarkup(day)).join('');
  }

  /**
   * generates HTML code for one recipe (генерирует HTML код для одного рецепта)
   * @param {Object}
   * @returns {string} HTML element
   * @author Dmitriy Vnuchkov
   */
  _generateCalendarRecipeMarkup(data) {
    return `
          <div class="calendar__day calendar--name" draggable="true" data-day="${data.day}">
          <span class="calendar--name">Day ${data.day}</span>
          ${
            Object.keys(data.recipe).length !== 0
              ? `<li class="previewc">
                   <div class="image__box">
                     <figure class="previewc__fig">
                       <img src="${data.recipe.image}" alt="${data.recipe.title}" draggable="false" />
                     </figure>
                   </div>
                   <div class="previewc__data">
                      <h4 class="previewc__title calendar-preview-title">${data.recipe.title}</h4> 
                   </div>
                 </li>`
              : ''
          }
          </div>`;
  }

  // generates empty weekly plan HTML (создает пустое еженедельное меню)
  defaultCalendar() {
    return (this._parentElement.innerHTML = `
            <div class="calendar__day calendar--name" draggable="true" data-day="1"><span class="calendar--name">Day 1</span></div>
            <div class="calendar__day calendar--name" draggable="true" data-day="2"><span class="calendar--name">Day 2</span></div>
            <div class="calendar__day calendar--name" draggable="true" data-day="3"><span class="calendar--name">Day 3</span></div>
            <div class="calendar__day calendar--name" draggable="true" data-day="4"><span class="calendar--name">Day 4</span></div>
            <div class="calendar__day calendar--name" draggable="true" data-day="5"><span class="calendar--name">Day 5</span></div>
            <div class="calendar__day calendar--name" draggable="true" data-day="6"><span class="calendar--name">Day 6</span></div>
            <div class="calendar__day calendar--name" draggable="true" data-day="7"><span class="calendar--name">Day 7</span></div>
          `);
  }

  ///////////////////////////////////////
  //////////////////////// DRAG AND DROP FUNCTIONS ////////////////////////

  /**
   * changes the view of the calendar day once it is dragged over, and returns its initial features when the dragover is over (изменяет вид еженедельного меню при перетаскивании, и возвращает вид, когда перетаскивание закончилось)
   * @param {none}
   * @returns {undefined}
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  addHandlerDraggedTo() {
    this._parentElement.addEventListener(
      'dragover',
      function (e) {
        e.preventDefault();
        //if dragging over the calendar day finishes, its HTML and BG colors are restored (если поле для пере)
        if (!e.target.closest('.calendar__day')) {
          if (this._draggedOverDay) {
            this._draggedOverDay.innerHTML = this._lastDraggedOverDayInnerHTML;
            this._draggedOverDay.style.backgroundColor = '#f9f5f3';
            this._draggedOverDay = false;
          }
          this._switch = true;
        }
        //if the calendar day is dragged over, its HTML is stored outside while its innerHTML changes (если перетаскивание находится над конкретным днем в меню, контент этого дня сохраняется отдельно на случай отмены перетаскивания)
        if (e.target.closest('.calendar__day')) {
          if (this._switch === true) {
            this._draggedOverDay = e.target.closest('.calendar__day');
            this._lastDraggedOverDayInnerHTML = this._draggedOverDay.innerHTML;
            this._draggedOverDay.innerHTML = `Drop Recipe to Day ${this._draggedOverDay.dataset.day}`;
            this._draggedOverDay.style.backgroundColor = '#918581';
            this._switch = false;
          }
        }
      }.bind(this)
    );
  }

  // triggers data processing once it is dropped (запускает обратотку данных в момент активированного перетаскивания)
  addHandlerDropTo(handler) {
    this._parentElement.addEventListener('drop', function (e) {
      e.preventDefault();
      handler(e.dataTransfer.getData('text/plain'));
    });
  }

  /**
   * allows dragging Weekly menu recipes to move the recipes or to display the recipe details (позволяет перетаскивание рецептов внутри еженедельного меню и в главное окно рецептов)
   * @param {none}
   * @returns {undefined}
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  addHandlerDraggableCalendarDays() {
    this._parentElement.addEventListener(
      'dragstart',
      function (e) {
        this.hideFloatingButtons();
        const i = +e.target.closest('.calendar__day').dataset.day - 1;
        e.dataTransfer.setData('text/plain', JSON.stringify(this._data[i]));
      }.bind(this)
    );
  }

  /**
   * helps to return the HTML inside the "draggedover" Calendar Day to its initial conditions and returns default CalendarView settings (позволяет вернуть контент дня из еженедельного меню, если перетаскивание не осуществилось)
   * @param {none}
   * @returns {undefined}
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  returnToDefaultDraggingSettings() {
    if (!this._draggedOverDay) return;
    if (this._draggedOverDay.innerHTML.startsWith('Drop')) this._draggedOverDay.innerHTML = this._lastDraggedOverDayInnerHTML;
    this._draggedOverDay.style.backgroundColor = '#f9f5f3';
    this._draggedOverDay = false;
    this._switch = true;
  }
}

export default new CalendarView();

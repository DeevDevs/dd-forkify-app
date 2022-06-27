import View from './View.js';

///////////////// MY ADDONS ////////////////
class CalendarView extends View {
  _parentElement = document.querySelector('.calendar');
  _errorMessage = `We could not find the recipe ! Please, open the recipe that you want to add.`;
  _floatingButtons = document.querySelector('.floating__buttons');
  _calendarDays = document.querySelectorAll('.calendar__day');

  _btnCalendar = document.querySelector('.btn-add-to-calendar');
  _btnEmptyDay = document.querySelector('.btn--empty--day');
  _btnEmptyCalendar = document.querySelector('.btn--empty--calendar');
  //a ghost element is stored here (instead of just dragging the ghost image of the main window recipe)
  _ghostElement;
  // variables used for calendar settings and manipulations
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

  ///////////////////////////////////////
  //////////////////////// ADDING EVENT LISTENERS ////////////////////////

  //see Controller.js... the handler function retrieves data from the browser memory and renders the weekly calendar
  renderCalendarAtStart(handler) {
    window.addEventListener('load', handler);
  }

  //see Controller.js... the handler function adds the recipe to the weekly calendar
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

  //see Controller.js... the handler function removes the recipe from a certain day in the weekly calendar
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

  //see Controller.js... the handler function empties all days in the weekly calendar
  addHandlerEmptyCalendar(handler) {
    this._btnEmptyCalendar.addEventListener('click', handler);
  }

  ///////////////////////////////////////
  //////////////////////// SELECTION AND DESELECTION FUNCTIONS ////////////////////////

  /**
   * highlights the recipe that the user selects with dblclick, and removes the selection in certain conditions
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

        //changes the BG color of all days
        this._parentElement
          .querySelectorAll('.calendar__day')
          .forEach(day => (day.style.backgroundColor = '#f9f5f3'));

        //checks if the last selected day (outside variable) is the same as the newly selected and, if so - deselects everything
        if (
          this._curRecipe === +e.target.closest('.calendar__day').dataset.day
        ) {
          this.hideFloatingButtons();
          this.defaultCalendarParameters();
        } else {
          //if not, it highlights the chosen day, determines its current location and lets the buttons appear next to it
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
        //checks if the clicked target is not a previously selected day and if any selection is currently ON, and deselects everything, if conditions are met
        if (
          !e.target.closest('.calendar__day') ||
          (e.target.closest('.calendar__day').dataset.day !== this._curRecipe &&
            this._activeRecipe === true)
        ) {
          this._parentElement
            .querySelectorAll('.calendar__day')
            .forEach(day => (day.style.backgroundColor = '#f9f5f3'));
          this.hideFloatingButtons();
          this.defaultCalendarParameters();
        }
      }.bind(this)
    );
  }

  /**
   * highlights the recipe that the user selects with dblclick, and removes the selection in certain conditions
   * @param {none} none
   * @returns {Object[]} array with click coordinates
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  countMousePosition(e) {
    const parentPosition = document.body.getBoundingClientRect();
    const mouseCurX = e.clientX - parentPosition.left;
    const mouseCurY = e.clientY - parentPosition.top;
    return [mouseCurX + 'px', mouseCurY + 'px'];
  }

  //hides the buttons after certain commands
  hideFloatingButtons() {
    this._floatingButtons.classList.add('hidden');
    this._floatingButtons.style.display = 'none';
  }

  //returns weekly plan day selection settings to default conditions
  defaultCalendarParameters() {
    this._activeRecipe = false;
    this._curRecipe = '';
  }

  ///////////////////////////////////////
  //////////////////////// HTML CODE GENERATING FUNCTIONS ////////////////////////

  //uses data and a function that generates HTML code to then combine it for rendering
  _generateMarkup() {
    return this._data
      .map(day => this._generateCalendarRecipeMarkup(day))
      .join('');
  }

  /**
   * generates HTML code on every instance of an object in the array
   * @param {Object[]} array an array of objects that represent weekly plan days
   * @returns {string} HTML element
   * @author Dmitriy Vnuchkov
   */
  _generateCalendarRecipeMarkup(data) {
    return `
          <div class="calendar__day calendar--name" draggable="true" data-day="${
            data.day
          }">
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

  /**
   * generates HTML code on every instance of an object in the array
   * @param {none} none
   * @returns {string} HTML element
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
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
   * changes the view of the calendar day once it is dragged over, and returns its initial features when the dragover is over
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
        //if dragging over the calendar day finishes, its HTML and BG colors are restored
        if (!e.target.closest('.calendar__day')) {
          if (this._draggedOverDay) {
            this._draggedOverDay.innerHTML = this._lastDraggedOverDayInnerHTML;
            this._draggedOverDay.style.backgroundColor = '#f9f5f3';
            this._draggedOverDay = false;
          }
          this._switch = true;
        }
        //if the calendar day is dragged over, its HTML is stored outside while its innerHTML changes
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

  /**
   * adds listener to the DOM element that receives data, once it is dropped after dragging and transfers it to the handler
   * @param {function} controller.controlAddDraggedRecipe the function that checks and renders the received data
   * @returns {undefined}
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  addHandlerDropTo(handler) {
    this._parentElement.addEventListener('drop', function (e) {
      e.preventDefault();
      handler(e.dataTransfer.getData('text/plain'));
    });
  }

  /**
   * adds listener to the DOM element that allows to drag Calendar Days (to later change the position of recipes inside the Calendar and show it in the main Recipe View window)
   * @param {none}
   * @returns {undefined}
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  addHandlerDraggableCalendarDays() {
    this._parentElement.addEventListener(
      'dragstart',
      function (e) {
        //sets the data according to the number of the chosen day which is also stored in this._data
        this.hideFloatingButtons();
        const i = +e.target.closest('.calendar__day').dataset.day - 1;
        e.dataTransfer.setData('text/plain', JSON.stringify(this._data[i]));
      }.bind(this)
    );
  }

  /**
   * helps to return the HTML inside the "draggedover" Calendar Day to its initial conditions and returns default CalendarView settings
   * @param {none}
   * @returns {undefined}
   * @this {Object} CalendarView instanse
   * @author Dmitriy Vnuchkov
   */
  returnToDefaultDraggingSettings() {
    if (!this._draggedOverDay) return;
    if (this._draggedOverDay.innerHTML.startsWith('Drop'))
      this._draggedOverDay.innerHTML = this._lastDraggedOverDayInnerHTML;
    this._draggedOverDay.style.backgroundColor = '#f9f5f3';
    this._draggedOverDay = false;
    this._switch = true;
  }
}

export default new CalendarView();

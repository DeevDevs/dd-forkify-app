// this class is responsible for the search functionality. It is the only class that is not built on the basis of parent View (этот класс отвечает за функциональность поля поиска. Это единственный класс который создан не на базе родителя View)
class SearchView {
  _parentEl = document.querySelector('.search');
  getQuery() {
    const query = this._parentEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  /**
   * empties the search input field (опутошает поле для поиска)
   * @param {none}
   * @returns {none}
   * @this {Object} Search View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  /**
   * trigger search functions (запускает функции поиска рецептов)
   * @param {none}
   * @returns {none}
   * @this {Object} View instance
   * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
   */
  addHandlerSearch(handler) {
    this._parentEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();

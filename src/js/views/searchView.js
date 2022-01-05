class SearchView {
  _parentEl = document.querySelector('.search');
  getQuery() {
    const query = this._parentEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  //empties the search input field
  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  // see controller.js ..  triggers function that initiates the search process
  addHandlerSearch(handler) {
    //we make the entire form a listener because then it will even listen to the enter button
    this._parentEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();

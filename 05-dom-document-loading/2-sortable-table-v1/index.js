export default class SortableTable {

  element;
  subElements = {};
  headerConfig = [];
  data = [];

  constructor(headerConfig, {data = []} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}</div>
    `;
  }

  getHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow()}
      </div>
    `;
  }

  getHeaderSortingArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>
    `;
  }

  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>`;
  }

  render() {
    const $wrapper = document.createElement('div');

    $wrapper.innerHTML = this.getTable(this.data);

    const element = $wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  sort(fieldValue, orderValue) {
    if(orderValue === "asc") {
      if(fieldValue === 'price' || fieldValue === 'sales') {
        this.data = SortableTable.sortAscNum(this.data, fieldValue);
      } else {
        this.data = SortableTable.sortAsc(this.data, fieldValue);
      }
    } else if(orderValue === "desc") {
      if(fieldValue === 'price' || fieldValue === 'sales') {
        this.data = SortableTable.sortDescNum(this.data, fieldValue);
      } else {
        this.data = SortableTable.sortDesc(this.data, fieldValue);
      }
    }

    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

    // NOTE: Remove sorting arrow from other columns
    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = orderValue;
    this.subElements.body.innerHTML = this.getTableRows(this.data);
  }

  static sortAsc(arr, fieldValue) {
    return arr.slice(0).sort((a, b) =>
      a[fieldValue].localeCompare(b[fieldValue], 'ru-RU', {caseFirst: 'upper'}));
    }

  static sortDesc(arr, fieldValue) {
    return arr.slice(0).sort((a, b) =>
      b[fieldValue].localeCompare(a[fieldValue], 'ru-RU', {caseFirst: 'upper'}));
  }


  static sortAscNum(arr, fieldValue) {
    return arr.slice(0).sort((a, b) =>
      a[fieldValue]-b[fieldValue]
    );
  }

  static sortDescNum(arr, fieldValue) {
    return arr.slice(0).sort((a, b) =>
      b[fieldValue]-a[fieldValue]
    );
  }

}


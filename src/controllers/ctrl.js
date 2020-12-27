class Ctrl {
  constructor(html) {
    this.parseDom(html);
  }

  parseDom(html) {
    const el = document.createElement('div');
    el.innerHTML = html;

    if (el.children.length > 1) {
      throw new Error('Controller template only accept one element.');
    }

    this.el = el.children[0];
    this.items = {};
    Array.from(el.querySelectorAll('*[data-id]')).forEach((el) => {
      this.items[el.getAttribute('data-id')] = el;
    });
  }
}

/**
 * Extender class
 * Simple controller to show/hide long content
 * with a button.
 */
class TopbarCtrl extends Ctrl {
  constructor() {
    super(`
      <div class="topbar">
        <div data-id="start">Tap to start</div>
        <div data-id="folder"></div>
        <div data-id="path"></div>
      </div>
    `);
    this.init();
  }

  init() {
    this.items.start.addEventListener('click', () => setDomain());
  }

  setDomain(domain) {
    const domainSplit = domain.split('/').slice(2);
    this.folderLabel = domainSplit.pop() || domainSplit.pop();
    this.pathLabel = domainSplit.join('/');
    this.render();
  }

  render() {
    this.items.folder.innerText = this.folderLabel;
    this.items.path.innerText = this.pathLabel || ' ';

    this.items.start.style.display = this.folderLabel ? 'none' : 'inherit';
    this.items.folder.style.display = !this.folderLabel ? 'none' : 'inherit';
    this.items.path.style.display = !this.folderLabel ? 'none' : 'inherit';
  }
}

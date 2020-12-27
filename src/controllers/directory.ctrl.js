/**
 * Extender class
 * Simple controller to show/hide long content
 * with a button.
 */
class DirectoryCtrl extends Ctrl {
  constructor() {
    super(`
      <div class="directory">
      </div>
    `);
    this.fileList = [];
  }

  setFiles(fileList) {
    this.fileList = fileList;
    this.render();
  }

  /**
   * Render the DOM from the state of the controller
   *
   */
  render() {
    const dirs = this.fileList
      .filter((file) => file.isDir)
      .map(
        (file) => `
        <div class="fileItem" onclick="goToDir('${file.link}')">
          <span>${file.label}</span>
        </div>
      `
      )
      .join('');
    const files = this.fileList
      .filter((file) => !file.isDir)
      .map(
        (file) => `
        <div class="fileItem" onclick="chromecaster('${file.link}')">
          <span>${file.label}</span>
        </div>
      `
      )
      .join('');
    this.el.innerHTML = dirs + files;
  }
}

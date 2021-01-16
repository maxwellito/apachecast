/**
 * Player Controller
 * To control the casted media
 */
class PlayerCtrl extends Ctrl {
  constructor() {
    super(`
      <div>
        <div class="player">
          <input data-id="progress" type="range" min="0" max="100" step="0.01"/>
          <div>
            <span data-id="currentTime"></span>
            <button data-id="seekBack" class="seek">- 20</button>
            <button data-id="pause">&nbsp;▌▌</button>
            <button data-id="seekForward" class="seek">+ 20</button>
            <span data-id="totalTime"></span>
          </div>
        </div>
        <div data-id="seek" class="player-seek">
          <div data-id="seekTime" class="player-seek-time">00:12:54</div>
          <div data-id="seekDiff" class="player-seek-diff">- 01:12</div>
        </div>
      </div>
    `);
    this.castPlayer = null;
    this.castPlayerController = null;
    this.seekingStart = null;
    this.seekingPos = null;

    // Binded listeners
    this.playerEvent = this.playerEvent.bind(this);
    this.pause = this.pause.bind(this);
    this.seekBack = this.seekBack.bind(this);
    this.seekForward = this.seekForward.bind(this);
    this.seekStart = this.seekStart.bind(this);
    this.seekSlide = this.seekSlide.bind(this);
    this.seek = this.seek.bind(this);
  }

  init() {
    this.items.pause.addEventListener('click', this.pause);
    this.items.seekBack.addEventListener('click', this.seekBack);
    this.items.seekForward.addEventListener('click', this.seekForward);
    this.items.progress.addEventListener('mousedown', this.seekStart);
    this.items.progress.addEventListener('touchstart', this.seekStart);
    this.items.progress.addEventListener('change', this.seek);
  }

  // UI Actions
  pause() {
    if (this.castPlayerController) {
      this.castPlayerController.playOrPause();
    }
  }

  seekBack() {
    this.castPlayer.currentTime = Math.max(0, (this.currentTime || 0) - 20);
    this.castPlayerController.seek();
  }
  seekForward() {
    this.castPlayer.currentTime = this.currentTime + 20;
    this.castPlayerController.seek();
  }
  seekStart() {
    console.log('seek start');
    this.seekingStart = this.castPlayer.currentTime;
    this.seekingPos = this.castPlayer.currentTime;
    this.items.progress.addEventListener('mousemove', this.seekSlide);
    this.items.progress.addEventListener('touchmove', this.seekSlide);
    this.updateHelper();
  }
  seekSlide() {
    console.log('seek slide');
    const newTime =
      (parseInt(this.items.progress.value) / 100) * this.mediaDuration;
    this.seekingPos = newTime;
    this.updateHelper();
  }
  seek(e) {
    console.log('seek end');
    if (this.mediaDuration) {
      const newTime = (parseInt(e.target.value) / 100) * this.mediaDuration;
      this.castPlayer.currentTime = newTime;
      this.castPlayerController.seek();
    }
    this.seekingStart = null;
    this.items.progress.removeEventListener('mousemove', this.seekSlide);
    this.items.progress.removeEventListener('touchmove', this.seekSlide);
    this.updateHelper();
  }

  setCast(player, playerController) {
    // Remove listener if exisiting
    if (this.castPlayerController) {
      playerController.removeEventListener(
        cast.framework.RemotePlayerEventType.ANY_CHANGE,
        this.playerEvent
      );
    }

    // Set the new player controller
    this.castPlayer = player;
    this.castPlayerController = playerController;
    playerController.addEventListener(
      cast.framework.RemotePlayerEventType.ANY_CHANGE,
      this.playerEvent
    );

    // Update duration
    const { duration } = player.mediaInfo;
    const cpc = this.castPlayerController;
    this.mediaDuration = duration;
    this.items.currentTime.innerText = cpc.getFormattedTime(0);
    this.items.totalTime.innerText = cpc.getFormattedTime(duration || 0);

    // Render
    this.render();
  }

  playerEvent(e) {
    console.log(e);
    const cpc = this.castPlayerController;
    switch (e.field) {
      case 'currentTime':
        this.currentTime = e.value;
        this.items.currentTime.innerText = cpc.getFormattedTime(e.value);
        if (this.mediaDuration && this.seekingStart === null) {
          this.items.progress.value = cpc.getSeekPosition(
            e.value,
            this.mediaDuration
          );
        }
        break;
      case 'canPause':
        this.items.pause.disabled = !e.value;
        break;
      case 'canSeek':
        this.items.progress.disabled = !e.value;
        this.items.seekBack.disabled = !e.value;
        this.items.seekForward.disabled = !e.value;
        break;
      case 'isPaused':
        this.items.pause.innerHTML = e.value ? '▶' : '&nbsp;▌▌';
        break;
      case 'mediaInfo':
        if (e.value) {
          this.mediaDuration = e.value.duration;
          this.items.totalTime.innerText = cpc.getFormattedTime(
            e.value.duration
          );
        } else {
          this.mediaDuration = null;
          this.items.currentTime.innerHTML = '&nbsp;';
          this.items.totalTime.innerHTML = '&nbsp;';
        }
        break;
    }
  }

  updateHelper() {
    if (this.seekingStart === null) {
      this.items.seek.style.visibility = 'hidden';
    } else {
      const cpc = this.castPlayerController;
      const diff = this.seekingPos - this.seekingStart;
      this.items.seek.style.visibility = 'visible';
      this.items.seekTime.innerText = cpc.getFormattedTime(this.seekingPos);
      this.items.seekDiff.innerText =
        (diff < 0 ? '-' : '') + cpc.getFormattedTime(Math.abs(diff));
    }
  }

  render() {
    // LOL
  }
}

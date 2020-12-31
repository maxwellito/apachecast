/**
 * Player Controller
 * To control the casted media
 */
class PlayerCtrl extends Ctrl {
  constructor() {
    super(`
      <div class="player">
        <input data-id="progress" type="range" min="0" max="100"/>
        <div>
          <span data-id="currentTime"></span>
          <button data-id="seekBack" class="seek">- 20</button>
          <button data-id="pause">&nbsp;▌▌</button>
          <button data-id="seekForward" class="seek">+ 20</button>
          <span data-id="totalTime"></span>
        </div>
      </div>
    `);
    this.castPlayer = null;
    this.castPlayerController = null;

    // Binded listeners
    this.playerEvent = this.playerEvent.bind(this);
    this.seek = this.seek.bind(this);
    this.seekBack = this.seekBack.bind(this);
    this.seekForward = this.seekForward.bind(this);
    this.pause = this.pause.bind(this);
  }

  init() {
    this.items.progress.addEventListener('change', this.seek);
    this.items.seekBack.addEventListener('click', this.seekBack);
    this.items.pause.addEventListener('click', this.pause);
    this.items.seekForward.addEventListener('click', this.seekForward);
  }

  // UI Actions
  pause() {
    if (this.castPlayerController) {
      this.castPlayerController.playOrPause();
    }
  }

  seek(e) {
    if (this.mediaDuration) {
      const newTime = (parseInt(e.target.value) / 100) * this.mediaDuration;
      this.castPlayer.currentTime = newTime;
      this.castPlayerController.seek();
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
    this.items.currentTime.innerText = '00:00:00';
    this.items.totalTime.innerText = PlayerCtrl.intToTime(
      player.mediaInfo.duration
    );

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
        if (this.mediaDuration) {
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
        this.items.pause.innerHTML = e.value ? '►' : '&nbsp;▌▌';
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
    }
  }

  render() {
    // LOL
  }
}

PlayerCtrl.intToTime = (t) => {
  if (!t) {
    return '';
  }
  let output = [Math.floor((t % 3600) / 60), t % 60]
    .map((i) => i.toString().padStart(2, '0'))
    .join(':');
  if (t > 3600) {
    output = Math.floor(t / 3600) + ':' + output;
  }
  return output;
};

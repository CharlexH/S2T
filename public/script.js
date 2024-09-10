const input = document.getElementById('file-input');
input.addEventListener('change', async function() {
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log(result);
});

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('uploadArea');

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  });

  const fileInput = document.getElementById('file-input');
  const uploadContent = document.querySelector('.upload-content');
  const uploadStatus = document.querySelector('.upload-status');
  const fileName = document.querySelector('.file-name');
  const progressBar = document.querySelector('.progress');
  const cancelButton = document.querySelector('.cancel-button');
  const audioPlayerArea = document.getElementById('audioPlayerArea');
  const resultArea = document.getElementById('resultArea');
  const playPauseButton = document.getElementById('playPauseButton');
  const currentTimeDisplay = document.getElementById('currentTime');
  const totalTimeDisplay = document.getElementById('totalTime');
  const resetButton = document.getElementById('resetButton');
  const uploadArea = document.getElementById('uploadArea');

  let wavesurfer;
  let uploadCancelled = false;

  // 点击上传区域触发文件选择
  dropZone.addEventListener('click', (e) => {
    if (e.target === dropZone || e.target.closest('.upload-content')) {
      fileInput.click();
    }
  });

  // 处理文件选择
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleFiles(fileInput.files);
    }
  });

  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      showUploadStatus(file.name);
      
      // 获取文件名，不包括后缀
      const fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
      document.getElementById('transcription').textContent = fileNameWithoutExtension; // 设置文件名
      uploadFile(file);
    }
  }

  function showUploadStatus(name) {
    console.log('显示上传状态:', name);
    uploadContent.style.display = 'none';
    uploadStatus.style.display = 'flex';
    fileName.textContent = name;
    progressBar.style.width = '0%';
  }

  function hideUploadStatus() {
    uploadContent.style.display = 'block';
    uploadStatus.style.display = 'none';
    fileInput.value = '';
  }

  async function uploadFile(file) {
    uploadCancelled = false;
    let progress = 0;
    const interval = setInterval(() => {
      if (uploadCancelled) {
        clearInterval(interval);
        hideUploadStatus();
        return;
      }
      progress += 10;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          showAudioPlayer(file);
        }, 500);
      }
    }, 500);

    cancelButton.onclick = () => {
      uploadCancelled = true;
      clearInterval(interval);
      hideUploadStatus();
    };
  }

  function showAudioPlayer(file) {
    console.log('显示音频播放器');
    uploadArea.style.display = 'none';
    audioPlayerArea.style.display = 'flex';
    resultArea.style.display = 'block';
    resetButton.style.display = 'block';

    wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#ccc',
      progressColor: '#0D0C22',
      cursorColor: '#ff0000',
      cursorWidth: 2,
      barWidth: 2,
      barRadius: 2,
      barGap: 2,
      barHeight: 1,
      responsive: true,
      height: 100,
      partialRender: true,
      plugins: [
        WaveSurfer.Hover.create({
          lineColor: '#ff0000',
          lineWidth: 2,
          labelBackground: '#555',
          labelColor: '#fff',
          labelSize: '11px',
        }),
      ],
    });

    wavesurfer.load(URL.createObjectURL(file));

    wavesurfer.on('ready', function() {
      updateTotalTime();
    });

    wavesurfer.on('audioprocess', function() {
      updateCurrentTime();
    });

    playPauseButton.onclick = togglePlayPause;
  }

  function resetInterface() {
    audioPlayerArea.style.display = 'none';
    resultArea.style.display = 'none';
    uploadArea.style.display = 'flex';
    resetButton.style.display = 'none';
    uploadStatus.style.display = 'none';
    uploadContent.style.display = 'flex';
    progressBar.style.width = '0%';
    fileName.textContent = '';

    if (wavesurfer) {
      wavesurfer.destroy();
      wavesurfer = null;
    }

    const playPauseIcon = document.getElementById('playPauseIcon');
    playPauseIcon.src = '../images/play.svg';
    playPauseIcon.alt = '播放';
    
    document.getElementById('transcription').textContent = '';
    fileInput.value = '';
    uploadCancelled = false;
    currentTimeDisplay.textContent = '00:00';
    totalTimeDisplay.textContent = '00:00';

    hideConfirmModal();
  }

  const confirmModal = document.getElementById('confirmModal');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');

  function showConfirmModal() {
    confirmModal.style.display = 'flex';
  }

  function hideConfirmModal() {
    confirmModal.style.display = 'none';
  }

  resetButton.addEventListener('click', showConfirmModal);

  confirmYes.addEventListener('click', resetInterface);
  confirmNo.addEventListener('click', hideConfirmModal);

  // 点击模态框外部也可以关闭
  window.addEventListener('click', (event) => {
    if (event.target === confirmModal) {
      hideConfirmModal();
    }
  });

  // 添加其他必要的数，如 togglePlayPause, updateCurrentTime, updateTotalTime, formatTime
  function togglePlayPause() {
    const playPauseIcon = document.getElementById('playPauseIcon');
    if (wavesurfer.isPlaying()) {
      wavesurfer.pause();
      playPauseIcon.src = '../images/play.svg';
      playPauseIcon.alt = '播放';
    } else {
      wavesurfer.play();
      playPauseIcon.src = '../images/pause.svg';
      playPauseIcon.alt = '暂停';
    }
  }

  function updateCurrentTime() {
    currentTimeDisplay.textContent = formatTime(wavesurfer.getCurrentTime());
  }

  function updateTotalTime() {
    totalTimeDisplay.textContent = formatTime(wavesurfer.getDuration());
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
});

const dropZone = document.getElementById('uploadArea');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    handleFiles([file]);  // 使用现有的处理函数
  }
});

function handleFiles(files) {
  if (files.length > 0) {
    const file = files[0];
    showUploadStatus(file.name);
    document.getElementById('transcription').textContent = file.name; // 设置文件名
    uploadFile(file);
  }
}

function uploadFile(file) {
  uploadCancelled = false;
  let progress = 0;
  const interval = setInterval(() => {
    if (uploadCancelled) {
      clearInterval(interval);
      hideUploadStatus();
      return;
    }
    progress += 10;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        showAudioPlayer(file);
      }, 500);
    }
  }, 500);

  cancelButton.onclick = () => {
    uploadCancelled = true;
    clearInterval(interval);
    hideUploadStatus();
  };
}
(function init() {
  const { document } = window;
  const wrapper = document.querySelector('.wrapper');
  const canvas = document.querySelector('.canvas');
  const context = canvas.getContext('2d');
  let dragging = false;
  const MIN_ZOOM = 25; // percents;
  const MAX_ZOOM = 400; // percents;
  const DEFAULT_ZOOM = 100; // percents;
  const imageSize = { w: 2400, h: 15000 };
  const xPos = 'right';
  const yPos = 'bottom';
  const startPos = { x: 0, y: 0 };
  const prev = { xPos: 0, yPos: 0 };
  const images = [
    '/images/shaft.png',
    '/images/head.png',
    '/images/grip.png',
  ];
  const queue = images.map((url) => {
    const image = new Image();
    image.src = url;

    return new Promise((resolve, reject) => {
      image.addEventListener('load', () => {
        resolve(image);
      });
      image.addEventListener('error', (error) => {
        reject(error);
      });
    });
  });
  const cancelDragging = () => {
    document.body.classList.remove('dragging');
    dragging = false;
  };
  const applyDragging = () => {
    document.body.classList.add('dragging');
    dragging = true;
  };
  const mouseDown = (ev) => {
    const pageX = ev.pageX === undefined ? ev.changedTouches[0].pageX : ev.pageX;
    const pageY = ev.pageY === undefined ? ev.changedTouches[0].pageY : ev.pageY;
    const canvasStyle = window.getComputedStyle(canvas);
    const x = parseFloat(canvasStyle[xPos]);
    const y = parseFloat(canvasStyle[yPos]);

    applyDragging();

    startPos.x = pageX;
    startPos.y = pageY;

    prev[xPos] = x || 0;
    prev[yPos] = y || 0;
  };
  const mouseMove = (ev) => {
    if (dragging) {
      const pageX = ev.pageX === undefined ? ev.changedTouches[0].pageX : ev.pageX;
      const pageY = ev.pageY === undefined ? ev.changedTouches[0].pageY : ev.pageY;
      const deltaX = pageX - startPos.x;
      const deltaY = pageY - startPos.y;
      const canvasStyle = window.getComputedStyle(canvas);
      const wrapperStyle = window.getComputedStyle(wrapper);

      const canvasWidth = parseFloat(canvasStyle.width);
      const wrapperWidth = parseFloat(wrapperStyle.width);
      const zoom = (canvasWidth / wrapperWidth || DEFAULT_ZOOM) * 100;

      canvas.style = [
        `width:${zoom}%`,
        `${xPos}:${(xPos === 'left' ? prev[xPos] + deltaX : prev[xPos] - deltaX)}px`,
        `${yPos}:${(yPos === 'top' ? prev[yPos] + deltaY : prev[yPos] - deltaY)}px`,
      ].join(';');
    }
  };
  const mouseWheel = (ev) => {
    const { deltaY } = ev;
    const zoomChange = Math.round(deltaY / 5);
    const canvasStyle = window.getComputedStyle(canvas);
    const wrapperStyle = window.getComputedStyle(wrapper);
    const wrapperWidth = parseFloat(wrapperStyle.width);
    const canvasWidth = parseFloat(canvasStyle.width);
    const x = parseFloat(canvasStyle[xPos]);
    const y = parseFloat(canvasStyle[yPos]);

    const oldZoom = (canvasWidth / wrapperWidth || DEFAULT_ZOOM) * 100;
    let newZoom = oldZoom + zoomChange;

    if (newZoom < MIN_ZOOM) {
      newZoom = MIN_ZOOM;
    }

    if (newZoom > MAX_ZOOM) {
      newZoom = MAX_ZOOM;
    }

    canvas.style = [
      `width:${newZoom}%`,
      `${xPos}:${x}px`,
      `${yPos}:${y}px`,
    ].join(';');
  };


  canvas.width = imageSize.w;
  canvas.height = imageSize.h;
  canvas.style = [
    `${xPos}:0`,
    `${yPos}:0`,
  ].join(';');

  Promise.all(queue)
    .then((data) => {
      data.forEach((img) => {
        context.drawImage(img, 0, 0);
      });
    })
    .catch((error) => {
      throw new Error(error);
    });

  wrapper.addEventListener('mouseup', () => cancelDragging);
  wrapper.addEventListener('mouseleave', () => cancelDragging);
  wrapper.addEventListener('mouseout', () => cancelDragging);
  wrapper.addEventListener('touchend', () => cancelDragging);
  wrapper.addEventListener('touchcancel', () => cancelDragging);

  wrapper.addEventListener('mousemove', mouseMove);
  wrapper.addEventListener('touchmove', mouseMove);
  wrapper.addEventListener('mousewheel', mouseWheel);
  wrapper.addEventListener('touchstart', mouseDown);
  wrapper.addEventListener('mousedown', mouseDown);
}());

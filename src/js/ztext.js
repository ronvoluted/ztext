/*!
 * ztext.js v0.0.2
 * https://bennettfeely.com/ztext
 * Licensed MIT | (c) 2020 Bennett Feely
 */

const DEFAULTS = {
  depth: '1rem',
  direction: 'both',
  event: 'none',
  eventRotation: '30deg',
  eventDirection: 'default',
  fade: false,
  layers: 10,
  perspective: '500px'
};

const getElements = (selector = '[data-z]') => {
  return document.querySelectorAll(selector);
};

const setElementsOptions = (elements, options) => {
  elements.forEach((z) => {
    zDraw(z, {
      depth: z.dataset.zDepth || options.depth,
      direction: z.dataset.zDirection || options.direction,
      event: z.dataset.zEvent || options.event,
      eventRotation: z.dataset.zEventrotation || options.eventRotation,
      eventDirection: z.dataset.zEventdirection || options.eventDirection,
      fade: z.dataset.zFade || options.fade,
      layers: parseFloat(z.dataset.zLayers) || options.layers,
      perspective: z.dataset.zPerspective || options.perspective
    });
  });
};

// JS constructor
function Ztextify(selector, options) {
  const zs = document.querySelectorAll(selector);

  zs.forEach((z) => {
    zDraw(z, options);
  });
}

function zDraw(z, { depth, direction, event, eventRotation, eventDirection, fade, layers, perspective }) {
  const depth_unit = depth.match(/[a-z]+/)[0];
  const depth_numeral = parseFloat(depth.replace(depth_unit, ''));
  const event_rotation_unit = eventRotation.match(/[a-z]+/)[0];
  const event_rotation_numeral = parseFloat(eventRotation.replace(event_rotation_unit, ''));

  // Grab the text and replace it with a new structure
  const text = z.innerHTML;
  z.innerHTML = '';
  z.style.display = 'inline-block';
  z.style.position = 'relative';
  z.style.perspective = perspective;

  // Create a wrapper span that will hold all the layers
  const zText = document.createElement('span');
  zText.setAttribute('class', 'z-text');
  zText.style.display = 'inline-block';
  zText.style.transformStyle = 'preserve-3d';

  // Create a layer for transforms from JS to be applied
  // CSS is stupid that transforms cannot be applied individually
  const zLayers = document.createElement('span');
  zLayers.setAttribute('class', 'z-layers');
  zLayers.style.display = 'inline-block';
  zLayers.style.transformStyle = 'preserve-3d';

  zText.append(zLayers);

  for (let i = 0; i < layers; i++) {
    let pct = i / layers;

    // Create a layer
    const zLayer = document.createElement('span');
    zLayer.setAttribute('class', 'z-layer');
    zLayer.innerHTML = text;
    zLayer.style.display = 'inline-block';

    // Shift the layer on the z axis
		let zTranslation;

		switch(direction) {
			case 'backwards':
				zTranslation = -pct * depth_numeral;
				break;
			case 'forwards':
				zTranslation = -(pct * depth_numeral) + depth_numeral;
				break;
			default:
				zTranslation = -(pct * depth_numeral) + depth_numeral / 2;
				break;
		}

    const transform = 'translateZ(' + zTranslation + depth_unit + ')';
    zLayer.style.transform = transform;
    // zLayer.style.transform = depth + 'em';

    // Manipulate duplicate layers
    if (i >= 1) {
      // Overlay duplicate layers on top of each other
      zLayer.style.position = 'absolute';
      zLayer.style.top = 0;
      zLayer.style.left = 0;

      // Hide duplicate layres from screen readers and user interation
      zLayer.setAttribute('aria-hidden', 'true');

      zLayer.style.pointerEvents = 'none';

      zLayer.style.mozUserSelect = 'none';
      zLayer.style.msUserSelect = 'none';
      zLayer.style.webkitUserSelect = 'none';
      zLayer.style.userSelect = 'none';

      // Incrementally fade layers if option is enabled
      if (fade === true || fade === 'true') {
        zLayer.style.opacity = (1 - pct) / 2;
      }
    }

    // Add layer to wrapper span
    zLayers.append(zLayer);
  }

  // Finish adding everything to the original element
  z.append(zText);

  function tilt(x_pct, y_pct) {
    // Switch neg/pos values if eventDirection is reversed
		let event_direction_adj;

    if (eventDirection == 'reverse') {
      event_direction_adj = -1;
    } else {
      event_direction_adj = 1;
    }

    // Multiply pct rotation by eventRotation and eventDirection
    const x_tilt = x_pct * event_rotation_numeral * event_direction_adj;
    const y_tilt = -y_pct * event_rotation_numeral * event_direction_adj;

    // Add unit to transform value
    const unit = event_rotation_unit;

    // Rotate .z-layers as a function of x and y coordinates
    const transform = 'rotateX(' + y_tilt + unit + ') rotateY(' + x_tilt + unit + ')';
    zLayers.style.transform = transform;
  }

  // Capture mousemove and touchmove events and rotate .z-layers
  if (event === 'pointer') {
    window.addEventListener(
      'mousemove',
      (e) => {
        const x_pct = (e.clientX / window.innerWidth - 0.5) * 2;
        const y_pct = (e.clientY / window.innerHeight - 0.5) * 2;

        tilt(x_pct, y_pct);
      },
      false
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        const x_pct = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        const y_pct = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;

        tilt(x_pct, y_pct);
      },
      false
    );
  }

  // Capture scroll event and rotate .z-layers
  if (event == 'scroll') {
    function zScroll() {
      const bounds = z.getBoundingClientRect();
      const center_x = bounds.left + bounds.width / 2 - window.innerWidth / 2;
      const center_y = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const x_pct = (center_x / window.innerWidth) * -2;
      const y_pct = (center_y / window.innerHeight) * -2;

      tilt(x_pct, y_pct);
    }

    zScroll();
    window.addEventListener('scroll', zScroll, false);
  }

  if (event == 'scrollY') {
    function zScrollY() {
      const bounds = z.getBoundingClientRect();
      const center_y = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const y_pct = (center_y / window.innerHeight) * -2;

      tilt(0, y_pct);
    }

    zScrollY();
    window.addEventListener('scroll', zScrollY, false);
  }

  if (event == 'scrollX') {
    function zScrollX() {
      const bounds = z.getBoundingClientRect();
      const center_x = bounds.left + bounds.width / 2 - window.innerWidth / 2;
      const x_pct = (center_x / window.innerWidth) * -2;

      tilt(x_pct, 0);
    }

    zScrollX();
    window.addEventListener('scroll', zScrollX, false);
  }
}

const zText = (options = DEFAULTS) => {
  const zs = getElements();

  setElementsOptions(zs, options);
};

export { zText };

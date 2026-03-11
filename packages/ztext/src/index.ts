/*!
 * ztext.js v1.0.1
 * https://bennettfeely.com/ztext
 * Licensed MIT | (c) 2020 Bennett Feely
 */

export interface ZtextOptions {
	depth?: string;
	direction?: "both" | "backwards" | "forwards";
	event?: "none" | "pointer" | "scroll" | "scrollX" | "scrollY";
	eventRotation?: string;
	eventDirection?: "default" | "reverse";
	fade?: boolean | string;
	layers?: number;
	perspective?: string;
	zEngaged?: boolean | string;
}

const DEFAULTS: Required<ZtextOptions> = {
	depth: "1rem",
	direction: "both",
	event: "none",
	eventRotation: "30deg",
	eventDirection: "default",
	fade: false,
	layers: 10,
	perspective: "500px",
	zEngaged: true,
};

function parseUnit(value: string): { numeral: number; unit: string } {
	const unit = value.match(/[a-z]+/)?.[0] ?? "px";
	const numeral = parseFloat(value.replace(unit, ""));
	return { numeral, unit };
}

function supports3d(): boolean {
	if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
		return false;
	}
	return CSS.supports("transform-style", "preserve-3d");
}

function zDraw(
	element: HTMLElement,
	options: ZtextOptions,
): Array<[string, EventListener]> {
	const zEngaged = options.zEngaged ?? DEFAULTS.zEngaged;
	if (zEngaged === false || zEngaged === "false") return [];

	const depth = options.depth ?? DEFAULTS.depth;
	const { numeral: depthNumeral, unit: depthUnit } = parseUnit(depth);

	const direction = options.direction ?? DEFAULTS.direction;
	const event = options.event ?? DEFAULTS.event;
	const eventRotation = options.eventRotation ?? DEFAULTS.eventRotation;
	const { numeral: eventRotationNumeral, unit: eventRotationUnit } =
		parseUnit(eventRotation);
	const eventDirection = options.eventDirection ?? DEFAULTS.eventDirection;

	const fade = options.fade ?? DEFAULTS.fade;
	const layers = options.layers ?? DEFAULTS.layers;
	const perspective = options.perspective ?? DEFAULTS.perspective;

	const text = element.innerHTML;
	element.innerHTML = "";
	element.style.display = "inline-block";
	element.style.position = "relative";
	element.style.perspective = perspective;

	const zText = document.createElement("span");
	zText.className = "z-text";
	zText.style.display = "inline-block";
	zText.style.transformStyle = "preserve-3d";

	const zLayers = document.createElement("span");
	zLayers.className = "z-layers";
	zLayers.style.display = "inline-block";
	zLayers.style.transformStyle = "preserve-3d";

	zText.append(zLayers);

	for (let i = 0; i < layers; i++) {
		const pct = i / layers;

		const zLayer = document.createElement("span");
		zLayer.className = "z-layer";
		zLayer.innerHTML = text;
		zLayer.style.display = "inline-block";

		let zTranslation: number;
		if (direction === "backwards") {
			zTranslation = -pct * depthNumeral;
		} else if (direction === "forwards") {
			zTranslation = -(pct * depthNumeral) + depthNumeral;
		} else {
			// "both"
			zTranslation = -(pct * depthNumeral) + depthNumeral / 2;
		}

		const transform = `translateZ(${zTranslation}${depthUnit})`;
		zLayer.style.transform = transform;

		if (i >= 1) {
			zLayer.style.position = "absolute";
			zLayer.style.top = "0";
			zLayer.style.left = "0";
			zLayer.setAttribute("aria-hidden", "true");
			zLayer.style.pointerEvents = "none";
			zLayer.style.userSelect = "none";

			if (fade === true || fade === "true") {
				zLayer.style.opacity = String((1 - pct) / 2);
			}
		}

		zLayers.append(zLayer);
	}

	element.append(zText);

	function tilt(xPct: number, yPct: number): void {
		const dirAdj = eventDirection === "reverse" ? -1 : 1;
		const xTilt = xPct * eventRotationNumeral * dirAdj;
		const yTilt = -yPct * eventRotationNumeral * dirAdj;
		const unit = eventRotationUnit;

		zLayers.style.transform = `rotateX(${yTilt}${unit}) rotateY(${xTilt}${unit})`;
	}

	const listeners: Array<[string, EventListener]> = [];

	if (event === "pointer") {
		const onMouseMove = (e: MouseEvent) => {
			const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
			const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
			tilt(xPct, yPct);
		};
		const onTouchMove = (e: TouchEvent) => {
			const xPct = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
			const yPct = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
			tilt(xPct, yPct);
		};

		window.addEventListener("mousemove", onMouseMove as EventListener);
		window.addEventListener("touchmove", onTouchMove as EventListener);
		listeners.push(
			["mousemove", onMouseMove as EventListener],
			["touchmove", onTouchMove as EventListener],
		);
	}

	if (event === "scroll" || event === "scrollX" || event === "scrollY") {
		const zScroll = () => {
			const bounds = element.getBoundingClientRect();
			const centerX =
				bounds.left + bounds.width / 2 - window.innerWidth / 2;
			const centerY =
				bounds.top + bounds.height / 2 - window.innerHeight / 2;
			const xPct = (centerX / window.innerWidth) * -2;
			const yPct = (centerY / window.innerHeight) * -2;

			if (event === "scrollY") {
				tilt(0, yPct);
			} else if (event === "scrollX") {
				tilt(xPct, 0);
			} else {
				tilt(xPct, yPct);
			}
		};

		zScroll();
		window.addEventListener("scroll", zScroll);
		listeners.push(["scroll", zScroll]);
	}

	return listeners;
}

export class Ztextify {
	private listeners: Array<[string, EventListener]> = [];

	constructor(
		selector: string | HTMLElement,
		options: ZtextOptions = {},
	) {
		if (!supports3d()) return;

		if (typeof selector === "string") {
			const elements = document.querySelectorAll<HTMLElement>(selector);
			elements.forEach((el) => {
				this.listeners.push(...zDraw(el, options));
			});
		} else {
			this.listeners.push(...zDraw(selector, options));
		}
	}

	destroy(): void {
		for (const [type, listener] of this.listeners) {
			window.removeEventListener(type, listener);
		}
		this.listeners = [];
	}
}

export function init(): void {
	if (!supports3d()) {
		console.error(
			"ztext is disabled because transform-style: preserve-3d; is unsupported",
		);
		return;
	}

	const elements = document.querySelectorAll<HTMLElement>("[data-z]");
	elements.forEach((el) => {
		const options: ZtextOptions = {
			depth: el.dataset.zDepth ?? DEFAULTS.depth,
			direction:
				(el.dataset.zDirection as ZtextOptions["direction"]) ??
				DEFAULTS.direction,
			event:
				(el.dataset.zEvent as ZtextOptions["event"]) ?? DEFAULTS.event,
			eventRotation: el.dataset.zEventrotation ?? DEFAULTS.eventRotation,
			eventDirection:
				(el.dataset.zEventdirection as ZtextOptions["eventDirection"]) ??
				DEFAULTS.eventDirection,
			fade: el.dataset.zFade ?? DEFAULTS.fade,
			layers: parseFloat(el.dataset.zLayers ?? "") || DEFAULTS.layers,
			perspective: el.dataset.zPerspective ?? DEFAULTS.perspective,
			zEngaged: el.dataset.z ?? DEFAULTS.zEngaged,
		};

		zDraw(el, options);
	});
}

export default init;

class OfficeSimulation {
	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.ctx = this.canvas.getContext("2d");
		this.isManaged = false;
		this.startTime = Date.now();
		this.spaces = [];
		this.characters = [];
		this.animationFrameId = null;
		this.initialize();
	}

	initialize() {
		const initialState = createInitialState();

		// Initialize spaces
		this.spaces = initialState.spaces.map(
			(space) =>
				new Space(
					space.id,
					space.type,
					space.x,
					space.y,
					space.width,
					space.height
				)
		);

		// Initialize characters
		this.characters = initialState.characters.map(
			(char) => new Character(char.id, char.name, char.x, char.y, char.color)
		);

		// Set up event listeners
		document
			.getElementById("toggleMode")
			.addEventListener("click", () => this.toggleMode());
	}

	toggleMode() {
		this.isManaged = !this.isManaged;
		const button = document.getElementById("toggleMode");
		button.textContent = this.isManaged
			? "Switch to Chaotic Mode"
			: "Switch to Managed Mode";
		document.getElementById("modeDisplay").textContent = `Mode: ${
			this.isManaged ? "Managed" : "Chaotic"
		}`;
	}

	update() {
		const currentTime = Date.now();
		const currentHour = calculateSimulationTime(this.startTime, currentTime);

		// Reset simulation if a day has passed
		if (currentTime - this.startTime >= SIMULATION_CONFIG.DAY_DURATION) {
			this.startTime = currentTime;
			this.resetDay();
		}

		// Update all characters
		this.characters.forEach((character) => {
			character.update(this.spaces, this.isManaged);
		});

		// Update time display
		document.getElementById("timeDisplay").textContent = `Time: ${formatTime(
			currentHour
		)}`;
	}

	draw() {
		// Clear canvas
		this.ctx.fillStyle = COLORS.BACKGROUND;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw office layout
		this.drawOfficeLayout();

		// Draw spaces
		this.spaces.forEach((space) => space.draw(this.ctx));

		// Draw characters
		this.characters.forEach((character) => character.draw(this.ctx));
	}

	drawOfficeLayout() {
		// Draw walls
		this.ctx.fillStyle = COLORS.WALL;

		// Left wall
		this.ctx.fillRect(50, 50, 10, 400);

		// Right wall
		this.ctx.fillRect(740, 50, 10, 400);

		// Top wall
		this.ctx.fillRect(50, 50, 700, 10);

		// Bottom wall
		this.ctx.fillRect(50, 450, 700, 10);
	}

	resetDay() {
		// Reset all spaces to available
		this.spaces.forEach((space) => space.release());

		// Reset all characters to idle
		this.characters.forEach((character) => {
			character.state = CHARACTER_STATES.IDLE;
			character.targetSpace = null;
			character.frustrationLevel = 0;
		});
	}

	start() {
		const animate = () => {
			this.update();
			this.draw();
			this.animationFrameId = requestAnimationFrame(animate);
		};
		animate();
	}

	stop() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}
}

// Start the simulation when the page loads
window.addEventListener("load", () => {
	const simulation = new OfficeSimulation("officeCanvas");
	simulation.start();
});

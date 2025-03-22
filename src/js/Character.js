class Character {
	constructor(id, name, x, y, color) {
		this.id = id;
		this.name = name;
		this.x = x;
		this.y = y;
		this.color = color;
		this.state = CHARACTER_STATES.IDLE;
		this.targetSpace = null;
		this.frustrationLevel = 0;
	}

	update(spaces, isManaged) {
		switch (this.state) {
			case CHARACTER_STATES.IDLE:
				this._handleIdleState(spaces, isManaged);
				break;
			case CHARACTER_STATES.MOVING:
				this._handleMovingState();
				break;
			case CHARACTER_STATES.WORKING:
				this._handleWorkingState();
				break;
			case CHARACTER_STATES.FRUSTRATED:
				this._handleFrustratedState(spaces, isManaged);
				break;
		}
	}

	_handleIdleState(spaces, isManaged) {
		if (Math.random() < 0.02) {
			// 2% chance per frame to try booking
			const availableSpaces = spaces.filter(
				(space) =>
					space.state === "AVAILABLE" || (!isManaged && Math.random() < 0.3) // 30% chance to try booking occupied space in chaotic mode
			);

			if (availableSpaces.length > 0) {
				const targetSpace = randomChoice(availableSpaces);
				if (isManaged || targetSpace.state === "AVAILABLE") {
					this.targetSpace = targetSpace;
					targetSpace.state = "BOOKED";
					targetSpace.occupant = this.id;
					this.state = CHARACTER_STATES.MOVING;
					this.frustrationLevel = 0;
				} else {
					this.frustrationLevel++;
					if (this.frustrationLevel > 3) {
						this.state = CHARACTER_STATES.FRUSTRATED;
					}
				}
			}
		}
	}

	_handleMovingState() {
		if (!this.targetSpace) {
			this.state = CHARACTER_STATES.IDLE;
			return;
		}

		const movement = calculateMovement(
			this.x,
			this.y,
			this.targetSpace.x + this.targetSpace.width / 2,
			this.targetSpace.y + this.targetSpace.height / 2,
			SIMULATION_CONFIG.MOVEMENT_SPEED
		);

		this.x = movement.x;
		this.y = movement.y;

		if (movement.arrived) {
			this.state = CHARACTER_STATES.WORKING;
			this.targetSpace.state = "OCCUPIED";
		}
	}

	_handleWorkingState() {
		if (Math.random() < 0.005) {
			// 0.5% chance per frame to finish working
			if (this.targetSpace) {
				this.targetSpace.state = "AVAILABLE";
				this.targetSpace.occupant = null;
				this.targetSpace = null;
			}
			this.state = CHARACTER_STATES.IDLE;
		}
	}

	_handleFrustratedState(spaces, isManaged) {
		this.frustrationLevel--;
		if (this.frustrationLevel <= 0) {
			this.state = CHARACTER_STATES.IDLE;
		}
	}

	draw(ctx) {
		drawCharacter(
			ctx,
			this.x,
			this.y,
			SIMULATION_CONFIG.CHARACTER_RADIUS,
			this.color,
			this.name,
			this.state
		);
	}
}

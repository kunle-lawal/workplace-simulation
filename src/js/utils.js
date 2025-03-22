// Time utilities
function formatTime(hour) {
	const period = hour >= 12 ? "PM" : "AM";
	const displayHour = hour > 12 ? hour - 12 : hour;
	return `${displayHour}:00 ${period}`;
}

function calculateSimulationTime(startTime, currentTime) {
	const elapsed = currentTime - startTime;
	const dayProgress = elapsed / SIMULATION_CONFIG.DAY_DURATION;
	const workingHours =
		SIMULATION_CONFIG.END_HOUR - SIMULATION_CONFIG.START_HOUR;
	const currentHour = Math.floor(
		SIMULATION_CONFIG.START_HOUR + workingHours * dayProgress
	);
	return Math.min(
		Math.max(currentHour, SIMULATION_CONFIG.START_HOUR),
		SIMULATION_CONFIG.END_HOUR
	);
}

// Math utilities
function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function calculateMovement(fromX, fromY, toX, toY, speed) {
	const dx = toX - fromX;
	const dy = toY - fromY;
	const dist = Math.sqrt(dx * dx + dy * dy);

	if (dist < speed) {
		return { x: toX, y: toY, arrived: true };
	}

	const ratio = speed / dist;
	return {
		x: fromX + dx * ratio,
		y: fromY + dy * ratio,
		arrived: false,
	};
}

// Random utilities
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Collision detection
function isPointInRect(px, py, rx, ry, rw, rh) {
	return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// Drawing utilities
function drawCharacter(ctx, x, y, radius, color, name, state) {
	// Draw character circle
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fillStyle =
		state === CHARACTER_STATES.FRUSTRATED ? COLORS.FRUSTRATED : color;
	ctx.fill();
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 1;
	ctx.stroke();

	// Draw name label
	ctx.fillStyle = "#000000";
	ctx.font = "12px Arial";
	ctx.textAlign = "center";
	ctx.fillText(name, x, y + radius + 15);
}

function drawSpace(ctx, x, y, width, height, state, type) {
	ctx.fillStyle = COLORS[state];
	ctx.fillRect(x, y, width, height);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 1;
	ctx.strokeRect(x, y, width, height);

	// Add icon or label based on type
	ctx.fillStyle = "#000000";
	ctx.font = "12px Arial";
	ctx.textAlign = "center";
	ctx.fillText(
		type === SPACE_TYPES.DESK ? "Desk" : "Meeting",
		x + width / 2,
		y + height / 2
	);
}

// State management utilities
function createInitialState() {
	return {
		spaces: [
			...OFFICE_LAYOUT.desks.map((pos, index) => ({
				id: `desk_${index}`,
				type: SPACE_TYPES.DESK,
				x: pos.x,
				y: pos.y,
				width: SIMULATION_CONFIG.DESK_WIDTH,
				height: SIMULATION_CONFIG.DESK_HEIGHT,
				state: "AVAILABLE",
				occupant: null,
			})),
			...OFFICE_LAYOUT.meetingRooms.map((pos, index) => ({
				id: `meeting_${index}`,
				type: SPACE_TYPES.MEETING_ROOM,
				x: pos.x,
				y: pos.y,
				width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH,
				height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT,
				state: "AVAILABLE",
				occupant: null,
			})),
		],
		characters: CHARACTERS.map((char, index) => ({
			...char,
			id: `char_${index}`,
			x: 50 + index * 30,
			y: 500,
			state: CHARACTER_STATES.IDLE,
			targetSpace: null,
		})),
	};
}

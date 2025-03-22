const SIMULATION_CONFIG = {
	DAY_DURATION: 60000, // 60 seconds per day
	START_HOUR: 9,
	END_HOUR: 17,
	CANVAS_WIDTH: 800,
	CANVAS_HEIGHT: 600,
	DESK_WIDTH: 40,
	DESK_HEIGHT: 30,
	MEETING_ROOM_WIDTH: 80,
	MEETING_ROOM_HEIGHT: 60,
	CHARACTER_RADIUS: 10,
	MOVEMENT_SPEED: 2,
};

const COLORS = {
	AVAILABLE: "#4CAF50",
	BOOKED: "#f44336",
	OCCUPIED: "#2196F3",
	CHARACTER: "#333333",
	FRUSTRATED: "#FF9800",
	BACKGROUND: "#ffffff",
	WALL: "#cccccc",
};

const SPACE_TYPES = {
	DESK: "desk",
	MEETING_ROOM: "meeting_room",
};

const CHARACTER_STATES = {
	IDLE: "idle",
	MOVING: "moving",
	WORKING: "working",
	FRUSTRATED: "frustrated",
};

const OFFICE_LAYOUT = {
	desks: [
		// Left side desks
		{ x: 100, y: 100 },
		{ x: 100, y: 150 },
		{ x: 100, y: 200 },
		{ x: 100, y: 250 },
		// Right side desks
		{ x: 650, y: 100 },
		{ x: 650, y: 150 },
		{ x: 650, y: 200 },
		{ x: 650, y: 250 },
	],
	meetingRooms: [
		{ x: 250, y: 150 },
		{ x: 400, y: 150 },
		{ x: 250, y: 300 },
		{ x: 400, y: 300 },
	],
};

const CHARACTERS = [
	{ name: "Alice", color: "#FF5733" },
	{ name: "Bob", color: "#33FF57" },
	{ name: "Charlie", color: "#3357FF" },
	{ name: "Diana", color: "#FF33F5" },
	{ name: "Eric", color: "#33FFF5" },
	{ name: "Fiona", color: "#F5FF33" },
];

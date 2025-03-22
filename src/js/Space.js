class Space {
	constructor(id, type, x, y, width, height) {
		this.id = id;
		this.type = type;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.state = "AVAILABLE";
		this.occupant = null;
		this.bookingHistory = [];
	}

	book(characterId, isManaged) {
		if (isManaged && this.state !== "AVAILABLE") {
			return false;
		}

		this.state = "BOOKED";
		this.occupant = characterId;
		this.bookingHistory.push({
			characterId,
			timestamp: Date.now(),
			success: true,
		});
		return true;
	}

	release() {
		this.state = "AVAILABLE";
		this.occupant = null;
	}

	occupy(characterId) {
		if (this.occupant === characterId) {
			this.state = "OCCUPIED";
			return true;
		}
		return false;
	}

	draw(ctx) {
		drawSpace(
			ctx,
			this.x,
			this.y,
			this.width,
			this.height,
			this.state,
			this.type
		);
	}

	isPointInside(x, y) {
		return isPointInRect(x, y, this.x, this.y, this.width, this.height);
	}

	getBookingStats() {
		return {
			totalBookings: this.bookingHistory.length,
			successfulBookings: this.bookingHistory.filter((b) => b.success).length,
			lastBooked:
				this.bookingHistory.length > 0
					? this.bookingHistory[this.bookingHistory.length - 1].timestamp
					: null,
		};
	}
}

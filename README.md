# Office Simulation

An interactive office simulation that visually demonstrates workplace dynamics with and without management software. This sandbox-style simulation allows you to see the difference between a chaotic office environment and a well-managed one.

## Features

- Visual representation of an office with desks, meeting spaces, and workers
- Toggle between "Chaotic" and "Managed" modes to see the difference
- Workers have mental states (happy, frustrated, confused) that change based on the office environment
- Workers move randomly around the office
- 60-second simulation cycle representing an 8-hour workday (8 AM to 5 PM)
- Office resets for a new day after each cycle

## Technology Stack

- HTML Canvas for rendering
- JavaScript for simulation logic
- CSS for styling

## How to Run

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Watch the simulation run automatically
4. Click the toggle button to switch between Chaotic and Managed modes

## Understanding the Simulation

### Chaotic Mode
In this mode, workers don't have assigned desks and are more likely to be frustrated or confused. This represents an office without proper workplace management software.

### Managed Mode
In this mode, workers have assigned desks and are more likely to be happy. This represents an office with proper workplace management software that helps coordinate resources.

## UI Elements

- Colored circles: Office workers
- Blue rectangles: Assigned desks
- Green rectangles: Available desks
- Red rectangles: Occupied desks
- Circles at the bottom: Meeting spaces
- Emojis: Worker mental states (😊 happy, 😠 frustrated, 😕 confused)
- Top progress bar: Time of day (from 8 AM to 5 PM)

## Customization

You can modify the following variables in the code to customize the simulation:

- Number of workers
- Number of desks
- Number of meeting spaces
- Worker movement speed
- Simulation speed

## Future Enhancements

- Add worker interactions
- Implement more sophisticated booking systems
- Add statistics dashboard
- Add more realistic worker behaviors 

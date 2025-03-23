import { Simulation } from './simulation';
import { SimulationMode, Worker, WorkerMentalState, WorkerPhysicalState, DeskState, SpaceState } from './types';

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('office-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Initialize the simulation
    const simulation = new Simulation('office-canvas');
    
    // Start the simulation
    simulation.start();
    
    // Set up toggle button
    const toggleButton = document.getElementById('toggle-mode');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            simulation.toggleMode();
            
            // Update button text
            const buttonText = simulation.getMode() === SimulationMode.MANAGED ?
                'Mode: Managed (With Management Solution)' :
                'Mode: Chaotic (No Management)';
            
            toggleButton.textContent = buttonText;
        });
    }

    // Set up sidebar functionality
    setupSidebar(simulation);
    
    // Set up simulation info with a more reasonable update interval (1 second)
    setInterval(() => updateSimulationInfo(simulation), 1000);
});

// Set up sidebar functionality
function setupSidebar(simulation: Simulation): void {
    if (!simulation) {
        console.error('Simulation not found');
        return;
    }

    // Add selected worker property to simulation
    (simulation as any).selectedWorkerId = null;
    (simulation as any).lastUpdateTime = 0;

    // Add highlight worker property to simulation renderer
    (simulation as any).canvasRenderer.highlightedWorkerId = null;
    (simulation as any).highlightModeEnabled = false;

    // Add worker list
    populateWorkerList(simulation);
    
    // Set up navigation buttons
    document.getElementById('prev-worker')?.addEventListener('click', () => selectPreviousWorker(simulation));
    document.getElementById('next-worker')?.addEventListener('click', () => selectNextWorker(simulation));
    
    // Set up tabs
    setupWorkerTabs();
    
    // Set up highlight button
    const highlightButton = document.getElementById('highlight-worker');
    if (highlightButton) {
        highlightButton.addEventListener('click', () => {
            (simulation as any).highlightModeEnabled = !(simulation as any).highlightModeEnabled;
            
            if ((simulation as any).highlightModeEnabled) {
                // Enable highlight for the selected worker
                (simulation as any).canvasRenderer.highlightedWorkerId = (simulation as any).selectedWorkerId;
                highlightButton.classList.add('active');
            } else {
                // Disable highlighting
                (simulation as any).canvasRenderer.highlightedWorkerId = null;
                highlightButton.classList.remove('active');
            }
        });
    }

    // Initialize selection
    if ((simulation as any).workerManager.workers.length > 0) {
        selectWorker(simulation, (simulation as any).workerManager.workers[0].id);
    }

    // Update worker info less frequently (every 1 second instead of 500ms)
    setInterval(() => updateSelectedWorkerInfo(simulation), 1000);

    // Override worker rendering to handle highlighting
    const originalRenderWorker = (simulation as any).canvasRenderer.renderWorker;
    (simulation as any).canvasRenderer.renderWorker = function(worker: Worker): void {
        const { id, location, name, mentalState } = worker;
        const { x, y } = location;
        
        // Get worker color or use default
        const color = this.workerColors.get(id) || '#000000';
        
        // Check if this worker is highlighted
        const isHighlighted = this.highlightedWorkerId === id;
        
        // Draw worker as a colored circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, isHighlighted ? 14 : 10, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw worker outline - thicker if highlighted
        this.ctx.strokeStyle = isHighlighted ? '#FF9800' : '#333333';
        this.ctx.lineWidth = isHighlighted ? 3 : 1;
        this.ctx.stroke();
        
        // Draw worker name
        this.ctx.fillStyle = '#000000';
        this.ctx.font = isHighlighted ? 'bold 12px Arial' : '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(name, x, y - 15);
        
        // Draw worker's mental state as an emoji
        let emoji = '';
        switch (mentalState) {
            case WorkerMentalState.HAPPY:
                emoji = '😊';
                break;
            case WorkerMentalState.FRUSTRATED:
                emoji = '😠';
                break;
            case WorkerMentalState.CONFUSED:
                emoji = '😕';
                break;
        }
        
        this.ctx.font = '12px Arial';
        this.ctx.fillText(emoji, x, y + 20);
        
        // If worker has a destination, draw a line to it
        if (worker.destinationLocation) {
            const { x: destX, y: destY } = worker.destinationLocation;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(destX, destY);
            this.ctx.strokeStyle = isHighlighted ? 'rgba(255, 152, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = isHighlighted ? 2 : 1;
            this.ctx.stroke();
            
            // Draw a small circle at the destination
            this.ctx.beginPath();
            this.ctx.arc(destX, destY, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        
        // Draw highlight circle if worker is highlighted
        if (isHighlighted) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, 25, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 152, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    };
}

function setupWorkerTabs(): void {
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('.worker-tab');
    
    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            document.querySelectorAll('.worker-tab').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.worker-tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get tab to show
            const tabId = button.getAttribute('data-tab');
            
            // Show tab content
            if (tabId) {
                const tabContent = document.getElementById(`tab-${tabId}`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            }
        });
    });
}

function populateWorkerList(simulation: Simulation): void {
    const workerListElement = document.getElementById('worker-list');
    if (!workerListElement) return;
    
    workerListElement.innerHTML = '';

    (simulation as any).workerManager.workers.forEach((worker: Worker) => {
        const workerColor = (simulation as any).canvasRenderer.workerColors.get(worker.id) || '#000000';
        
        const listItem = document.createElement('div');
        listItem.className = 'worker-list-item';
        listItem.dataset.id = worker.id;
        listItem.innerHTML = `
            <span class="worker-color-dot" style="background-color: ${workerColor}"></span>
            ${worker.name}
        `;
        
        listItem.addEventListener('click', () => {
            selectWorker(simulation, worker.id);
        });
        
        workerListElement.appendChild(listItem);
    });
}

function selectWorker(simulation: Simulation, workerId: string): void {
    (simulation as any).selectedWorkerId = workerId;
    
    // If highlight mode is enabled, update the highlighted worker
    if ((simulation as any).highlightModeEnabled) {
        (simulation as any).canvasRenderer.highlightedWorkerId = workerId;
    }
    
    // Update UI
    updateWorkerSelection(workerId);
    
    const worker = getWorkerById(simulation, workerId);
    if (worker) {
        updateWorkerInfo(simulation, worker);
    }
}

function getWorkerById(simulation: Simulation, workerId: string): Worker | undefined {
    return (simulation as any).workerManager.workers.find((w: Worker) => w.id === workerId);
}

function updateWorkerSelection(workerId: string): void {
    // Remove active class from all items
    document.querySelectorAll('.worker-list-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected item
    const selectedItem = document.querySelector(`.worker-list-item[data-id="${workerId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
}

function updateWorkerInfo(simulation: Simulation, worker: Worker | undefined): void {
    const noSelectionMessage = document.getElementById('no-selection-message');
    const workerDetails = document.getElementById('worker-details');
    
    if (!noSelectionMessage || !workerDetails) return;
    
    if (!worker) {
        noSelectionMessage.style.display = 'block';
        workerDetails.style.display = 'none';
        return;
    }
    
    noSelectionMessage.style.display = 'none';
    workerDetails.style.display = 'block';
    
    // Get worker color
    const workerColor = (simulation as any).canvasRenderer.workerColors.get(worker.id) || '#000000';
    
    // Update worker color dot
    const colorDot = document.getElementById('worker-color-dot');
    if (colorDot) {
        colorDot.style.backgroundColor = workerColor;
    }
    
    // Update worker name
    const nameElement = document.getElementById('worker-name-text');
    if (nameElement) {
        nameElement.textContent = worker.name;
    }
    
    // Basic info tab
    updateBasicWorkerInfo(worker);
    
    // Desk info tab
    updateDeskWorkerInfo(worker);
    
    // Space info tab
    updateSpaceWorkerInfo(worker);
    
    // Events info tab
    updateEventsWorkerInfo(worker);
}

function updateBasicWorkerInfo(worker: Worker): void {
    // Update worker ID
    const idElement = document.getElementById('worker-id');
    if (idElement) {
        idElement.textContent = worker.id;
    }
    
    // Update worker position
    const positionElement = document.getElementById('worker-position');
    if (positionElement) {
        positionElement.textContent = `(${Math.round(worker.location.x)}, ${Math.round(worker.location.y)})`;
    }
    
    // Update mental state
    const mentalStateElement = document.getElementById('worker-mental-state');
    if (mentalStateElement) {
        let mentalStateText = 'Unknown';
        let mentalStateEmoji = '';
        
        if (worker.mentalState === WorkerMentalState.FRUSTRATED) {
            mentalStateText = 'Frustrated';
            mentalStateEmoji = '😠';
        } else if (worker.mentalState === WorkerMentalState.HAPPY) {
            mentalStateText = 'Happy';
            mentalStateEmoji = '😊';
        } else if (worker.mentalState === WorkerMentalState.CONFUSED) {
            mentalStateText = 'Confused';
            mentalStateEmoji = '😕';
        }
        
        mentalStateElement.textContent = `${mentalStateText} ${mentalStateEmoji}`;
    }
    
    // Update physical state
    const physicalStateElement = document.getElementById('worker-physical-state');
    if (physicalStateElement) {
        let physicalStateText = 'Unknown';
        
        if (worker.physicalState === WorkerPhysicalState.WANDERING) {
            physicalStateText = 'Wandering';
        } else if (worker.physicalState === WorkerPhysicalState.MOVING_TO_SPACE) {
            physicalStateText = 'Moving to Space';
        } else if (worker.physicalState === WorkerPhysicalState.WORKING) {
            physicalStateText = 'Working';
        }
        
        physicalStateElement.textContent = physicalStateText;
    }
    
    // Update activity
    const activityElement = document.getElementById('worker-activity');
    if (activityElement) {
        activityElement.textContent = worker.destinationLocation ? 'Moving' : 'Idle';
    }
}

function updateDeskWorkerInfo(worker: Worker): void {
    // Update has desk
    const deskElement = document.getElementById('worker-has-desk');
    if (deskElement) {
        deskElement.textContent = worker.assignedDesk ? 'Yes' : 'No';
    }
    
    // Update assigned desk ID
    const assignedDeskIdElement = document.getElementById('worker-assigned-desk-id');
    if (assignedDeskIdElement) {
        assignedDeskIdElement.textContent = worker.assignedDesk ? worker.assignedDesk.id : 'None';
    }
    
    // Update last occupied desk
    const lastDeskElement = document.getElementById('worker-last-desk');
    if (lastDeskElement) {
        lastDeskElement.textContent = worker.occupiedDesk.lastOccupiedDesk 
            ? worker.occupiedDesk.lastOccupiedDesk.deskId 
            : 'None';
    }
    
    // Update last occupied desk time
    const lastDeskTimeElement = document.getElementById('worker-last-desk-time');
    if (lastDeskTimeElement) {
        lastDeskTimeElement.textContent = worker.occupiedDesk.lastOccupiedDesk 
            ? formatSimulationTime(worker.occupiedDesk.lastOccupiedDesk.time)
            : 'N/A';
    }
    
    // Update current occupied desk
    const currentDeskElement = document.getElementById('worker-current-desk');
    if (currentDeskElement) {
        currentDeskElement.textContent = worker.occupiedDesk.currentOccupiedDesk 
            ? worker.occupiedDesk.currentOccupiedDesk.deskId 
            : 'None';
    }
    
    // Update current occupied desk time
    const currentDeskTimeElement = document.getElementById('worker-current-desk-time');
    if (currentDeskTimeElement) {
        currentDeskTimeElement.textContent = worker.occupiedDesk.currentOccupiedDesk 
            ? formatSimulationTime(worker.occupiedDesk.currentOccupiedDesk.time)
            : 'N/A';
    }
}

function updateSpaceWorkerInfo(worker: Worker): void {
    // Update last occupied space
    const lastSpaceElement = document.getElementById('worker-last-space');
    if (lastSpaceElement) {
        lastSpaceElement.textContent = worker.occupiedSpace.lastOccupiedSpace 
            ? worker.occupiedSpace.lastOccupiedSpace.spaceId 
            : 'None';
    }
    
    // Update last occupied space time
    const lastSpaceTimeElement = document.getElementById('worker-last-space-time');
    if (lastSpaceTimeElement) {
        lastSpaceTimeElement.textContent = worker.occupiedSpace.lastOccupiedSpace 
            ? formatSimulationTime(worker.occupiedSpace.lastOccupiedSpace.time)
            : 'N/A';
    }
    
    // Update current occupied space
    const currentSpaceElement = document.getElementById('worker-current-space');
    if (currentSpaceElement) {
        currentSpaceElement.textContent = worker.occupiedSpace.currentOccupiedSpace 
            ? worker.occupiedSpace.currentOccupiedSpace.spaceId 
            : 'None';
    }
    
    // Update current occupied space time
    const currentSpaceTimeElement = document.getElementById('worker-current-space-time');
    if (currentSpaceTimeElement) {
        currentSpaceTimeElement.textContent = worker.occupiedSpace.currentOccupiedSpace 
            ? formatSimulationTime(worker.occupiedSpace.currentOccupiedSpace.time)
            : 'N/A';
    }
}

function updateEventsWorkerInfo(worker: Worker): void {
    const eventsContainer = document.getElementById('worker-events-container');
    const noEventsMessage = document.getElementById('worker-no-events');
    
    if (!eventsContainer || !noEventsMessage) return;
    
    // Clear previous events - but only the ones that aren't the no-events message
    const childrenToRemove = [];
    for (let i = 0; i < eventsContainer.children.length; i++) {
        const child = eventsContainer.children[i];
        if (child !== noEventsMessage) {
            childrenToRemove.push(child);
        }
    }
    
    // Remove elements in a separate loop to avoid live collection issues
    childrenToRemove.forEach(child => {
        eventsContainer.removeChild(child);
    });
    
    // Show or hide no events message
    if (!worker.events || worker.events.length === 0) {
        noEventsMessage.style.display = 'block';
        return;
    }
    
    noEventsMessage.style.display = 'none';
    
    // Add each event
    worker.events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        
        const startTime = formatSimulationTime(event.timeFrame.startTime);
        const endTime = formatSimulationTime(event.timeFrame.endTime);
        
        eventElement.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">Time: ${startTime} - ${endTime}</div>
            <div class="event-space">Space: ${event.spaceForEvent 
                ? `(${Math.round(event.spaceForEvent.x)}, ${Math.round(event.spaceForEvent.y)})`
                : 'Unknown'}</div>
        `;
        
        eventsContainer.appendChild(eventElement);
    });
}

function updateSelectedWorkerInfo(simulation: Simulation): void {
    if (!simulation) return;
    
    // Throttle updates to avoid excessive DOM operations
    const now = Date.now();
    if (now - (simulation as any).lastUpdateTime < 500) {
        return; // Skip this update if less than 500ms since last update
    }
    (simulation as any).lastUpdateTime = now;
    
    if ((simulation as any).selectedWorkerId) {
        const worker = getWorkerById(simulation, (simulation as any).selectedWorkerId);
        if (worker) {
            updateWorkerInfo(simulation, worker);
        }
    }
}

function selectNextWorker(simulation: Simulation): void {
    const workers = (simulation as any).workerManager.workers;
    
    if (!workers.length) return;
    
    const currentIndex = workers.findIndex((w: Worker) => w.id === (simulation as any).selectedWorkerId);
    const nextIndex = (currentIndex + 1) % workers.length;
    
    selectWorker(simulation, workers[nextIndex].id);
}

function selectPreviousWorker(simulation: Simulation): void {
    const workers = (simulation as any).workerManager.workers;
    
    if (!workers.length) return;
    
    const currentIndex = workers.findIndex((w: Worker) => w.id === (simulation as any).selectedWorkerId);
    const prevIndex = (currentIndex - 1 + workers.length) % workers.length;
    
    selectWorker(simulation, workers[prevIndex].id);
}

function updateSimulationInfo(simulation: Simulation): void {
    if (!simulation) return;
    
    // Get simulation time
    const simulationTime = (simulation as any).simulationTime;
    const totalTime = (simulation as any).totalSimulationTime;
    const timePercentage = (simulationTime / totalTime) * 100;
    
    // Convert percentage to simulated hour (8 AM to 5 PM)
    const hour = Math.floor((timePercentage / 100) * 9) + 8;
    const minute = Math.floor(((timePercentage / 100) * 9 % 1) * 60);
    
    // Format the time
    const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
    
    // Update time
    const timeElement = document.getElementById('sim-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
    
    // Update day
    const dayElement = document.getElementById('sim-day');
    if (dayElement) {
        dayElement.textContent = (simulation as any).dayCount.toString();
    }
    
    // Update total workers
    const totalWorkersElement = document.getElementById('sim-total-workers');
    if (totalWorkersElement) {
        totalWorkersElement.textContent = (simulation as any).workerManager.getWorkers().length.toString();
    }
    
    // Update mode
    const modeElement = document.getElementById('sim-mode');
    if (modeElement) {
        modeElement.textContent = (simulation as any).simulationMode === SimulationMode.MANAGED 
            ? 'Managed (With Management Solution)' 
            : 'Chaotic (No Management)';
    }
    
    // Update desk information
    updateDeskInfo(simulation);
    
    // Update space information
    updateSpaceInfo(simulation);
}

function updateDeskInfo(simulation: Simulation): void {
    const desks = (simulation as any).workerManager.getDesks();
    if (!desks || !desks.length) return;
    
    // Total desks
    const totalDesksElement = document.getElementById('sim-total-desks');
    if (totalDesksElement) {
        totalDesksElement.textContent = desks.length.toString();
    }
    
    // Available desks
    const availableDesks = desks.filter((desk: any) => desk.state === DeskState.AVAILABLE);
    const availableDesksElement = document.getElementById('sim-available-desks');
    if (availableDesksElement) {
        availableDesksElement.textContent = availableDesks.length.toString();
    }
    
    // Assigned desks
    const assignedDesks = desks.filter((desk: any) => desk.state === DeskState.ASSIGNED);
    const assignedDesksElement = document.getElementById('sim-assigned-desks');
    if (assignedDesksElement) {
        assignedDesksElement.textContent = assignedDesks.length.toString();
    }
    
    // Occupied desks
    const occupiedDesks = desks.filter((desk: any) => desk.state === DeskState.OCCUPIED);
    const occupiedDesksElement = document.getElementById('sim-occupied-desks');
    if (occupiedDesksElement) {
        occupiedDesksElement.textContent = occupiedDesks.length.toString();
    }
}

function updateSpaceInfo(simulation: Simulation): void {
    const spaces = (simulation as any).workerManager.getSpaces();
    if (!spaces || !spaces.length) return;
    
    // Total spaces
    const totalSpacesElement = document.getElementById('sim-total-spaces');
    if (totalSpacesElement) {
        totalSpacesElement.textContent = spaces.length.toString();
    }
    
    // Available spaces
    const availableSpaces = spaces.filter((space: any) => space.state === SpaceState.AVAILABLE);
    const availableSpacesElement = document.getElementById('sim-available-spaces');
    if (availableSpacesElement) {
        availableSpacesElement.textContent = availableSpaces.length.toString();
    }
    
    // Assigned spaces
    const assignedSpaces = spaces.filter((space: any) => space.state === SpaceState.ASSIGNED);
    const assignedSpacesElement = document.getElementById('sim-assigned-spaces');
    if (assignedSpacesElement) {
        assignedSpacesElement.textContent = assignedSpaces.length.toString();
    }
    
    // Occupied spaces
    const occupiedSpaces = spaces.filter((space: any) => space.state === SpaceState.OCCUPIED);
    const occupiedSpacesElement = document.getElementById('sim-occupied-spaces');
    if (occupiedSpacesElement) {
        occupiedSpacesElement.textContent = occupiedSpaces.length.toString();
    }
}

function formatSimulationTime(time: number): string {
    if (time === undefined || time === null) return 'N/A';
    
    // Convert to hours and minutes (8 AM to 5 PM)
    const totalTime = 60 * 1000; // Total simulation time (60 seconds)
    const timePercentage = (time / totalTime) * 100;
    
    // Convert percentage to simulated hour (8 AM to 5 PM)
    const hour = Math.floor((timePercentage / 100) * 9) + 8;
    const minute = Math.floor(((timePercentage / 100) * 9 % 1) * 60);
    
    // Format the time
    return `${hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
} 
import { Simulation } from './simulation';
import { SimulationMode, Worker, WorkerMentalState, WorkerPhysicalState, DeskState, SpaceState, WorkerEvent } from './types';

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
    (simulation as any).followModeEnabled = false;

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
    setInterval(() => {
        // Only update the info if we have a selected worker
        if ((simulation as any).selectedWorkerId) {
            updateSelectedWorkerInfo(simulation);
            
            // Update camera position if follow mode is enabled
            // if ((simulation as any).followModeEnabled) {
            //     const worker = getWorkerById(simulation, (simulation as any).selectedWorkerId);
            //     if (worker) {
            //         const canvasRenderer = (simulation as any).canvasRenderer;
            //         const canvasWidth = canvasRenderer.getWidth();
            //         const canvasHeight = canvasRenderer.getHeight();
                    
            //         // Calculate the center position for the worker
            //         const targetX = canvasWidth / 2 - worker.location.x;
            //         const targetY = canvasHeight / 2 - worker.location.y;
                    
            //         // Smoothly animate to the new position
            //         animateToPosition(canvasRenderer, targetX, targetY, canvasRenderer.zoomLevel);
            //     }
            // }
        }
        // Update worker list while maintaining selection
        const currentSelection = (simulation as any).selectedWorkerId;
        populateWorkerList(simulation);
        if (currentSelection) {
            selectWorker(simulation, currentSelection);
        }
    }, 1000);

    // Override worker rendering to handle highlighting
    const originalRenderWorker = (simulation as any).canvasRenderer.renderWorker;
    (simulation as any).canvasRenderer.renderWorker = function(worker: Worker): void {
        const { id, location, name, mentalState, dialog } = worker;
        // if(['David', 'Olivia', 'Uma'].includes(name)) {
        //     console.log(dialog);
        // }
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
        // this.ctx.strokeStyle = isHighlighted ? '#FF9800' : '#333333';
        // this.ctx.lineWidth = isHighlighted ? 3 : 1;
        // this.ctx.stroke();
        
        // Draw worker name
        this.ctx.fillStyle = '#000000';
        this.ctx.font = isHighlighted ? 'bold 12px Arial' : '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(name, x, y - 15);

        if (worker.dialog) {
            // console.log(worker.dialog);
            // Draw dialog background
            this.ctx.fillStyle = "red";
            this.ctx.font = "12px Arial";
            const textWidth = this.ctx.measureText(worker.dialog.text).width;
            const padding = 10;
            const dialogWidth = textWidth + padding * 2;
            const dialogHeight = 30;
            
            // Draw rounded rectangle background
            this.ctx.beginPath();
            this.ctx.roundRect(
                worker.location.x - dialogWidth / 2,
                worker.location.y - 40,
                dialogWidth,
                dialogHeight,
                5
            );
            this.ctx.fill();
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw dialog text
            this.ctx.fillStyle = "white";
            this.ctx.fillText(worker.dialog.text, worker.location.x, worker.location.y - 20);
        }
        
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
    
    // Store current selection
    const currentSelection = (simulation as any).selectedWorkerId;
    
    // Clear the list
    workerListElement.innerHTML = '';

    // Add workers to the list
    (simulation as any).workerManager.workers.forEach((worker: Worker) => {
        const workerColor = (simulation as any).canvasRenderer.workerColors.get(worker.id) || '#000000';
        
        const listItem = document.createElement('div');
        listItem.className = 'worker-list-item';
        listItem.setAttribute('data-worker-id', worker.id);
        
        // Set initial selected state
        if (worker.id === currentSelection) {
            listItem.classList.add('selected');
            listItem.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            listItem.style.border = '2px solid #4CAF50';
        }
        
        // Add color dot
        const colorDot = document.createElement('span');
        colorDot.className = 'worker-color-dot';
        colorDot.style.backgroundColor = workerColor;
        listItem.appendChild(colorDot);
        
        // Add worker name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'worker-name';
        nameSpan.textContent = worker.name;
        listItem.appendChild(nameSpan);
        
        // Add follow mode toggle button
        // const followButton = document.createElement('button');
        // followButton.className = 'follow-button';
        // followButton.innerHTML = '👁️';
        // followButton.title = 'Toggle Follow Mode';
        
        // Set initial follow mode state
        // if (worker.id === currentSelection && (simulation as any).followModeEnabled) {
        //     followButton.classList.add('active');
        // }
        
        // Add click handler for follow mode
        // followButton.addEventListener('click', (e) => {
        //     e.stopPropagation(); // Prevent worker selection when clicking the button
            
        //     if (worker.id === currentSelection) {
        //         (simulation as any).followModeEnabled = !(simulation as any).followModeEnabled;
        //         followButton.classList.toggle('active');
        //     } else {
        //         // If clicking follow button for a different worker, select that worker and enable follow mode
        //         selectWorker(simulation, worker.id);
        //         (simulation as any).followModeEnabled = true;
        //         followButton.classList.add('active');
        //     }
        // });
        
        // listItem.appendChild(followButton);
        
        // Add click handler for selection
        listItem.addEventListener('click', () => {
            // Toggle selection
            const isSelected = listItem.classList.contains('selected');
            if (isSelected) {
                // Deselect this worker
                listItem.classList.remove('selected');
                listItem.style.backgroundColor = '';
                listItem.style.border = '';
                selectWorker(simulation, null);
            } else {
                // Deselect all other workers and select this one
                document.querySelectorAll('.worker-list-item').forEach((item: Element) => {
                    item.classList.remove('selected');
                    (item as HTMLElement).style.backgroundColor = '';
                    (item as HTMLElement).style.border = '';
                });
                listItem.classList.add('selected');
                listItem.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                listItem.style.border = '2px solid #4CAF50';
                selectWorker(simulation, worker.id);
            }
        });
        
        workerListElement.appendChild(listItem);
    });
}

function selectWorker(simulation: Simulation, workerId: string | null): void {
    // Update the selected worker ID
    (simulation as any).selectedWorkerId = workerId;
    
    // Update the UI to reflect the selection
    updateWorkerSelection(simulation, workerId);
    
    // Update highlight mode if enabled
    if ((simulation as any).highlightModeEnabled) {
        (simulation as any).canvasRenderer.highlightedWorkerId = workerId;
    }

    // If a worker is selected, pan and zoom to their location (only if follow mode is disabled)
    // if (workerId && !(simulation as any).followModeEnabled) {
    //     const worker = getWorkerById(simulation, workerId);
    //     if (worker) {
    //         const canvasRenderer = (simulation as any).canvasRenderer;
    //         const canvasWidth = canvasRenderer.getWidth();
    //         const canvasHeight = canvasRenderer.getHeight();
            
    //         // Calculate the center position for the worker
    //         const targetX = canvasWidth / 2 - worker.location.x;
    //         const targetY = canvasHeight / 2 - worker.location.y;
            
    //         // Set a zoom level that makes the worker clearly visible
    //         const targetZoom = 1.2;
            
    //         // Smoothly animate to the new position and zoom
    //         animateToPosition(canvasRenderer, targetX, targetY, targetZoom);
    //     }
    // }
}

/**
 * Animate the canvas to a new position and zoom level
 */
function animateToPosition(canvasRenderer: any, targetX: number, targetY: number, targetZoom: number): void {
    const startX = canvasRenderer.panX;
    const startY = canvasRenderer.panY;
    const startZoom = canvasRenderer.zoomLevel;
    
    const duration = 1000; // 1 second animation
    const startTime = performance.now();
    
    function animate(currentTime: number): void {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeProgress = easeInOutCubic(progress);
        
        // Interpolate position and zoom
        canvasRenderer.panX = startX + (targetX - startX) * easeProgress;
        canvasRenderer.panY = startY + (targetY - startY) * easeProgress;
        canvasRenderer.zoomLevel = startZoom + (targetZoom - startZoom) * easeProgress;
        
        // Request next frame if animation isn't complete
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

/**
 * Easing function for smooth animation
 */
function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getWorkerById(simulation: Simulation, workerId: string): Worker | undefined {
    return (simulation as any).workerManager.workers.find((w: Worker) => w.id === workerId);
}

function updateWorkerSelection(simulation: Simulation, workerId: string | null): void {
    // Update worker list items
    document.querySelectorAll('.worker-list-item').forEach((item: Element) => {
        const itemWorkerId = item.getAttribute('data-worker-id');
        if (itemWorkerId === workerId) {
            item.classList.add('selected');
            (item as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            (item as HTMLElement).style.border = '2px solid #4CAF50';
        } else {
            item.classList.remove('selected');
            (item as HTMLElement).style.backgroundColor = '';
            (item as HTMLElement).style.border = '';
        }
    });
    
    // Update worker info section
    const noSelectionMessage = document.getElementById('no-selection-message');
    const workerDetails = document.getElementById('worker-details');
    
    if (workerId === null) {
        if (noSelectionMessage) noSelectionMessage.style.display = 'block';
        if (workerDetails) workerDetails.style.display = 'none';
    } else {
        if (noSelectionMessage) noSelectionMessage.style.display = 'none';
        if (workerDetails) workerDetails.style.display = 'block';
        
        // Update the worker info immediately
        const worker = getWorkerById(simulation, workerId);
        if (worker) {
            updateWorkerInfo(simulation, worker);
        }
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
    updateDeskWorkerInfo(simulation, worker);
    
    // Space info tab
    updateSpaceWorkerInfo(simulation, worker);
    
    // Events info tab
    updateEventsWorkerInfo(simulation, worker);
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

function updateDeskWorkerInfo(simulation: Simulation, worker: Worker): void {
    const desksMap = (simulation as any).workerManager.desksMap;

    // Update has desk
    const deskElement = document.getElementById('worker-has-desk');
    if (deskElement) {
        deskElement.textContent = worker.assignedDeskId ? 'Yes' : 'No';
    }
    
    // Update assigned desk ID
    const assignedDeskIdElement = document.getElementById('worker-assigned-desk-id');
    if (assignedDeskIdElement) {
        assignedDeskIdElement.textContent = worker.assignedDeskId || 'None';
    }
    
    // Update last occupied desk
    const lastDeskElement = document.getElementById('worker-last-desk');
    if (lastDeskElement) {
        lastDeskElement.textContent = worker.occupiedDesk.lastOccupiedDeskId || 'None';
    }
    
    // Update last occupied desk time
    const lastDeskTimeElement = document.getElementById('worker-last-desk-time');
    if (lastDeskTimeElement) {
        lastDeskTimeElement.textContent = worker.occupiedDesk.lastOccupiedTime 
            ? formatSimulationTime(worker.occupiedDesk.lastOccupiedTime)
            : 'N/A';
    }
    
    // Update current occupied desk
    const currentDeskElement = document.getElementById('worker-current-desk');
    if (currentDeskElement) {
        currentDeskElement.textContent = worker.occupiedDesk.currentOccupiedDeskId || 'None';
    }
    
    // Update current occupied desk time
    const currentDeskTimeElement = document.getElementById('worker-current-desk-time');
    if (currentDeskTimeElement) {
        currentDeskTimeElement.textContent = worker.occupiedDesk.currentOccupiedTime 
            ? formatSimulationTime(worker.occupiedDesk.currentOccupiedTime)
            : 'N/A';
    }
}

function updateSpaceWorkerInfo(simulation: Simulation, worker: Worker): void {
    const spacesMap = (simulation as any).workerManager.spacesMap;

    // Update last occupied space
    const lastSpaceElement = document.getElementById('worker-last-space');
    if (lastSpaceElement) {
        lastSpaceElement.textContent = worker.occupiedSpace.lastOccupiedSpaceId || 'None';
    }
    
    // Update last occupied space time
    const lastSpaceTimeElement = document.getElementById('worker-last-space-time');
    if (lastSpaceTimeElement) {
        lastSpaceTimeElement.textContent = worker.occupiedSpace.lastOccupiedTime 
            ? formatSimulationTime(worker.occupiedSpace.lastOccupiedTime)
            : 'N/A';
    }
    
    // Update current occupied space
    const currentSpaceElement = document.getElementById('worker-current-space');
    if (currentSpaceElement) {
        currentSpaceElement.textContent = worker.occupiedSpace.currentOccupiedSpaceId || 'None';
    }
    
    // Update current occupied space time
    const currentSpaceTimeElement = document.getElementById('worker-current-space-time');
    if (currentSpaceTimeElement) {
        currentSpaceTimeElement.textContent = worker.occupiedSpace.currentOccupiedTime 
            ? formatSimulationTime(worker.occupiedSpace.currentOccupiedTime)
            : 'N/A';
    }
}

function updateEventsWorkerInfo(simulation: Simulation, worker: Worker): void {
    const eventsContainer = document.getElementById('worker-events-container');
    const noEventsMessage = document.getElementById('worker-no-events');
    const eventsMap = (simulation as any).workerManager.events;
    
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
    if (!worker.workerEventIds || worker.workerEventIds.length === 0) {
        noEventsMessage.style.display = 'block';
        return;
    }
    
    noEventsMessage.style.display = 'none';
    
    // Add each event
    worker.workerEventIds.forEach(eventId => {
        const event = eventsMap[eventId];
        if (!event) return;

        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        
        const startTime = formatSimulationTime(event.timeFrame.startTime);
        const endTime = formatSimulationTime(event.timeFrame.endTime);
        
        // Get space information if available
        const space = event.spaceId ? (simulation as any).workerManager.spacesMap[event.spaceId] : null;
        const spaceLocation = space ? `(${Math.round(space.x)}, ${Math.round(space.y)})` : 'Unknown';
        
        eventElement.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-time">Time: ${startTime} - ${endTime}</div>
            <div class="event-space">Space: ${spaceLocation}</div>
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
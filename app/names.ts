// Space-themed desk names
export const deskNames = [
    // Planets and Celestial Bodies
    "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    "Europa", "Titan", "Ganymede", "Callisto", "Io", "Triton", "Charon", "Phobos",
    
    // Stars and Constellations
    "Sirius", "Vega", "Betelgeuse", "Rigel", "Antares", "Polaris", "Aldebaran",
    "Orion", "Cassiopeia", "Ursa", "Lyra", "Perseus", "Andromeda", "Cygnus",
    
    // Space Phenomena
    "Nebula", "Quasar", "Pulsar", "Supernova", "Black Hole", "White Dwarf",
    "Red Giant", "Blue Giant", "Asteroid", "Comet", "Meteor", "Cosmic Ray",
    
    // Space Exploration
    "Apollo", "Voyager", "Pioneer", "Explorer", "Discovery", "Endeavour",
    "Challenger", "Atlantis", "Columbia", "Enterprise", "Sputnik", "Luna"
];

// Sci-fi themed space names
export const spaceNames = [
    // Sci-fi Locations
    "Alpha Centauri", "Proxima Centauri", "Wolf 359", "Epsilon Eridani",
    "Barnard's Star", "Luyten's Star", "Ross 128", "Gliese 581",
    
    // Sci-fi Concepts
    "Warp Drive", "Hyperspace", "Wormhole", "Stargate", "Time Portal",
    "Quantum Bridge", "Temporal Nexus", "Dimensional Rift", "Space-Time Fold",
    
    // Sci-fi Technology
    "Photon Torpedo", "Ion Cannon", "Plasma Field", "Gravity Well",
    "Tractor Beam", "Shield Generator", "Warp Core", "Quantum Computer",
    
    // Sci-fi Structures
    "Space Station", "Orbital Platform", "Docking Bay", "Command Center",
    "Research Lab", "Engineering Bay", "Medical Bay", "Cargo Hold",
    
    // Sci-fi Events
    "First Contact", "Time Paradox", "Space Anomaly", "Quantum Leap",
    "Temporal Shift", "Dimensional Merge", "Reality Rift", "Cosmic Storm"
];

// Function to get a random name from an array
export function getRandomName(names: string[]): string {
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
}

// Function to get a unique name from an array
export function getUniqueName(names: string[], usedNames: Set<string>): string {
    let name: string;
    do {
        name = getRandomName(names);
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
} 
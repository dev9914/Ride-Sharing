class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
    this.vehicles = [];
    this.ridesOffered = 0;
    this.ridesTaken = 0;
    this.takenRides = []; // Track rides taken and in progress
  }

  addVehicle(vehicle) {
    this.vehicles.push(vehicle);
  }
}

class Vehicle {
  constructor(owner, name, number) {
    this.owner = owner;
    this.name = name;
    this.number = number;
  }
}

class Ride {
  constructor(id, driver, vehicle, origin, destination, seats) {
    this.id = id;
    this.driver = driver;
    this.vehicle = vehicle;
    this.origin = origin;
    this.destination = destination;
    this.totalSeats = seats;
    this.availableSeats = seats;
    this.active = true;
  }
}


class RideSharingSystem {
  constructor() {
    this.users = new Map();
    this.rides = new Map();
    this.rideCounter = 1;
  }

  addUser(name, age) {
    if (this.users.has(name)) return console.log(`${name} already exists.`);
    const user = new User(name, age);
    this.users.set(name, user);
  }

  addVehicle(userName, vehicleName, vehicleNumber) {
    const user = this.users.get(userName);
    if (!user) return console.log(`User ${userName} not found.`);
    const vehicle = new Vehicle(userName, vehicleName, vehicleNumber);
    user.addVehicle(vehicle);
  }

  offerRide(userName, origin, destination, seats, vehicleName) {
    const user = this.users.get(userName);
    if (!user) return console.log(`User ${userName} not found.`);

    const vehicle = user.vehicles.find((v) => v.name === vehicleName);
    if (!vehicle) return console.log(`Vehicle ${vehicleName} not found for user ${userName}.`);

    for (let ride of this.rides.values()) {
      if (
        ride.vehicle.name === vehicle.name &&
        ride.vehicle.number === vehicle.number &&
        ride.active
      ) {
        console.log(`Vehicle ${vehicle.name} is already in an active ride.`);
        return;
      }
    }

    const rideId = this.rideCounter++;
    const ride = new Ride(rideId, user, vehicle, origin, destination, seats);
    this.rides.set(rideId, ride);
    user.ridesOffered++;

    console.log(
      `Ride offered by ${userName} with vehicle ${vehicle.name} from ${origin} to ${destination} with ${seats} seats.`
    );
  }

  selectRide(userName, source, destination, seats, strategy, preferredVehicleName = null) {
    const user = this.users.get(userName);
    if (!user) return console.log(`User ${userName} not found.`);

    const matchingRides = [];
    for (let ride of this.rides.values()) {
      if (
        ride.origin === source &&
        ride.destination === destination &&
        ride.availableSeats >= seats &&
        ride.active
      ) {
        matchingRides.push(ride);
      }
    }

    if (matchingRides.length === 0) return console.log("No matching rides found.");

    let selectedRide = null;
    if (strategy === "MostVacant") {
      selectedRide = matchingRides.reduce((max, ride) =>
        ride.availableSeats > max.availableSeats ? ride : max
      );
    } else if (strategy === "PreferredVehicle" && preferredVehicleName) {
      selectedRide = matchingRides.find(
        (ride) => ride.vehicle.name === preferredVehicleName
      );
    }

    if (!selectedRide) return console.log("No suitable ride found based on the strategy.");

    selectedRide.availableSeats -= seats;
    user.ridesTaken++;
    user.takenRides.push(selectedRide); // Track ride taken

    console.log(`${userName} successfully booked ride ${selectedRide.id} with ${seats} seat.`);
  }

  endRide(vehicleName) {
    for (let ride of this.rides.values()) {
      if (ride.vehicle.name === vehicleName && ride.active) {
        ride.active = false;
        console.log(`Ride for vehicle ${vehicleName} has ended.`);
        return;
      }
    }
    console.log(`No active ride found for vehicle ${vehicleName}`);
  }

  printRideStats() {
    for (let user of this.users.values()) {
      let inProgress = 0;

      for (let ride of this.rides.values()) {
        if (ride.active && ride.driver.name === user.name) {
          inProgress++;
        }
      }

      for (let ride of user.takenRides) {
        if (ride.active) {
          inProgress++;
        }
      }

      console.log(`${user.name}: Rides Offered - ${user.ridesOffered}, Rides Taken - ${user.ridesTaken}, In-Progress - ${inProgress}`);
    }
  }
}

function runTestCases() {
  const system = new RideSharingSystem();

  system.addUser("Amit", 36);
  system.addVehicle("Amit", "Swift", "KA-01-12345");

  system.addUser("Neeraj", 29);
  system.addVehicle("Neeraj", "Baleno", "TS-05-62395");

  system.addUser("Sneha", 29);

  system.addUser("Ritu", 27);
  system.addVehicle("Ritu", "Polo", "KA-05-41491");
  system.addVehicle("Ritu", "Activa", "KA-12-12332");

  system.addUser("Vikas", 35);
  system.addVehicle("Vikas", "XUV", "KA-05-1234");

  system.offerRide("Amit", "Hyderabad", "Bangalore", 2, "Swift");
  system.offerRide("Neeraj", "Bangalore", "Mysore", 1, "Baleno");
  system.offerRide("Ritu", "Bangalore", "Mysore", 2, "Polo");
  system.offerRide("Ritu", "Bangalore", "Mysore", 1, "Activa");

  system.selectRide("Sneha", "Bangalore", "Mysore", 1, "MostVacant");
  system.selectRide("Vikas", "Bangalore", "Mysore", 1, "PreferredVehicle", "Activa");
  system.selectRide("Neeraj", "Mumbai", "Bangalore", 1, "MostVacant");
  system.selectRide("Amit", "Hyderabad", "Bangalore", 1, "PreferredVehicle", "Baleno");

  system.endRide("Polo");
  system.endRide("Activa");

  system.printRideStats();
}

runTestCases();

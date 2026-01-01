import Service from "../models/Service.js";

const services = [
  { name: "Electrician", category: "Home Services", image: "/images/electrician.jpg" },
  { name: "Plumber", category: "Home Services", image: "/images/plumber.jpg" },
  { name: "Carpenter", category: "Home Services", image: "/images/carpenter.jpg" },
  { name: "Painter", category: "Home Services", image: "/images/painter.jpg" },
  { name: "AC Repair", category: "Appliance & Repair", image: "/images/ac-repair.jpg" },
  { name: "Refrigerator Repair", category: "Appliance & Repair", image: "/images/refrigerator-repair.jpg" },
  { name: "Washing Machine Repair", category: "Appliance & Repair", image: "/images/washing-machine-repair.jpg" },
  { name: "TV Repair", category: "Appliance & Repair", image: "/images/tv-repair.jpg" },
  { name: "RO Water Purifier Service", category: "Appliance & Repair", image: "/images/ro-service.jpg" },
  { name: "Car Repair", category: "Vehicle Services", image: "/images/car-repair.jpg" },
  { name: "Bike Repair", category: "Vehicle Services", image: "/images/bike-repair.jpg" },
  { name: "Mechanic on Call", category: "Vehicle Services", image: "/images/mechanic-on-call.jpg" },
  { name: "Vehicle Servicing", category: "Vehicle Services", image: "/images/vehicle-servicing.jpg" },
  { name: "Catering Services", category: "Event & Utility", image: "/images/catering.jpg" },
  { name: "Event Setup", category: "Event & Utility", image: "/images/event-setup.jpg" },
  { name: "Tent & Lighting", category: "Event & Utility", image: "/images/tent-lighting.jpg" },
  { name: "Civil Maintenance", category: "Civil & General", image: "/images/civil-maintenance.jpg" },
  { name: "Mason Work", category: "Civil & General", image: "/images/mason-work.jpg" },
  { name: "Welding", category: "Civil & General", image: "/images/welding.jpg" },
  { name: "Fabrication", category: "Civil & General", image: "/images/fabrication.jpg" },
  { name: "Wedding Planner", category: "Event Planning", image: "/images/wedding-planner.jpg" },
  { name: "Party Organizer", category: "Event Planning", image: "/images/party-organizer.jpg" },
  { name: "Private Chef", category: "Food Services", image: "/images/private-chef.jpg" },
  { name: "Auto Mechanic", category: "Vehicle Services", image: "/images/auto-mechanic.jpg" },
  { name: "Tire Repair", category: "Vehicle Services", image: "/images/tire-repair.jpg" },
  { name: "Contractor", category: "Construction", image: "/images/contractor.jpg" },
  { name: "Landscaping", category: "Home Services", image: "/images/landscaping.jpg" },
  { name: "House Cleaning", category: "Home Services", image: "/images/house-cleaning.jpg" },
  { name: "Pest Control", category: "Home Services", image: "/images/pest-control.jpg" },
  { name: "Appliance Installation", category: "Appliance & Repair", image: "/images/appliance-installation.jpg" },
  { name: "Computer Repair", category: "Electronics Repair", image: "/images/computer-repair.jpg" },
  { name: "Mobile Repair", category: "Electronics Repair", image: "/images/mobile-repair.jpg" },
  { name: "Tutoring", category: "Education", image: "/images/tutoring.jpg" },
  { name: "Yoga Instructor", category: "Health & Wellness", image: "/images/yoga-instructor.jpg" },
  { name: "Personal Trainer", category: "Health & Wellness", image: "/images/personal-trainer.jpg" },
  { name: "Photography", category: "Creative Services", image: "/images/photography.jpg" },
  { name: "Graphic Design", category: "Creative Services", image: "/images/graphic-design.jpg" },
];

export const getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedServices = async (req, res) => {
  try {
    await Service.deleteMany({});
    const createdServices = await Service.insertMany(services);
    res.status(201).json(createdServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

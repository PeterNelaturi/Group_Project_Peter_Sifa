import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); 


let tours = [
  {
    id: 1,
    operator: "Waiheke Explorer",
    location: { lat: -36.8406, lng: 174.7633 },
    launches: [
      { time: "09:00", capacity: 8 },
      { time: "11:00", capacity: 5 },
    ],
    "image": "/assets/1.jpg",
  },
  {
    id: 2,
    operator: "Harbour Cruises",
    location: { lat: -36.8305, lng: 174.7966 },
    launches: [
      { time: "10:00", capacity: 6 },
      { time: "14:00", capacity: 2 }, 
    ],
    "image": "/assets/2.jpg",
  },
  {
    id: 3,
    operator: "Island Discoveries",
    location: { lat: -36.8444, lng: 174.7772 },
    launches: [
      { time: "09:00", capacity: 10 },
      { time: "13:00", capacity: 4 },
    ],
    "image": "/assets/3.jpg",  
  },
  {
    id: 4,
    operator: "Coastal Adventures",
    location: { lat: -36.8575, lng: 174.7833 },
    launches: [
      { time: "12:00", capacity: 5 },
      { time: "15:00", capacity: 3 },
    ],
    "image": "/assets/4.jpg",
  },
  {
    id: 5,
    operator: "Pacific Tours",
    location: { lat: -36.8640, lng: 174.7758 },
    launches: [
      { time: "10:00", capacity: 0 },
      { time: "14:00", capacity: 0 },
    ],
    "image": "/assets/5.jpg",
  },
];


let bookings = [];
let bookingIdCounter = 1;


app.get("/api/tours", (req, res) => {
  res.json(tours);
});


app.post("/api/bookings", (req, res) => {
  const { name, partySize, tourId, time } = req.body;
  if (!name || !partySize || !tourId || !time) {
    return res.status(400).json({ error: "Missing booking data" });
  }

  const tour = tours.find((t) => t.id === tourId);
  if (!tour) return res.status(404).json({ error: "Tour not found" });

  const launch = tour.launches.find((l) => l.time === time);
  if (!launch) return res.status(404).json({ error: "Launch time not found" });

  if (launch.capacity < partySize) {
    return res.status(400).json({ error: "Not enough capacity" });
  }

  launch.capacity -= partySize;

  const newBooking = {
    id: bookingIdCounter++,
    name,
    partySize,
    tourId,
    time,
    operator: tour.operator,
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});


app.get("/api/bookings/:id", (req, res) => {
  const booking = bookings.find((b) => b.id === parseInt(req.params.id));
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
});


app.delete("/api/bookings/:id", (req, res) => {
  const bookingIndex = bookings.findIndex((b) => b.id === parseInt(req.params.id));
  if (bookingIndex === -1) return res.status(404).json({ error: "Booking not found" });

  const booking = bookings[bookingIndex];

  const tour = tours.find((t) => t.id === booking.tourId);
  const launch = tour.launches.find((l) => l.time === booking.time);
  launch.capacity += booking.partySize;

  bookings.splice(bookingIndex, 1);

  res.json({ message: "Booking cancelled", ...booking });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
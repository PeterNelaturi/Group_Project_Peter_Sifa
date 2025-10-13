let map; 
let toursData = [];
if (document.getElementById("map")) {
  

  fetch("/api/tours")
    .then((res) => res.json())
    .then((tours) => {
      toursData = tours;

      map = L.map("map").setView([-36.84, 174.76], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      
      tours.forEach((tour) => {
        const marker = L.marker([tour.location.lat, tour.location.lng]).addTo(map);

        const launchesHtml = tour.launches.map((l, index) => `
          Time: ${l.time}<br>
          Remaining seats: ${l.capacity}<br>
          <a href="#" class="book-now" data-tour-id="${tour.id}" data-launch-index="${index}">Book Now</a>
        `).join("<hr>");

        marker.bindPopup(`<b>${tour.operator}</b><br><img src="${tour.image}" width="150"><br>${launchesHtml}`);
      });

      
      map.on("popupopen", function(e) {
        const popupNode = e.popup.getElement();
        popupNode.querySelectorAll(".book-now").forEach(link => {
          link.addEventListener("click", (ev) => {
            ev.preventDefault();
            const tourId = parseInt(link.dataset.tourId);
            const launchIndex = parseInt(link.dataset.launchIndex);
            showBookingForm(tourId, launchIndex);
          });
        });
      });
    });
}


function showBookingForm(tourId, launchIndex) {
  const tour = toursData.find(t => t.id === tourId);
  const launch = tour.launches[launchIndex];

  
const modalBody = document.getElementById("modalBody");
modalBody.innerHTML = `
  <h5>Booking for ${tour.operator}</h5>
  <p>Time: ${launch.time}<br>Remaining seats: ${launch.capacity}</p>
  <form id="personalForm">
    <div class="mb-3">
      <label class="form-label">First Name</label>
      <input type="text" id="firstName" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Last Name</label>
      <input type="text" id="lastName" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Email</label>
      <input type="email" id="email" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Phone</label>
      <input type="tel" id="phone" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Number of People</label>
      <input type="number" id="partySize" class="form-control" min="1" max="${launch.capacity}" required>
    </div>
    <button type="submit" class="btn btn-primary">Book</button>
  </form>
  <div id="summary" class="mt-3"></div>
`;


const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
bookingModal.show();


  document.getElementById("personalForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const bookingData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      tourId,
      time: launch.time,
      partySize: parseInt(document.getElementById("partySize").value)
    };

   
fetch("/api/bookings", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    name: `${bookingData.firstName} ${bookingData.lastName}`,
    partySize: bookingData.partySize,
    tourId: bookingData.tourId,
    time: bookingData.time
  })
})
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
      return;
    }



const modalBody = document.getElementById("modalBody");
modalBody.innerHTML = `
  <h5 class="fw-bold mb-3 text-center">Booking Summary</h5>

  <div class="ms-3">
    <table class="table table-borderless">
      <tbody>
        <tr>
          <th class="text-start">Booking ID:</th>
          <td class="text-start">${String(data.id).padStart(7, '0')}</td>
        </tr>
        <tr>
          <th class="text-start">Name:</th>
          <td class="text-start">${bookingData.firstName} ${bookingData.lastName}</td>
        </tr>
        <tr>
          <th class="text-start">Email:</th>
          <td class="text-start">${bookingData.email}</td>
        </tr>
        <tr>
          <th class="text-start">Phone:</th>
          <td class="text-start">${bookingData.phone}</td>
        </tr>
        <tr>
          <th class="text-start">Location:</th>
          <td class="text-start">${toursData.find(t => t.id === tourId).operator}</td>
        </tr>
        <tr>
          <th class="text-start">Date:</th>
          <td class="text-start">${new Date().toLocaleDateString()}</td>
        </tr>
        <tr>
          <th class="text-start">Time:</th>
          <td class="text-start">${launch.time}</td>
        </tr>
        <tr>
          <th class="text-start">Number of People:</th>
          <td class="text-start">${bookingData.partySize}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="mt-4 text-end">
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
  </div>
`;

  });

  });
  
}





const homeBtn = document.getElementById("homeBtn");
homeBtn.addEventListener("click", () => {
  
  const mapDiv = document.getElementById("map");
  const mainContainer = document.getElementById("mainContainer");

  const bookingContainer = document.getElementById("bookingContainer");

  
  if (mainContainer) mainContainer.innerHTML = "";

 
  if (bookingContainer) bookingContainer.innerHTML = "";

  
  if (mapDiv) {
    mapDiv.style.display = "block";
    map.setView([-36.84, 174.76], 12);
  }
});


const bookingBtn = document.getElementById("bookingBtn");
const bookingContainer = document.getElementById("bookingContainer");

if (bookingBtn) {
  bookingBtn.addEventListener("click", () => {
    
    const mapDiv = document.getElementById("map");
    if (mapDiv) mapDiv.style.display = "none";

    
    bookingContainer.innerHTML = `
      
       
  <div class="d-flex justify-content-center align-items-center mb-3 mt-5">
    <label for="lookupId" class="form-label me-2 mb-0">Booking ID:</label>

    <input type="text" id="lookupId" class="form-control w-auto text-center me-2" placeholder="Enter 7 Digit ID" inputmode="numeric" maxlength="7">

    <button id="searchBooking" class="btn btn-primary">Search</button>
  </div>
  <div id="bookingResult" class="p-3 bg-white rounded shadow text-center"></div>
`;


    const searchBtn = document.getElementById("searchBooking");
    searchBtn.addEventListener("click", () => {
      const id = parseInt(document.getElementById("lookupId").value);
      if (!id) return alert("Enter a valid booking ID");

      fetch(`/api/bookings/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Booking not found");
          return res.json();
        })
        .then(data => {
        

          const bookingResult = document.getElementById("bookingResult");
bookingResult.innerHTML = `
  <div class="d-flex justify-content-center">
    <div class="border rounded p-3 bg-light text-start w-auto">
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Operator:</strong> ${data.operator}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p><strong>Size:</strong> ${data.partySize}</p>
    </div>
  </div>
  <div class="text-center mt-3">
    <button id="deleteBooking" class="btn btn-danger">Delete</button>
  </div>
`;

          const deleteBtn = document.getElementById("deleteBooking");
          deleteBtn.addEventListener("click", () => {
            fetch(`/api/bookings/${id}`, { method: "DELETE" })
              .then(res => res.json())
              .then(resp => {
                alert(resp.message);
                bookingContainer.innerHTML = ""; 
                if (mapDiv) mapDiv.style.display = "block"; 
              });
          });
        })
        .catch(err => {
          document.getElementById("bookingResult").innerHTML = `<p class="text-danger">${err.message}</p>`;
        });
    });
  });
} 
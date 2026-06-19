// =========================================================================
// L'Étoile Dorée - Client Side JavaScript Engine
// =========================================================================

// --- Menu Database ---
const MENU_ITEMS = [
  {
    id: 1,
    name: "Caviar D'Aquitaine",
    category: "starters",
    price: 65,
    rating: 4.9,
    reviews: 42,
    desc: "Premium French sturgeon caviar served on ice with warm blinis, quail eggs, and chive crème fraîche.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=500",
    tags: ["Chef Choice"]
  },
  {
    id: 2,
    name: "Pan-Seared Foie Gras",
    category: "starters",
    price: 38,
    rating: 4.8,
    reviews: 31,
    desc: "Grade A duck foie gras with caramelized mission figs, brioche toast, and aged balsamic reduction.",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=500",
    tags: []
  },
  {
    id: 3,
    name: "Truffle Burrata",
    category: "starters",
    price: 26,
    rating: 4.7,
    reviews: 58,
    desc: "Creamy artisanal burrata, heirloom cherry tomatoes, wild arugula, shaved black truffle, and extra virgin olive oil.",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=500",
    tags: ["Vegetarian"]
  },
  {
    id: 4,
    name: "Wagyu Beef Tenderloin",
    category: "mains",
    price: 95,
    rating: 5.0,
    reviews: 114,
    desc: "A5 Miyazaki Wagyu beef cooked to perfection, served with truffle potato purée, baby asparagus, and rich red wine jus.",
    image: "signature_dish.png",
    tags: ["Signature", "Gluten Free"]
  },
  {
    id: 5,
    name: "Dover Sole Meunière",
    category: "mains",
    price: 52,
    rating: 4.8,
    reviews: 48,
    desc: "Wild-caught Dover sole pan-fried in brown butter, lemon juice, and fresh parsley, filleted table-side.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=500",
    tags: []
  },
  {
    id: 6,
    name: "Wild Mushroom Risotto",
    category: "mains",
    price: 34,
    rating: 4.6,
    reviews: 62,
    desc: "Acquerello carnaroli rice with porcini, chanterelles, shiitake, aged Parmigiano-Reggiano, and white truffle essence.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=500",
    tags: ["Vegetarian"]
  },
  {
    id: 7,
    name: "Le Chocolat Soufflé",
    category: "desserts",
    price: 18,
    rating: 4.9,
    reviews: 95,
    desc: "Decadent Valrhona dark chocolate soufflé served warm with house-made Madagascar vanilla bean gelato.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=500",
    tags: ["Signature"]
  },
  {
    id: 8,
    name: "Tahitian Crème Brûlée",
    category: "desserts",
    price: 15,
    rating: 4.7,
    reviews: 51,
    desc: "Silky vanilla bean custard with a perfectly caramelized sugar shell and fresh seasonal berries.",
    image: "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&q=80&w=500",
    tags: ["Gluten Free"]
  },
  {
    id: 9,
    name: "Golden Pear Tarte Tatin",
    category: "desserts",
    price: 16,
    rating: 4.8,
    reviews: 37,
    desc: "Upside-down caramelized pear tart, flaky puff pastry, served with salted butter caramel sauce.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500",
    tags: []
  }
];

// --- Application State ---
let bookingState = {
  date: "",
  time: "",
  guests: 2,
  selectedTableId: null,
  selectedTableCapacity: null,
  selectedTableName: ""
};

// Default occupied tables for mocking table availability
// Format: { "YYYY-MM-DD_time": [tableId1, tableId2, ...] }
const MOCK_OCCUPIED_TABLES = {
  // Deterministic mock data to make floorplan dynamic at startup
  today_17:00: [2, 5],
  today_18:30: [1, 5, 8],
  today_20:00: [2, 6, 7],
  today_21:30: [3, 4],
};

// --- DOM References ---
document.addEventListener("DOMContentLoaded", () => {
  initDateConstraints();
  renderMenu("all");
  setupMenuFilters();
  setupFloorPlanEvents();
  setupBookingForm();
  setupHeaderScroll();
  setupIntersectionObserver();
  setupModalEvents();
  setupMobileNav();
  loadBookingsCount();
});

// Set date input minimum value to today's date
function initDateConstraints() {
  const dateInput = document.getElementById("booking-date");
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    dateInput.min = formattedToday;
    dateInput.value = formattedToday;
    bookingState.date = formattedToday;
    
    // Set default values into summary
    updateSummary();
  }
}

// --- Menu Rendering & Category Filters ---
function renderMenu(category) {
  const menuGrid = document.getElementById("menu-grid");
  if (!menuGrid) return;
  
  menuGrid.innerHTML = "";
  
  const filteredItems = MENU_ITEMS.filter(item => {
    if (category === "all") return true;
    if (category === "signatures") return item.tags.includes("Signature");
    return item.category === category;
  });

  filteredItems.forEach(item => {
    const stars = Array(Math.floor(item.rating)).fill('<i class="fa-solid fa-star"></i>').join("") + 
                  (item.rating % 1 !== 0 ? '<i class="fa-solid fa-star-half-stroke"></i>' : "");
                  
    const tagsHTML = item.tags.map(tag => `<span class="menu-item-tag">${tag}</span>`).join("");

    const itemCard = document.createElement("div");
    itemCard.className = "menu-item";
    itemCard.innerHTML = `
      <div class="menu-item-img-container">
        <img src="${item.image}" alt="${item.name}" class="menu-item-img" onerror="this.src='signature_dish.png'">
        ${tagsHTML}
      </div>
      <div class="menu-item-info">
        <div class="menu-item-header">
          <h4 class="menu-item-title">${item.name}</h4>
          <span class="menu-item-price">$${item.price}</span>
        </div>
        <p class="menu-item-desc">${item.desc}</p>
        <div class="menu-item-footer">
          <div class="menu-item-stat">
            <span style="color: #ffb300; display: flex; gap: 2px;">${stars}</span>
            <span style="font-size: 0.75rem; margin-left: 0.25rem;">(${item.reviews} reviews)</span>
          </div>
          <div class="menu-item-stat">
            <i class="fa-solid fa-fire-flame-curved"></i>
            <span>Premium</span>
          </div>
        </div>
      </div>
    `;
    menuGrid.appendChild(itemCard);
  });
}

function setupMenuFilters() {
  const filterBtns = document.querySelectorAll(".menu-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      renderMenu(category);
    });
  });
}

// --- Visual Seating Floor Plan Map ---
function setupFloorPlanEvents() {
  const dateInput = document.getElementById("booking-date");
  const timeSelect = document.getElementById("booking-time");
  const guestsSelect = document.getElementById("booking-guests");
  
  // Refresh availability whenever date or time selection changes
  [dateInput, timeSelect].forEach(element => {
    element.addEventListener("change", () => {
      bookingState.date = dateInput.value;
      bookingState.time = timeSelect.value;
      
      // Reset selected table state as the timeslot changed
      resetTableSelection();
      updateTableAvailability();
    });
  });

  guestsSelect.addEventListener("change", () => {
    bookingState.guests = parseInt(guestsSelect.value);
    
    // Check if the currently selected table can accommodate the new guest count
    if (bookingState.selectedTableId) {
      if (bookingState.guests > bookingState.selectedTableCapacity) {
        showToast(
          "Table Capacity Alert", 
          `Table ${bookingState.selectedTableName} accommodates a max of ${bookingState.selectedTableCapacity} guests. Selection reset.`, 
          "error"
        );
        resetTableSelection();
      }
    }
    updateSummary();
  });

  // SVG Table Elements Interaction
  const svgTables = document.querySelectorAll(".map-table");
  svgTables.forEach(table => {
    table.addEventListener("click", () => {
      // Check if date and time are selected first
      if (!bookingState.date || !bookingState.time) {
        showToast("Seating Map", "Please pick a Date and Time Session first.", "error");
        
        // Highlight form inputs to draw attention
        if (!bookingState.date) dateInput.focus();
        else if (!bookingState.time) timeSelect.focus();
        return;
      }

      // Check if table is occupied
      if (table.classList.contains("occupied")) {
        showToast("Occupied", "This table is already booked for this session. Please select another.", "error");
        return;
      }

      const tableId = parseInt(table.getAttribute("data-table-id"));
      const capacity = parseInt(table.getAttribute("data-capacity"));
      const tableName = table.querySelector("text").textContent.split(" ")[0];

      // Validate capacity limit: requested guests cannot exceed table capacity
      if (bookingState.guests > capacity) {
        showToast(
          "Capacity Mismatch", 
          `${tableName} holds up to ${capacity} guests. Adjust guest count or select a larger table.`, 
          "error"
        );
        return;
      }

      // Visual Toggle Selection
      svgTables.forEach(t => t.classList.remove("selected"));
      table.classList.add("selected");

      // Save state
      bookingState.selectedTableId = tableId;
      bookingState.selectedTableCapacity = capacity;
      bookingState.selectedTableName = tableName;

      showToast("Table Selected", `You have selected ${tableName} (Seats up to ${capacity}).`, "success");
      updateSummary();
    });
  });

  // Trigger initial paint
  updateTableAvailability();
}

// Reset visual table states
function resetTableSelection() {
  bookingState.selectedTableId = null;
  bookingState.selectedTableCapacity = null;
  bookingState.selectedTableName = "";
  
  const svgTables = document.querySelectorAll(".map-table");
  svgTables.forEach(t => t.classList.remove("selected"));
  updateSummary();
}

// Check availability based on selections and LocalStorage + Mock db
function updateTableAvailability() {
  const dateInput = document.getElementById("booking-date");
  const timeSelect = document.getElementById("booking-time");
  const svgTables = document.querySelectorAll(".map-table");

  if (!dateInput.value || !timeSelect.value) {
    // Keep tables as available but grayed out/inactive until parameters are set
    svgTables.forEach(table => {
      table.classList.remove("occupied");
      table.classList.add("available");
    });
    return;
  }

  const queryKey = `${dateInput.value}_${timeSelect.value}`;
  
  // Get occupied tables from mock DB
  let occupiedIds = [];
  
  // Map 'today' relative tag to actual dates for mock
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const actualTodayString = `${yyyy}-${mm}-${dd}`;

  const mockKey = queryKey.replace(actualTodayString, "today");
  if (MOCK_OCCUPIED_TABLES[mockKey]) {
    occupiedIds = [...MOCK_OCCUPIED_TABLES[mockKey]];
  }

  // Get bookings from local storage to block tables already booked in this session
  const bookings = getLocalBookings();
  bookings.forEach(b => {
    if (b.date === dateInput.value && b.time === timeSelect.value) {
      occupiedIds.push(b.tableId);
    }
  });

  // Update SVG Floorplan Classes
  svgTables.forEach(table => {
    const tableId = parseInt(table.getAttribute("data-table-id"));
    if (occupiedIds.includes(tableId)) {
      table.classList.remove("available", "selected");
      table.classList.add("occupied");
    } else {
      table.classList.remove("occupied");
      table.classList.add("available");
    }
  });
}

// Update the booking summary panel
function updateSummary() {
  const summaryDateTime = document.getElementById("summary-datetime");
  const summaryGuests = document.getElementById("summary-guests");
  const summaryTable = document.getElementById("summary-table");
  const summaryTableCap = document.getElementById("summary-table-cap");

  // DateTime Summary
  if (bookingState.date && bookingState.time) {
    const dateFormatted = new Date(bookingState.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
    summaryDateTime.textContent = `${dateFormatted} @ ${bookingState.time}`;
  } else {
    summaryDateTime.textContent = "Please select date & time...";
  }

  // Guests
  summaryGuests.textContent = `${bookingState.guests} Guest${bookingState.guests > 1 ? 's' : ''}`;

  // Table Selection
  if (bookingState.selectedTableId) {
    summaryTable.textContent = bookingState.selectedTableName;
    summaryTableCap.textContent = `${bookingState.selectedTableCapacity} Seater`;
  } else {
    summaryTable.textContent = "None Selected";
    summaryTableCap.textContent = "N/A";
  }
}

// --- Reservation Actions & Submission ---
function setupBookingForm() {
  const form = document.getElementById("reservation-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dateVal = document.getElementById("booking-date").value;
    const timeVal = document.getElementById("booking-time").value;
    const guestName = document.getElementById("guest-name").value.trim();
    const guestPhone = document.getElementById("guest-phone").value.trim();
    const guestEmail = document.getElementById("guest-email").value.trim();
    const guestOccasion = document.getElementById("guest-occasion").value;
    const guestNotes = document.getElementById("guest-notes").value.trim();

    // Check pre-requisites
    if (!dateVal || !timeVal) {
      showToast("Incomplete Form", "Please choose a reservation Date and Time first.", "error");
      return;
    }

    if (!bookingState.selectedTableId) {
      showToast("Select Table", "Please select a dining table from the floor map layout.", "error");
      // Add shake animation to the map wrapper
      const mapWrapper = document.querySelector(".floorplan-map-wrapper");
      mapWrapper.style.animation = "none";
      setTimeout(() => {
        mapWrapper.style.animation = "fadeInUp 0.3s ease-in-out";
        mapWrapper.style.border = "1px solid var(--error)";
      }, 10);
      setTimeout(() => {
        mapWrapper.style.border = "1px solid var(--border-light)";
      }, 2000);
      return;
    }

    if (!guestName || !guestPhone || !guestEmail) {
      showToast("Missing Fields", "Please complete all guest details fields.", "error");
      return;
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      showToast("Invalid Email", "Please enter a valid email address.", "error");
      return;
    }

    // Generate Booking
    const bookingId = "LD-" + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
      id: bookingId,
      name: guestName,
      phone: guestPhone,
      email: guestEmail,
      date: dateVal,
      time: timeVal,
      guests: bookingState.guests,
      tableId: bookingState.selectedTableId,
      tableName: bookingState.selectedTableName,
      tableCapacity: bookingState.selectedTableCapacity,
      occasion: guestOccasion,
      notes: guestNotes,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };

    // Save to LocalStorage
    saveBooking(newBooking);

    // Populate Success Modal
    document.getElementById("success-id").textContent = bookingId;
    document.getElementById("success-name").textContent = guestName;
    document.getElementById("success-guests").textContent = `${newBooking.guests} People`;
    document.getElementById("success-table").textContent = `${newBooking.tableName} (${newBooking.tableCapacity} seats)`;
    
    const formattedDate = new Date(dateVal).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById("success-datetime").textContent = `${formattedDate} at ${timeVal}`;

    // Open Success Modal
    openModal("success-modal");

    // Reset forms & floor layout
    form.reset();
    initDateConstraints();
    resetTableSelection();
    updateTableAvailability();
    loadBookingsCount();
  });
}

// --- LocalStorage Persistence Layer ---
function getLocalBookings() {
  const list = localStorage.getItem("letoile_bookings");
  return list ? JSON.parse(list) : [];
}

function saveBooking(booking) {
  const current = getLocalBookings();
  current.push(booking);
  localStorage.setItem("letoile_bookings", JSON.stringify(current));
}

function cancelBooking(bookingId) {
  let current = getLocalBookings();
  current = current.filter(b => b.id !== bookingId);
  localStorage.setItem("letoile_bookings", JSON.stringify(current));
  
  showToast("Cancelled", "Your reservation has been cancelled successfully.", "success");
  loadBookingsCount();
  updateTableAvailability();
  renderBookingsList();
}

// Render dynamic user bookings dashboard
function renderBookingsList() {
  const container = document.getElementById("bookings-list-container");
  if (!container) return;

  const bookings = getLocalBookings().sort((a, b) => new Date(a.date) - new Date(b.date));

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-bookings-state">
        <i class="fa-regular fa-calendar-xmark"></i>
        <p>No active reservations found.</p>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Book a table below to start your culinary journey.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  bookings.forEach(b => {
    const dateFormatted = new Date(b.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    const card = document.createElement("div");
    card.className = "booking-card";
    card.innerHTML = `
      <div class="booking-card-info">
        <h4>Table ${b.tableName} <span class="gold-text" style="font-size: 0.8rem; font-weight:400; margin-left: 0.5rem;">${b.id}</span></h4>
        <div class="booking-card-meta">
          <span><i class="fa-regular fa-calendar"></i> ${dateFormatted}</span>
          <span><i class="fa-regular fa-clock"></i> ${b.time}</span>
          <span><i class="fa-solid fa-users"></i> ${b.guests} Guests</span>
        </div>
      </div>
      <div class="booking-card-actions">
        <button class="btn-cancel" onclick="cancelBooking('${b.id}')">Cancel</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Update the navigation indicator for count of bookings
function loadBookingsCount() {
  const bookings = getLocalBookings();
  const count = bookings.length;
  
  const bookingsBtn = document.getElementById("btn-view-bookings-nav");
  const mobileBtn = document.getElementById("btn-view-bookings-mobile");
  
  if (count > 0) {
    bookingsBtn.innerHTML = `<i class="fa-solid fa-calendar-days" style="margin-right: 0.5rem;"></i>My Bookings <span style="background: var(--accent-gold); color: var(--text-dark); border-radius: 50%; padding: 1px 6px; font-size: 0.75rem; font-weight:700; margin-left: 0.4rem;">${count}</span>`;
    mobileBtn.innerHTML = `<i class="fa-solid fa-calendar-days" style="margin-right: 0.5rem;"></i>My Bookings <span style="background: var(--accent-gold); color: var(--text-dark); border-radius: 50%; padding: 1px 6px; font-size: 0.75rem; font-weight:700; margin-left: 0.4rem;">${count}</span>`;
  } else {
    bookingsBtn.innerHTML = `<i class="fa-solid fa-calendar-days" style="margin-right: 0.5rem;"></i>My Bookings`;
    mobileBtn.innerHTML = `<i class="fa-solid fa-calendar-days" style="margin-right: 0.5rem;"></i>My Bookings`;
  }
}

// Expose cancel to global window scope so onclick in dynamic template works
window.cancelBooking = cancelBooking;

// --- Modal Popup Management ---
function setupModalEvents() {
  // Views Bookings
  const viewBookingsNav = document.getElementById("btn-view-bookings-nav");
  const viewBookingsMobile = document.getElementById("btn-view-bookings-mobile");
  const bookingsClose = document.getElementById("bookings-modal-close");
  const bookingsCloseBtn = document.getElementById("btn-close-bookings-modal");
  
  const showBookingsAction = () => {
    renderBookingsList();
    openModal("bookings-modal");
    // Close mobile menu drawer if active
    document.getElementById("mobile-nav").classList.remove("active");
    document.getElementById("nav-overlay").classList.remove("active");
  };

  if (viewBookingsNav) viewBookingsNav.addEventListener("click", showBookingsAction);
  if (viewBookingsMobile) viewBookingsMobile.addEventListener("click", showBookingsAction);
  if (bookingsClose) bookingsClose.addEventListener("click", () => closeModal("bookings-modal"));
  if (bookingsCloseBtn) bookingsCloseBtn.addEventListener("click", () => closeModal("bookings-modal"));

  // Success Modal
  const successClose = document.getElementById("success-modal-close");
  const successCloseBtn = document.getElementById("btn-success-close");
  
  if (successClose) successClose.addEventListener("click", () => closeModal("success-modal"));
  if (successCloseBtn) successCloseBtn.addEventListener("click", () => closeModal("success-modal"));

  // Close modals when clicking on backdrop overlay
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });
}

function openModal(id) {
  document.getElementById(id).classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent body scroll
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
  document.body.style.overflow = ""; // Allow body scroll
}

// --- Custom Toast Notifications System ---
function showToast(title, message, type = "success") {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" 
    ? '<i class="fa-solid fa-circle-check" style="font-size:1.2rem;"></i>' 
    : '<i class="fa-solid fa-triangle-exclamation" style="font-size:1.2rem;"></i>';

  toast.innerHTML = `
    ${icon}
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-close"><i class="fa-solid fa-xmark"></i></div>
  `;

  container.appendChild(toast);

  // Close event listener
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.style.animation = "fadeOutDown 0.3s forwards";
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-remove toast
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = "1";
      toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 400);
    }
  }, 4000);
}

// --- Mobile Navigation Drawer Control ---
function setupMobileNav() {
  const burger = document.getElementById("menu-toggle");
  const close = document.getElementById("mobile-nav-close");
  const nav = document.getElementById("mobile-nav");
  const overlay = document.getElementById("nav-overlay");
  const links = document.querySelectorAll(".mobile-nav-link, #mobile-book-btn");

  const openDrawer = () => {
    nav.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    nav.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  if (burger) burger.addEventListener("click", openDrawer);
  if (close) close.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  links.forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer();
      
      // Update active nav link state
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

// --- Sticky Navigation Bar & Active Spy ---
function setupHeaderScroll() {
  const header = document.getElementById("header");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  window.addEventListener("scroll", () => {
    // Shrink header on scroll
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll spy active nav indicators
    let currentSectionId = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - varHeaderHeightOffset();
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute("id");
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });

  function varHeaderHeightOffset() {
    return window.innerWidth > 768 ? 90 : 80;
  }
}

// --- Intersection Observer for Scroll Animations ---
function setupIntersectionObserver() {
  const reveals = document.querySelectorAll(".reveal");
  
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, observerOptions);

  reveals.forEach(reveal => {
    observer.observe(reveal);
  });
}

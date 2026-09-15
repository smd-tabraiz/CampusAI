import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CampusAI database with realistic campus data...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.feedback.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.roommateConnection.deleteMany();
  await prisma.roommateProfile.deleteMany();
  await prisma.itemMatch.deleteMany();
  await prisma.lostItem.deleteMany();
  await prisma.foundItem.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.cafeteria.deleteMany();
  await prisma.eventRsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.campusLocation.deleteMany();
  await prisma.building.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.user.deleteMany();

  // 2. Passwords
  const studentPassword = await bcrypt.hash('password123', 10);
  const facultyPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 3. Create Users
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@college.edu',
      passwordHash: studentPassword,
      name: 'Alex Sharma',
      studentId: 'CS2023042',
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      year: 3,
      bio: 'Full stack enthusiast, AI researcher, and night owl coder.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    }
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@college.edu',
      passwordHash: facultyPassword,
      name: 'Dr. Rajesh Iyer',
      studentId: 'FAC201509',
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      bio: 'Professor of Artificial Intelligence and Machine Learning. Faculty Advisor for Robotics Club.',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      passwordHash: adminPassword,
      name: 'Vikram Malhotra',
      studentId: 'ADM001',
      role: 'ADMIN',
      department: 'Campus Administration',
      bio: 'Chief Administrator & Campus Operations Coordinator.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  });

  // Additional students for roommate matching, lost/found, and events
  const peers = [
    { name: 'Priya Patel', email: 'priya.patel@college.edu', dept: 'Information Technology', year: 3, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { name: 'Rohan Verma', email: 'rohan.verma@college.edu', dept: 'Mechanical Engineering', year: 2, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { name: 'Ananya Sen', email: 'ananya.sen@college.edu', dept: 'Electronics & Communication', year: 3, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { name: 'Kabir Nair', email: 'kabir.nair@college.edu', dept: 'Computer Science & Engineering', year: 4, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { name: 'Sneha Gupta', email: 'sneha.gupta@college.edu', dept: 'Biotechnology', year: 2, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { name: 'Aarav Joshi', email: 'aarav.joshi@college.edu', dept: 'Electrical Engineering', year: 3, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    { name: 'Neha Reddy', email: 'neha.reddy@college.edu', dept: 'Civil Engineering', year: 4, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' }
  ];

  const createdPeers: any[] = [];
  for (const p of peers) {
    const user = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash: studentPassword,
        name: p.name,
        role: 'STUDENT',
        department: p.dept,
        year: p.year,
        avatarUrl: p.avatar,
        bio: `Undergrad student in ${p.dept}. Active member of campus clubs.`
      }
    });
    createdPeers.push(user);
  }

  // 4. Campus Buildings & Locations (Realistic Coordinates on University Campus)
  // Campus center: 12.9716° N, 77.5946° E (or realistic college campus grid around 12.9716, 77.5946)
  const buildingsData = [
    { code: 'LIB-01', name: 'Dr. A.P.J. Abdul Kalam Central Library', lat: 12.9718, lng: 77.5942, floors: 4, description: 'Central 4-storey campus library with over 150,000 volumes, 24x7 silent reading zones, digital archives, and printing center.' },
    { code: 'CS-BLOCK', name: 'Ramanujan Computing Center & AI Labs', lat: 12.9725, lng: 77.5938, floors: 5, description: 'Department of Computer Science & AI, housing NVIDIA GPU cluster labs, VR lab, and coding centers.' },
    { code: 'ACAD-01', name: 'Aryabhata Academic Complex', lat: 12.9722, lng: 77.5955, floors: 4, description: 'Main lecture theaters, smart classrooms, and faculty offices for Engineering and Sciences.' },
    { code: 'INNOV-01', name: 'Vikram Sarabhai Innovation & Incubation Hub', lat: 12.9730, lng: 77.5948, floors: 3, description: 'Startup incubation center, MakerSpace 3D printing lab, and industry collaboration suites.' },
    { code: 'SAC-01', name: 'Nalanda Student Activity Center', lat: 12.9710, lng: 77.5950, floors: 3, description: 'Student council headquarters, music and arts rooms, auditorium, and indoor games arena.' },
    { code: 'CAF-MAIN', name: 'Anna Food Court & Central Dining', lat: 12.9712, lng: 77.5935, floors: 2, description: 'Multi-cuisine campus dining facility offering North & South Indian, fast-casual, and health food stations.' },
    { code: 'HSTL-KAV', name: 'Kaveri Boys Hostel Block A', lat: 12.9705, lng: 77.5925, floors: 6, description: 'Residential hall for undergraduate male students with high-speed WiFi and common study lounges.' },
    { code: 'HSTL-GAN', name: 'Ganga Girls Hostel Block B', lat: 12.9702, lng: 77.5960, floors: 6, description: 'Residential hall for undergraduate female students featuring indoor sports and study reading rooms.' },
    { code: 'SPORTS-01', name: 'Major Dhyan Chand Sports Complex', lat: 12.9735, lng: 77.5965, floors: 2, description: 'Olympic-size running track, badminton courts, basketball arena, gym, and football ground.' },
    { code: 'MED-01', name: 'Dhanvantari Health & Emergency Care Center', lat: 12.9715, lng: 77.5965, floors: 2, description: '24x7 medical emergency unit with resident physician, pharmacy, and ambulance service.' },
    { code: 'ADMIN-01', name: 'Central Administrative Building & Registrar', lat: 12.9728, lng: 77.5928, floors: 3, description: 'Offices of the Vice Chancellor, Registrar, Financial Aid, Admissions, and International Relations.' }
  ];

  for (const b of buildingsData) {
    await prisma.building.create({ data: b });
  }

  // Campus Locations for Map Navigation
  const locationsData = [
    { code: 'LOC-LIB-CENTRAL', name: 'Central Library & Reading Hall', category: 'LIBRARY', lat: 12.9718, lng: 77.5942, floor: '1st & 2nd Floor', description: 'Quiet study zones, high-speed WiFi, book issue counters, and digital research access.', openingHours: '08:00 AM - 11:00 PM', isAccessible: true, amenities: JSON.stringify(['WiFi', 'AC', 'Power Outlets', 'Wheelchair Access', 'Printing', 'Silent Zone']) },
    { code: 'LOC-CS-LAB3', name: 'Advanced AI & Computing Lab 304', category: 'LAB', lat: 12.9725, lng: 77.5938, floor: '3rd Floor', description: 'Equipped with 60 high-performance workstations and dual monitors for AI/ML and systems coursework.', openingHours: '08:30 AM - 09:00 PM', isAccessible: true, amenities: JSON.stringify(['High-Speed LAN', 'GPU Workstations', 'AC', 'Projector']) },
    { code: 'LOC-CAF-MAIN', name: 'Anna Food Court (Main)', category: 'CAFETERIA', lat: 12.9712, lng: 77.5935, floor: 'Ground Floor', description: 'Spacious food court with seating for 800 students. Multiple vendors offering South Indian, North Indian, and snacks.', openingHours: '07:30 AM - 10:30 PM', isAccessible: true, amenities: JSON.stringify(['Card/UPI Payment', 'Outdoor Seating', 'Pure Veg Option', 'Clean RO Water']) },
    { code: 'LOC-SAC-AUDI', name: 'Nalanda Main Auditorium', category: 'ACADEMIC', lat: 12.9710, lng: 77.5950, floor: 'Ground Floor', description: '1200-seat acoustic auditorium for convocations, tech symposiums, hackathon kickoffs, and cultural fests.', openingHours: '09:00 AM - 10:00 PM', isAccessible: true, amenities: JSON.stringify(['Acoustic Sound', 'Wheelchair Ramp', 'Stage Lighting', 'Green Rooms']) },
    { code: 'LOC-SPORTS-GYM', name: 'Campus Gymnasium & Fitness Hub', category: 'SPORTS', lat: 12.9735, lng: 77.5965, floor: '1st Floor', description: 'State-of-the-art strength training and cardio center with certified student trainers.', openingHours: '06:00 AM - 09:30 AM, 04:30 PM - 09:30 PM', isAccessible: true, amenities: JSON.stringify(['Lockers', 'Showers', 'Water Dispenser', 'Trainers']) },
    { code: 'LOC-MED-CLINIC', name: 'Campus 24x7 Emergency Health Clinic', category: 'MEDICAL', lat: 12.9715, lng: 77.5965, floor: 'Ground Floor', description: 'Immediate first aid, general consultation, pharmacy, and ambulance triage.', openingHours: 'Open 24 Hours', isAccessible: true, amenities: JSON.stringify(['24/7 Doctor', 'Emergency Ambulance', 'Free Medicines for Students', 'Wheelchair Ready']) },
    { code: 'LOC-INNOV-MAKER', name: 'MakerSpace 3D Prototyping Lab', category: 'FACILITY', lat: 12.9730, lng: 77.5948, floor: 'Ground Floor', description: '3D printers, laser cutters, CNC milling, and PCB prototyping benches open to all student project teams.', openingHours: '10:00 AM - 08:00 PM', isAccessible: true, amenities: JSON.stringify(['3D Printers', 'Soldering Stations', 'Tools', 'Safety Gear']) },
    { code: 'LOC-ADMIN-DESK', name: 'Registrar & Student Services Desk', category: 'ADMIN', lat: 12.9728, lng: 77.5928, floor: '1st Floor', description: 'Transcript verification, fee receipts, identity cards, and student welfare inquiries.', openingHours: '09:30 AM - 05:00 PM (Mon-Fri)', isAccessible: true, amenities: JSON.stringify(['Token System', 'Waiting Lounge', 'AC']) },
    { code: 'LOC-HSTL-KAV', name: 'Kaveri Hostel Common Lounge', category: 'HOSTEL', lat: 12.9705, lng: 77.5925, floor: 'Ground Floor', description: 'Student recreation area with table tennis, newspapers, TV, and vending machines.', openingHours: '06:00 AM - 11:30 PM', isAccessible: false, amenities: JSON.stringify(['TV Lounge', 'Table Tennis', 'Vending Machines']) },
    { code: 'LOC-HSTL-GAN', name: 'Ganga Hostel Reading Room', category: 'HOSTEL', lat: 12.9702, lng: 77.5960, floor: 'Ground Floor', description: 'Quiet study and discussion lounge with high speed WiFi.', openingHours: '06:00 AM - 11:30 PM', isAccessible: true, amenities: JSON.stringify(['Quiet Area', 'WiFi', 'Power Sockets']) }
  ];

  const createdLocations: any[] = [];
  for (const loc of locationsData) {
    const cl = await prisma.campusLocation.create({ data: loc });
    createdLocations.push(cl);
  }

  // 5. Facilities
  const facilitiesData = [
    { name: 'Central Digital Printing & Xerox Desk', category: 'PRINTING', buildingName: 'Dr. A.P.J. Abdul Kalam Central Library', roomNumber: 'Room 102', floor: '1st Floor', description: 'High-speed color/monochrome printing, spiral binding, and poster printing.', openingHours: '08:30 AM - 09:30 PM', isAccessible: true, lat: 12.9718, lng: 77.5942 },
    { name: 'State Bank of India Campus ATM', category: 'ATM', buildingName: 'Anna Food Court & Central Dining', roomNumber: 'Entrance Kiosk', floor: 'Ground Floor', description: '24/7 cash withdrawal, balance check, and passbook printing.', openingHours: '24 Hours', isAccessible: true, lat: 12.9712, lng: 77.5935 },
    { name: 'High Performance Computing Lab', category: 'COMPUTER_LAB', buildingName: 'Ramanujan Computing Center', roomNumber: 'Room 401', floor: '4th Floor', description: 'Dedicated AI/ML simulation lab with 80 compute nodes.', openingHours: '09:00 AM - 08:00 PM', isAccessible: true, lat: 12.9725, lng: 77.5938 },
    { name: 'First Aid & Triage Room', category: 'FIRST_AID', buildingName: 'Dhanvantari Health Center', roomNumber: 'Room 101', floor: 'Ground Floor', description: 'Emergency medical assistance and basic vitals check.', openingHours: '24 Hours', isAccessible: true, lat: 12.9715, lng: 77.5965 },
    { name: 'Hostel Night Printing Kiosk', category: 'PRINTING', buildingName: 'Kaveri Boys Hostel Block A', roomNumber: 'Lobby', floor: 'Ground Floor', description: 'Automated UPI-enabled kiosk for late night assignment printouts.', openingHours: '08:00 PM - 03:00 AM', isAccessible: true, lat: 12.9705, lng: 77.5925 }
  ];

  for (const f of facilitiesData) {
    await prisma.facility.create({ data: f });
  }

  // 6. Cafeterias & Food Items
  const cafeteriasData = [
    {
      name: 'Anna Food Court',
      locationName: 'Central Campus Plaza',
      lat: 12.9712,
      lng: 77.5935,
      openingHours: '07:30 AM - 10:30 PM',
      priceRange: '₹',
      rating: 4.5,
      isVegetarianOnly: false,
      description: 'The heartbeat of campus dining. Features authentic South Indian breakfasts, combo thalis, and fresh snacks.',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'
    },
    {
      name: 'Nescafe Innovation Lounge',
      locationName: 'Vikram Sarabhai Innovation Hub',
      lat: 12.9730,
      lng: 77.5948,
      openingHours: '09:00 AM - 09:00 PM',
      priceRange: '₹₹',
      rating: 4.6,
      isVegetarianOnly: true,
      description: 'Cozy coffee lounge serving espresso drinks, grilled paninis, pastries, and quick energy bites.',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600'
    },
    {
      name: 'Green Bites Healthy Bar',
      locationName: 'Sports Complex Plaza',
      lat: 12.9734,
      lng: 77.5962,
      openingHours: '07:00 AM - 08:30 PM',
      priceRange: '₹₹',
      rating: 4.7,
      isVegetarianOnly: true,
      description: 'Clean eating cafe offering protein smoothies, organic sprout salads, avocado toasts, and cold-pressed juices.',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'
    },
    {
      name: 'South Spice Tiffin Corner',
      locationName: 'Aryabhata Academic Courtyard',
      lat: 12.9720,
      lng: 77.5952,
      openingHours: '07:30 AM - 07:00 PM',
      priceRange: '₹',
      rating: 4.4,
      isVegetarianOnly: true,
      description: 'Crispy dosas, hot filter coffee, and fluffy idlis with four types of traditional chutneys.',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600'
    },
    {
      name: 'Kathi Junction & Wraps',
      locationName: 'Student Activity Center',
      lat: 12.9709,
      lng: 77.5948,
      openingHours: '11:00 AM - 11:30 PM',
      priceRange: '₹',
      rating: 4.3,
      isVegetarianOnly: false,
      description: 'Flavor-packed Kolkata-style kathi rolls, paneer wraps, and spicy chicken rolls.',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600'
    },
    {
      name: 'Night Owls Canteen',
      locationName: 'Hostel Quadrangle',
      lat: 12.9703,
      lng: 77.5940,
      openingHours: '09:00 PM - 04:00 AM',
      priceRange: '₹',
      rating: 4.5,
      isVegetarianOnly: false,
      description: 'The late-night lifeline for students studying for exams. Maggi, egg bhurji, chai, and cheese sandwiches.',
      imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600'
    }
  ];

  const createdCafeterias: any[] = [];
  for (const c of cafeteriasData) {
    const cafe = await prisma.cafeteria.create({ data: c });
    createdCafeterias.push(cafe);
  }

  // Food Items with prices in INR (₹)
  const foodItemsData = [
    // Anna Food Court
    { cafeteriaId: createdCafeterias[0].id, name: 'Special Masala Dosa', category: 'BREAKFAST', price: 60, isVeg: true, isVegan: false, isHealthy: true, calories: 310, popularScore: 4.8, description: 'Golden crispy crepe filled with spiced potato masala, served with coconut chutney & sambar.' },
    { cafeteriaId: createdCafeterias[0].id, name: 'Steamed Idli Sambar (2 Pcs)', category: 'BREAKFAST', price: 40, isVeg: true, isVegan: true, isHealthy: true, calories: 180, popularScore: 4.7, description: 'Steamed fermented rice and lentil cakes, low-calorie and gut-friendly.' },
    { cafeteriaId: createdCafeterias[0].id, name: 'Deluxe North Indian Thali', category: 'MEALS', price: 110, isVeg: true, isVegan: false, isHealthy: true, calories: 650, popularScore: 4.6, description: 'Paneer subzi, dal makhani, seasonal veg, 3 rotis, jeera rice, salad and gulab jamun.' },
    { cafeteriaId: createdCafeterias[0].id, name: 'Comfort Rajma Chawal Bowl', category: 'MEALS', price: 75, isVeg: true, isVegan: true, isHealthy: true, calories: 420, popularScore: 4.9, description: 'Slow-cooked kidney beans in spiced onion-tomato gravy over fragrant basmati rice.' },
    { cafeteriaId: createdCafeterias[0].id, name: 'Hyderabadi Chicken Biryani', category: 'MEALS', price: 150, isVeg: false, isVegan: false, isHealthy: false, calories: 720, popularScore: 4.8, description: 'Dum-cooked basmati rice with tender chicken marinated in aromatic whole spices.' },
    { cafeteriaId: createdCafeterias[0].id, name: 'Crispy Samosa with Mint Chutney (2 Pcs)', category: 'SNACKS', price: 30, isVeg: true, isVegan: true, isHealthy: false, calories: 260, popularScore: 4.5, description: 'Flaky pastry crust stuffed with spiced potatoes and green peas.' },
    { cafeteriaId: createdCafeterias[0].id, name: 'Adrak Elaichi Masala Chai', category: 'BEVERAGES', price: 15, isVeg: true, isVegan: false, isHealthy: true, calories: 70, popularScore: 5.0, description: 'Freshly brewed tea with crushed ginger and aromatic green cardamom.' },

    // Nescafe Innovation Lounge
    { cafeteriaId: createdCafeterias[1].id, name: 'Veg Grilled Cheese Panini', category: 'SNACKS', price: 85, isVeg: true, isVegan: false, isHealthy: false, calories: 380, popularScore: 4.6, description: 'Toasted focaccia bread loaded with bell peppers, corn, mozzarella, and basil pesto.' },
    { cafeteriaId: createdCafeterias[1].id, name: 'Hazelnut Iced Frappe', category: 'BEVERAGES', price: 95, isVeg: true, isVegan: false, isHealthy: false, calories: 290, popularScore: 4.7, description: 'Chilled blended espresso with hazelnut essence and vanilla cream.' },
    { cafeteriaId: createdCafeterias[1].id, name: 'Dark Chocolate Muffin', category: 'DESSERTS', price: 55, isVeg: true, isVegan: false, isHealthy: false, calories: 310, popularScore: 4.3, description: 'Moist Belgian cocoa muffin with melted chocolate center.' },

    // Green Bites Healthy Bar
    { cafeteriaId: createdCafeterias[2].id, name: 'Superfood Sprout & Bean Salad', category: 'MEALS', price: 70, isVeg: true, isVegan: true, isHealthy: true, calories: 210, popularScore: 4.8, description: 'Sprouted moong, chickpeas, diced cucumber, tomatoes, lemon juice, and roasted flax seeds.' },
    { cafeteriaId: createdCafeterias[2].id, name: 'Acai & Berry Protein Smoothie', category: 'BEVERAGES', price: 90, isVeg: true, isVegan: true, isHealthy: true, calories: 240, popularScore: 4.9, description: '24g plant protein with mixed blueberries, strawberries, chia seeds, and almond milk.' },
    { cafeteriaId: createdCafeterias[2].id, name: 'Avocado Multigrain Toast', category: 'BREAKFAST', price: 95, isVeg: true, isVegan: true, isHealthy: true, calories: 280, popularScore: 4.5, description: 'Hass avocado mash on toasted artisanal multigrain bread with chili flakes.' },
    { cafeteriaId: createdCafeterias[2].id, name: 'Seasonal Fresh Fruit Bowl', category: 'SNACKS', price: 65, isVeg: true, isVegan: true, isHealthy: true, calories: 150, popularScore: 4.7, description: 'Crisp pomegranate, papaya, kiwi, and apple sprinkled with chaat masala.' },

    // South Spice Tiffin Corner
    { cafeteriaId: createdCafeterias[3].id, name: 'Ghee Podi Thatte Idli', category: 'BREAKFAST', price: 50, isVeg: true, isVegan: false, isHealthy: true, calories: 290, popularScore: 4.9, description: 'Soft Karnataka thatte idli smeared with aromatic spiced gun-powder and fresh cow ghee.' },
    { cafeteriaId: createdCafeterias[3].id, name: 'Crispy Medu Vada (2 Pcs)', category: 'SNACKS', price: 45, isVeg: true, isVegan: true, isHealthy: false, calories: 310, popularScore: 4.6, description: 'Crunchy golden urad dal fritters served with coconut chutney.' },
    { cafeteriaId: createdCafeterias[3].id, name: 'Authentic Degree Filter Coffee', category: 'BEVERAGES', price: 25, isVeg: true, isVegan: false, isHealthy: true, calories: 80, popularScore: 5.0, description: 'Traditional South Indian chicory blend served hot in brass tumbler.' },

    // Kathi Junction
    { cafeteriaId: createdCafeterias[4].id, name: 'Spicy Paneer Tikka Kathi Roll', category: 'SNACKS', price: 80, isVeg: true, isVegan: false, isHealthy: false, calories: 430, popularScore: 4.7, description: 'Char-grilled cottage cheese chunks rolled in flakey paratha with mint sauce & pickled onions.' },
    { cafeteriaId: createdCafeterias[4].id, name: 'Double Egg Chicken Roll', category: 'MEALS', price: 110, isVeg: false, isVegan: false, isHealthy: false, calories: 560, popularScore: 4.8, description: 'Juicy spiced chicken bhuna wrapped in a double egg-layered paratha.' },

    // Night Owls Canteen
    { cafeteriaId: createdCafeterias[5].id, name: 'Cheese Maggi Double Masala', category: 'SNACKS', price: 50, isVeg: true, isVegan: false, isHealthy: false, calories: 380, popularScore: 4.9, description: 'College midnight staple: Maggi noodles simmered with veggies, extra spices, and grated Amul cheese.' },
    { cafeteriaId: createdCafeterias[5].id, name: 'Butter Egg Bhurji with Pav', category: 'MEALS', price: 65, isVeg: false, isVegan: false, isHealthy: true, calories: 410, popularScore: 4.8, description: '3 scrambled eggs with onions, green chilies, coriander, served with 2 buttery pavs.' },
    { cafeteriaId: createdCafeterias[5].id, name: 'Midnight Cutting Chai', category: 'BEVERAGES', price: 15, isVeg: true, isVegan: false, isHealthy: true, calories: 60, popularScore: 4.9, description: 'Strong, sweet, piping hot tea to fuel late night cram sessions.' }
  ];

  for (const fi of foodItemsData) {
    await prisma.foodItem.create({ data: fi });
  }

  // 7. Events (20+ realistic campus events across categories)
  const eventsData = [
    {
      title: 'HackCampus 2026: 36-Hour National Hackathon',
      description: 'Annual flagship hackathon focusing on AI for Social Good, Smart Cities, and Autonomous Systems. ₹2.5 Lakhs prize pool with top tech recruiters.',
      category: 'HACKATHONS',
      date: '2026-09-12',
      startTime: '09:00 AM',
      endTime: '09:00 PM',
      locationName: 'Nalanda Main Auditorium & CS Block',
      organizerName: 'Google Developer Student Club & ACM Student Chapter',
      organizerId: facultyUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      maxParticipants: 350,
      isFree: true
    },
    {
      title: 'Keynote: Next-Gen Agentic AI & Generative Workflows',
      description: 'Distinguished lecture by Dr. Rajesh Iyer discussing Autonomous AI agents, LLM tool orchestration, and IBM watsonx enterprise deployments.',
      category: 'TECHNICAL',
      date: '2026-09-08',
      startTime: '03:00 PM',
      endTime: '05:00 PM',
      locationName: 'Ramanujan Computing Center, Room 401',
      organizerName: 'Department of Computer Science & AI',
      organizerId: facultyUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      maxParticipants: 180,
      isFree: true
    },
    {
      title: 'Tarangini 2026: Campus Battle of the Bands',
      description: 'The premier inter-college musical showdown! Live rock, fusion, and indie performances from 12 college bands across the region.',
      category: 'CULTURAL',
      date: '2026-09-15',
      startTime: '06:00 PM',
      endTime: '10:30 PM',
      locationName: 'Open Air Amphitheater & Student Activity Center',
      organizerName: 'Campus Cultural Affairs Committee',
      organizerId: adminUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      maxParticipants: 1000,
      isFree: true
    },
    {
      title: 'Inter-Hostel Football Cup Quarterfinals',
      description: 'High-voltage clash: Kaveri Boys Hostel vs Brahmaputra Warriors for a spot in the championship finals.',
      category: 'SPORTS',
      date: '2026-09-09',
      startTime: '05:00 PM',
      endTime: '07:30 PM',
      locationName: 'Dhyan Chand Sports Complex Main Stadium',
      organizerName: 'Campus Sports Council',
      organizerId: adminUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      maxParticipants: 500,
      isFree: true
    },
    {
      title: 'Hands-on ROS2 Robotics & Drone Workshop',
      description: 'Build and program autonomous quadcopter drones using Robot Operating System 2 and computer vision navigation sensors.',
      category: 'WORKSHOPS',
      date: '2026-09-10',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      locationName: 'MakerSpace 3D Prototyping Lab',
      organizerName: 'Robotics & Mechatronics Society',
      organizerId: facultyUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800',
      maxParticipants: 50,
      isFree: false
    },
    {
      title: 'Campus Placement Strategy & Tech Interview Prep',
      description: 'Alumni working at Google, Microsoft, and Amazon share resume frameworks, Leetcode roadmap, and system design mock rounds.',
      category: 'PLACEMENT',
      date: '2026-09-11',
      startTime: '04:00 PM',
      endTime: '06:30 PM',
      locationName: 'Aryabhata Academic Hall B',
      organizerName: 'Career Development & Placement Cell',
      organizerId: adminUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
      maxParticipants: 250,
      isFree: true
    },
    {
      title: 'Astronomy Club: Celestial Stargazing Night',
      description: 'Observation of Saturns rings and lunar craters using the campus Celestron 11-inch Schmidt-Cassegrain telescope.',
      category: 'CLUBS',
      date: '2026-09-13',
      startTime: '08:30 PM',
      endTime: '11:00 PM',
      locationName: 'Aryabhata Complex Observatory Terrace',
      organizerName: 'Antariksh Astronomy Club',
      organizerId: facultyUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800',
      maxParticipants: 120,
      isFree: true
    },
    {
      title: 'Campus Chess Grand Prix: Blitz Tournament',
      description: 'FIDE-rated 5-minute + 3-second increment Swiss tournament. Medals, trophies, and rating prizes up for grabs.',
      category: 'COMPETITIONS',
      date: '2026-09-14',
      startTime: '02:00 PM',
      endTime: '07:00 PM',
      locationName: 'Student Activity Center Games Lounge',
      organizerName: 'Campus Chess Club',
      organizerId: adminUser.id,
      imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800',
      maxParticipants: 64,
      isFree: true
    }
  ];

  for (const ev of eventsData) {
    const createdEvent = await prisma.event.create({ data: ev });
    // Add RSVP for Alex Sharma to the first event
    if (ev.category === 'HACKATHONS') {
      await prisma.eventRsvp.create({
        data: {
          eventId: createdEvent.id,
          userId: studentUser.id,
          status: 'REGISTERED'
        }
      });
    }
  }

  // 8. Lost & Found Items with AI Semantic Pairings
  // Pair 1: Black JBL Wireless Headphones
  const lostItem1 = await prisma.lostItem.create({
    data: {
      userId: studentUser.id,
      title: 'Black JBL Wireless Headphones',
      category: 'ELECTRONICS',
      description: 'Black JBL Tune 760NC over-ear noise-cancelling headphones left near the Anna Food Court center table.',
      color: 'Black',
      lostDate: '2026-09-07',
      locationName: 'Anna Food Court',
      contactPreference: 'IN_APP',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    }
  });

  const foundItem1 = await prisma.foundItem.create({
    data: {
      userId: createdPeers[0].id,
      title: 'Black Wireless Over-Ear Headphones',
      category: 'ELECTRONICS',
      description: 'Found black bluetooth headphones in a protective pouch on Table 14 of the food court.',
      color: 'Black',
      foundDate: '2026-09-07',
      locationName: 'Anna Food Court Main Floor',
      contactMethod: 'CAMPUS_SECURITY_DESK',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    }
  });

  // Create semantic match pairing between lostItem1 and foundItem1
  await prisma.itemMatch.create({
    data: {
      lostItemId: lostItem1.id,
      foundItemId: foundItem1.id,
      confidenceScore: 89,
      matchReason: 'Strong match on electronics category, black color, over-ear headphone description, and exact same location (Anna Food Court) on 2026-09-07.',
      status: 'PENDING'
    }
  });

  // Pair 2: Student ID Card
  const lostItem2 = await prisma.lostItem.create({
    data: {
      userId: createdPeers[1].id,
      title: 'College ID Card - Mechanical Dept',
      category: 'ID_CARDS',
      description: 'Rohan Verma college lanyard with green ribbon and smart RFID card.',
      color: 'Green & White',
      lostDate: '2026-09-06',
      locationName: 'Central Library Steps',
      contactPreference: 'IN_APP',
      status: 'ACTIVE'
    }
  });

  const foundItem2 = await prisma.foundItem.create({
    data: {
      userId: createdPeers[2].id,
      title: 'Student Smart ID Card with Green Lanyard',
      category: 'ID_CARDS',
      description: 'Handed over to library security desk on ground floor.',
      color: 'Green',
      foundDate: '2026-09-06',
      locationName: 'Central Library Entrance',
      contactMethod: 'CAMPUS_SECURITY_DESK',
      status: 'ACTIVE'
    }
  });

  await prisma.itemMatch.create({
    data: {
      lostItemId: lostItem2.id,
      foundItemId: foundItem2.id,
      confidenceScore: 92,
      matchReason: 'Exact category (ID_CARDS), location proximity (Central Library), date alignment, and matching green lanyard description.',
      status: 'CONFIRMED'
    }
  });

  // Additional items
  await prisma.lostItem.create({
    data: {
      userId: createdPeers[3].id,
      title: 'Matte Blue HydroFlask Water Bottle',
      category: 'ACCESSORIES',
      description: '32oz blue steel bottle with GitHub and Linux stickers.',
      color: 'Blue',
      lostDate: '2026-09-05',
      locationName: 'Ramanujan Lab 304',
      status: 'ACTIVE'
    }
  });

  await prisma.foundItem.create({
    data: {
      userId: createdPeers[4].id,
      title: 'Blue Metallic Sports Flask with Stickers',
      category: 'ACCESSORIES',
      description: 'Retrieved from CS block 3rd floor corridor by cleaning staff.',
      color: 'Blue',
      foundDate: '2026-09-05',
      locationName: 'CS Block 3rd Floor',
      status: 'ACTIVE'
    }
  });

  await prisma.lostItem.create({
    data: {
      userId: createdPeers[5].id,
      title: 'Logitech Wireless Mouse M331 Silent',
      category: 'ELECTRONICS',
      description: 'Dark grey ergonomic mouse with USB nano receiver.',
      color: 'Grey',
      lostDate: '2026-09-04',
      locationName: 'Central Library 2nd Floor',
      status: 'ACTIVE'
    }
  });

  // 9. Roommate Profiles with 5-Dimensional Vector Compatibility
  // Alex Sharma's profile (Current User)
  await prisma.roommateProfile.create({
    data: {
      userId: studentUser.id,
      preferredHostel: 'Kaveri Hostel',
      roomType: 'DOUBLE',
      sleepSchedule: 'NIGHT_OWL',       // Sleeps 1am-2am, wakes 8am
      studyHabits: 'BALANCED',          // Mix of solo coding and quiet teamwork
      cleanliness: 'METICULOUS',        // Keeps desk neat, daily bed making
      foodPreference: 'VEGETARIAN',
      noiseTolerance: 'MEDIUM',
      smokingPreference: 'NON_SMOKER',
      pets: 'NO_PETS',
      socialPreference: 'AMBIVERT',
      budget: 8000,
      department: 'Computer Science & Engineering',
      year: 3,
      bio: 'Junior CS student passionate about building AI apps. Love late-night hackathons and peaceful coding sessions with lo-fi beats.'
    }
  });

  // Peer Roommate Profiles (with calculated 80%+ compatibility)
  const roommateProfilesData = [
    {
      userId: createdPeers[3].id, // Kabir Nair
      preferredHostel: 'Kaveri Hostel',
      roomType: 'DOUBLE',
      sleepSchedule: 'NIGHT_OWL',
      studyHabits: 'SILENT_SOLO',
      cleanliness: 'METICULOUS',
      foodPreference: 'VEGETARIAN',
      noiseTolerance: 'MEDIUM',
      smokingPreference: 'NON_SMOKER',
      pets: 'NO_PETS',
      socialPreference: 'INTROVERT',
      budget: 8500,
      department: 'Computer Science & Engineering',
      year: 4,
      bio: 'Senior CS student working on compiler design and distributed systems. Quiet, orderly, and respectful of personal space.'
    },
    {
      userId: createdPeers[1].id, // Rohan Verma
      preferredHostel: 'Kaveri Hostel',
      roomType: 'DOUBLE',
      sleepSchedule: 'NIGHT_OWL',
      studyHabits: 'BALANCED',
      cleanliness: 'MODERATE',
      foodPreference: 'ANY',
      noiseTolerance: 'HIGH',
      smokingPreference: 'NON_SMOKER',
      pets: 'NO_PETS',
      socialPreference: 'EXTROVERT',
      budget: 7500,
      department: 'Mechanical Engineering',
      year: 2,
      bio: 'Automotive club lead. Hard worker, friendly, plays casual badminton in the evenings.'
    },
    {
      userId: createdPeers[5].id, // Aarav Joshi
      preferredHostel: 'Kaveri Hostel',
      roomType: 'DOUBLE',
      sleepSchedule: 'FLEXIBLE',
      studyHabits: 'GROUP_STUDY',
      cleanliness: 'MODERATE',
      foodPreference: 'VEGETARIAN',
      noiseTolerance: 'MEDIUM',
      smokingPreference: 'NON_SMOKER',
      pets: 'NO_PETS',
      socialPreference: 'AMBIVERT',
      budget: 8000,
      department: 'Electrical Engineering',
      year: 3,
      bio: 'Embedded systems tinkerer. Looking for a neat and chill roommate for the upcoming academic year.'
    },
    {
      userId: createdPeers[0].id, // Priya Patel
      preferredHostel: 'Ganga Hostel',
      roomType: 'DOUBLE',
      sleepSchedule: 'EARLY_BIRD',
      studyHabits: 'SILENT_SOLO',
      cleanliness: 'METICULOUS',
      foodPreference: 'VEGETARIAN',
      noiseTolerance: 'LOW',
      smokingPreference: 'NON_SMOKER',
      pets: 'NO_PETS',
      socialPreference: 'INTROVERT',
      budget: 8000,
      department: 'Information Technology',
      year: 3,
      bio: 'Organized morning person who loves structured study hours and quiet reading.'
    },
    {
      userId: createdPeers[2].id, // Ananya Sen
      preferredHostel: 'Ganga Hostel',
      roomType: 'DOUBLE',
      sleepSchedule: 'NIGHT_OWL',
      studyHabits: 'BALANCED',
      cleanliness: 'METICULOUS',
      foodPreference: 'VEGETARIAN',
      noiseTolerance: 'MEDIUM',
      smokingPreference: 'NON_SMOKER',
      pets: 'NO_PETS',
      socialPreference: 'AMBIVERT',
      budget: 9000,
      department: 'Electronics & Communication',
      year: 3,
      bio: 'Design head for campus magazine. Organized, friendly, and mindful of roommate privacy.'
    }
  ];

  for (const rp of roommateProfilesData) {
    await prisma.roommateProfile.create({ data: rp });
  }

  // Create an initial roommate connection request for Alex Sharma
  await prisma.roommateConnection.create({
    data: {
      requesterId: createdPeers[3].id,
      targetId: studentUser.id,
      status: 'PENDING',
      compatibilityScore: 94,
      message: 'Hey Alex! Our sleep schedules, study focus, and cleanliness preferences are an exact 94% match. Would love to room together in Kaveri Block A next semester.'
    }
  });

  // 10. Knowledge Base for AI Grounded Search (No Hallucinations)
  const kbData = [
    {
      title: 'Central Library Operating Hours & Printing Policy',
      category: 'TIMINGS',
      keywords: 'library, printing, xerox, books, study, timings, late night',
      content: 'The Dr. A.P.J. Abdul Kalam Central Library operates from 08:00 AM to 11:00 PM on all weekdays, and 09:00 AM to 06:00 PM on Sundays. The 24x7 Digital Printing & Xerox kiosk is located in Room 102 on the 1st floor. Black-and-white printing is subsidized at ₹2 per page; color prints are ₹10 per page. Digital payment via UPI is supported.'
    },
    {
      title: 'Campus Emergency Medical Protocols & Contact Numbers',
      category: 'EMERGENCY',
      keywords: 'emergency, medical, doctor, clinic, ambulance, first aid, helpline, health',
      content: 'The Dhanvantari Health Center is open 24x7 for all registered students, staff, and faculty. Emergency Ambulance hotline: +91 80 2345 6789. Resident physician Dr. Meenakshi Sundaram is reachable at +91 80 2345 6790. Basic pharmaceuticals, asthma nebulizers, and first-aid dressings are free of charge.'
    },
    {
      title: 'Hostel Curfew, Security & Guest Policies',
      category: 'RULES',
      keywords: 'hostel, curfew, gate, night out, permission, warden, guests, entry',
      content: 'Hostel main gates close at 11:30 PM. Late entries up to 12:30 AM require biometric logging at the security gate. Night-out permissions must be filed digitally on the Campus Portal by 07:00 PM with warden approval. Non-resident campus guests are permitted in common lounge areas between 09:00 AM and 08:00 PM only.'
    },
    {
      title: 'Campus Wi-Fi Setup (eduroam & CampusNet)',
      category: 'FACILITIES',
      keywords: 'wifi, internet, eduroam, network, password, login, vpn, it desk',
      content: 'High-speed 1 Gbps Wi-Fi is accessible campus-wide. Connect to SSID "CampusNet-Secure" using your college email (@college.edu) and college portal password. For international roaming, connect to "eduroam". For connectivity issues, contact IT Helpdesk at Ramanujan Building Room 105 or email support@college.edu.'
    },
    {
      title: 'Anna Food Court Timings & Dietary Options',
      category: 'FACILITIES',
      keywords: 'food, lunch, dinner, breakfast, cafeteria, veg, diet, timings, healthy',
      content: 'Anna Food Court operates from 07:30 AM to 10:30 PM. Breakfast is served from 07:30 AM to 10:30 AM; Lunch from 12:00 PM to 03:00 PM; Evening Snacks from 04:30 PM to 07:00 PM; Dinner from 07:30 PM to 10:30 PM. Dedicated pure vegetarian kitchens, gluten-free, and high-protein bowls are available at Green Bites stall.'
    },
    {
      title: 'Campus Transportation & Electric Shuttle Bus Schedule',
      category: 'TRANSPORT',
      keywords: 'bus, shuttle, transport, gate, hostel, electric van, transit, schedule',
      content: 'Eco-friendly electric campus shuttles run every 12 minutes between 07:30 AM and 10:30 PM connecting Main Entrance Gate, Academic Complex, Central Library, Food Court, and Hostel Blocks. Rides are complimentary for students with a valid ID card.'
    }
  ];

  for (const kb of kbData) {
    await prisma.knowledgeBase.create({ data: kb });
  }

  // 11. Initial Notifications for Alex Sharma
  const notificationsData = [
    {
      userId: studentUser.id,
      title: 'Potential Lost & Found Match!',
      message: 'A Black Wireless Over-Ear Headphone was reported found at Anna Food Court that matches your lost item with 89% confidence.',
      type: 'MATCH',
      linkUrl: '/lost-found'
    },
    {
      userId: studentUser.id,
      title: 'New Roommate Connection Request',
      message: 'Kabir Nair (94% Compatibility Match) sent you a roommate connection request for Kaveri Hostel Block A.',
      type: 'ROOMMATE',
      linkUrl: '/roommate'
    },
    {
      userId: studentUser.id,
      title: 'Upcoming Event: HackCampus 2026',
      message: 'HackCampus 2026 kicks off this Saturday at 09:00 AM in Nalanda Main Auditorium.',
      type: 'EVENT',
      linkUrl: '/events'
    },
    {
      userId: studentUser.id,
      title: 'Campus Advisory',
      message: 'Electric shuttle maintenance scheduled for Sunday morning. Normal schedule resumes at 01:00 PM.',
      type: 'ANNOUNCEMENT',
      linkUrl: '/dashboard'
    }
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // 12. Pre-seed a sample AI conversation for demo
  const sampleConvo = await prisma.aiConversation.create({
    data: {
      userId: studentUser.id,
      title: 'Campus Exploration & Food'
    }
  });

  await prisma.aiMessage.create({
    data: {
      conversationId: sampleConvo.id,
      sender: 'USER',
      content: 'What events are happening on campus today?',
      intent: 'EVENT_DISCOVERY'
    }
  });

  await prisma.aiMessage.create({
    data: {
      conversationId: sampleConvo.id,
      sender: 'ASSISTANT',
      content: 'Here are the top events happening on campus today, including the Keynote on Next-Gen Agentic AI at Ramanujan Center.',
      intent: 'EVENT_DISCOVERY',
      structuredData: JSON.stringify({
        cards: [
          {
            type: 'event',
            data: {
              title: 'Keynote: Next-Gen Agentic AI & Generative Workflows',
              category: 'TECHNICAL',
              time: '03:00 PM - 05:00 PM',
              venue: 'Ramanujan Computing Center, Room 401',
              organizer: 'Department of Computer Science & AI'
            }
          }
        ]
      })
    }
  });

  console.log('✅ CampusAI database seeded successfully!');
  console.log('Demo Accounts:');
  console.log('  Student: student@college.edu / password123');
  console.log('  Faculty: faculty@college.edu / password123');
  console.log('  Admin:   admin@college.edu / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

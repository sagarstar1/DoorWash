require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Package = require('../models/Package');

const seed = async () => {
  await connectDB();

  await User.deleteMany();
  await Package.deleteMany();

  // Seed admin
  await User.create({
    name: 'DoorWash Admin',
    email: 'admin@doorwash.in',
    phone: '+919999999999',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
    isApproved: true,
  });

  // Seed workers
  await User.create([
    {
      name: 'Rahul Kumar',
      email: 'rahul@doorwash.in',
      phone: '+919876543210',
      password: 'Worker@1234',
      role: 'worker',
      isVerified: true,
      isApproved: true,
      isAvailable: true,
      rating: 4.8,
      totalRatings: 32,
    },
    {
      name: 'Amit Singh',
      email: 'amit@doorwash.in',
      phone: '+919876543211',
      password: 'Worker@1234',
      role: 'worker',
      isVerified: true,
      isApproved: true,
      isAvailable: true,
      rating: 4.6,
      totalRatings: 28,
    },
  ]);

  // Seed customer
  await User.create({
    name: 'Priya Sharma',
    email: 'customer@doorwash.in',
    phone: '+919876543212',
    password: 'Customer@1234',
    role: 'customer',
    isVerified: true,
    loyaltyPoints: 50,
    vehicles: [
      { type: 'car', brand: 'Honda', model: 'City', plate: 'HR26AB1234', color: 'White' },
    ],
  });

  // Seed packages
  await Package.create([
    {
      name: 'Express Wash',
      description: 'Quick exterior wash using premium foam and microfiber towels.',
      price: 299,
      duration: 30,
      vehicleTypes: ['car', 'bike'],
      services: ['Exterior foam wash', 'Wheel rinse', 'Glass cleaning', 'Air freshener'],
      tier: 'basic',
    },
    {
      name: 'Premium Wash',
      description: 'Full interior + exterior detail wash with tyre shine and dashboard clean.',
      price: 599,
      duration: 60,
      vehicleTypes: ['car', 'suv'],
      services: [
        'Exterior foam wash', 'Interior vacuum', 'Dashboard wipe', 'Seat cleaning',
        'Tyre shine', 'Glass polish', 'Air freshener',
      ],
      tier: 'premium',
    },
    {
      name: 'Luxury Detail',
      description: 'Full luxury detailing service — ceramic coating, engine bay cleaning, deep interior steam clean.',
      price: 1499,
      duration: 120,
      vehicleTypes: ['car', 'suv'],
      services: [
        'Ceramic coating layer', 'Engine bay cleaning', 'Steam interior cleaning',
        'Leather conditioning', 'Tyre shine & dress', 'Full polish & wax', 'Odour treatment',
      ],
      tier: 'luxury',
      discountPercent: 10,
    },
    {
      name: 'Monthly Club (4 Washes)',
      description: 'Subscribe and get 4 Premium Washes per month at a discounted rate.',
      price: 1799,
      duration: 60,
      vehicleTypes: ['car', 'suv'],
      services: ['All Premium Wash services x4', 'Priority scheduling', 'Free tyre check'],
      tier: 'premium',
      isSubscription: true,
      subscriptionDays: 30,
      subscriptionWashes: 4,
    },
    {
      name: 'SUV / Truck Wash',
      description: 'Tailored for larger vehicles — SUVs, trucks, MUVs.',
      price: 799,
      duration: 75,
      vehicleTypes: ['suv', 'truck'],
      services: ['Exterior foam wash', 'Underbody rinse', 'Interior vacuum', 'Tyre & rim clean', 'Glass cleaning'],
      tier: 'premium',
    },
  ]);

  console.log('Seeding complete!');
  console.log('Admin:    admin@doorwash.in / Admin@1234');
  console.log('Worker:   rahul@doorwash.in / Worker@1234');
  console.log('Customer: customer@doorwash.in / Customer@1234');
  process.exit();
};

seed().catch(err => { console.error(err); process.exit(1); });

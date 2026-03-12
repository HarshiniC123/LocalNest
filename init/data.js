const listings = [
{
  title: "Cozy Beach House",
  description: "Beautiful beach house with sea view.",
  image: {
    filename: "listingimage",
    url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511"
  },
  price: 3500,
  location: "Goa",
  country: "India",
  geometry: {
    type: "Point",
    coordinates: [73.8278, 15.4989]
  }
},
{
  title: "Mountain Cabin Retreat",
  description: "Peaceful wooden cabin surrounded by mountains.",
  image: {
    filename: "listingimage",
    url: "https://images.unsplash.com/photo-1449844908441-8829872d2607"
  },
  price: 2800,
  location: "Manali",
  country: "India",
  geometry: {
    type: "Point",
    coordinates: [77.1892, 32.2396]
  }
},
{
  title: "Luxury Apartment",
  description: "Modern apartment in the heart of the city.",
  image: {
    filename: "listingimage",
    url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb"
  },
  price: 4500,
  location: "Mumbai",
  country: "India",
  geometry: {
    type: "Point",
    coordinates: [72.8777, 19.0760]
  }
},
{
  title: "Lake View Villa",
  description: "Luxury villa with lake view and garden.",
  image: {
    filename: "listingimage",
    url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
  },
  price: 5200,
  location: "Udaipur",
  country: "India",
  geometry: {
    type: "Point",
    coordinates: [73.7125, 24.5854]
  }
},
{
  title: "Forest Treehouse",
  description: "Unique treehouse stay surrounded by forest.",
  image: {
    filename: "listingimage",
    url: "https://images.unsplash.com/photo-1472224371017-08207f84aaae"
  },
  price: 3100,
  location: "Wayanad",
  country: "India",
  geometry: {
    type: "Point",
    coordinates: [76.1320, 11.6854]
  }
}
];

module.exports = { data: listings };
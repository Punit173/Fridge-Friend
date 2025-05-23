import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from './supabase'
import Chatbot from './Chatbot'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const FOOD_CATEGORIES = [
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Dessert', label: 'Dessert' },
  { value: 'Other', label: 'Other' },
]

const LOCATIONS = {
  'Food Banks': [
    { name: 'Roti Bank', lat: 19.0760, lng: 72.8777, capacity: 800 },
    { name: 'Annapurna Rasoi', lat: 19.2183, lng: 72.8479, capacity: 500 },
    { name: 'Sewa Sadan', lat: 18.9972, lng: 72.8344, capacity: 400 }
  ],
  'Restaurants & Hotels': [
    { name: 'Taj Hotel Kitchen', lat: 18.9217, lng: 72.8330, surplus: 50 },
    { name: 'Hyatt Regency', lat: 19.1173, lng: 72.8647, surplus: 75 },
    { name: 'ITC Maratha', lat: 19.1096, lng: 72.8494, surplus: 100 }
  ],
  'NGOs & Shelters': [
    { name: 'Goonj Center', lat: 19.0760, lng: 72.8777, needs: 175 },
    { name: 'Helping Hands', lat: 19.0272, lng: 72.8579, needs: 120 },
    { name: 'Akshaya Patra', lat: 19.1302, lng: 72.8746, needs: 200 }
  ],
  'Community Kitchens': [
    { name: 'Mumbai Dabbawalas', lat: 19.0821, lng: 72.8805, capacity: 250 },
    { name: 'Thane Roti Bank', lat: 19.2011, lng: 72.9648, capacity: 300 },
    { name: 'Kalyan Seva Sadan', lat: 19.2456, lng: 73.1238, capacity: 180 }
  ]
}

const DonationDrive = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [route, setRoute] = useState([])
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [selectedCommunityCredits, setSelectedCommunityCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
      if (error) throw error
      setCommunities(data || [])
    } catch (err) {
      console.error('Error fetching communities:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmission = () => {
    alert("Donation Successful")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Calculate credits based on quantity (1 credit per 5kg)
      const credits = Math.floor(parseFloat(quantity) / 5)
      const foodAmount = parseFloat(quantity)

      // First update food_saved_kg
      const { error: foodError } = await supabase.rpc('increment_food_saved', {
        community_id: selectedCommunity,
        amount: foodAmount
      })

      if (foodError) throw foodError

      // Then update credits
      const { error: creditsError } = await supabase.rpc('increment_credits', {
        community_id: selectedCommunity,
        amount: credits
      })

      if (creditsError) throw creditsError

      // Log the donation details
      console.log({
        selectedCategory,
        quantity,
        selectedLocation,
        selectedCommunity,
        credits
      })

      // Reset form
      setSelectedCategory('')
      setQuantity('')
      setSelectedLocation(null)
      setSelectedCommunity('')

      // Refresh communities data
      fetchCommunities()

    } catch (err) {
      console.error('Error submitting donation:', err)
    }
  }

  const handleCommunitySelect = (e) => {
    const communityId = e.target.value
    setSelectedCommunity(communityId)
    if (communityId) {
      const selected = communities.find(c => c.id === communityId)
      setSelectedCommunityCredits(selected?.credits || 0)
    } else {
      setSelectedCommunityCredits(0)
    }
  }

  const center = [19.0760, 72.8777] // Mumbai coordinates

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <Chatbot/>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 h-[600px]">
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {Object.entries(LOCATIONS).map(([category, locations]) =>
                locations.map((location) => (
                  <Marker
                    key={location.name}
                    position={[location.lat, location.lng]}
                    eventHandlers={{
                      click: () => setSelectedLocation(location),
                    }}
                  >
                    <Popup>
                      <div className="text-gray-900">
                        <h3 className="font-bold">{location.name}</h3>
                        <p>{category}</p>
                        {location.capacity && <p>Capacity: {location.capacity} kg</p>}
                        {location.surplus && <p>Surplus: {location.surplus} kg</p>}
                        {location.needs && <p>Needs: {location.needs} kg</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))
              )}
              {route.length > 0 && (
                <Polyline positions={route.map(loc => [loc.lat, loc.lng])} color="red" />
              )}
            </MapContainer>
          </div>

          {/* Form Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Food Donation Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Food Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {FOOD_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Quantity (kg)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="1"
                />
                {quantity && (
                  <div className="mt-2 p-2 bg-blue-900/50 rounded-md">
                    <p className="text-sm text-blue-200">
                      This donation will earn: <span className="font-semibold">{Math.floor(parseFloat(quantity) / 5)} credits</span>
                      <br />
                      <span className="text-xs">(1 credit per 5kg)</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Select Community</label>
                <select
                  value={selectedCommunity}
                  onChange={handleCommunitySelect}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a community</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name} ({community.credits || 0} credits)
                    </option>
                  ))}
                </select>
                {selectedCommunity && (
                  <div className="mt-2 p-2 bg-green-900/50 rounded-md">
                    <p className="text-sm text-green-200">
                      Current Credits: <span className="font-semibold">{selectedCommunityCredits}</span>
                    </p>
                  </div>
                )}
              </div>

              {selectedLocation && (
                <div className="p-4 bg-gray-700 rounded-md">
                  <h3 className="font-medium text-white">Selected Location</h3>
                  <p className="text-gray-300">{selectedLocation.name}</p>
                  <p className="text-sm text-gray-400">
                    {selectedLocation.capacity
                      ? `Capacity: ${selectedLocation.capacity} kg`
                      : selectedLocation.surplus
                        ? `Surplus: ${selectedLocation.surplus} kg`
                        : `Needs: ${selectedLocation.needs} kg`}
                  </p>
                </div>
              )}

              <button
                type="submit"
                onClick={handleSubmission}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Submit Donation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonationDrive
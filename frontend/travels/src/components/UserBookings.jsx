import React, { useState, useEffect } from 'react'
import { bookingService } from '../services/bookingService'

const UserBookings = ({token, userId}) => {
    const [bookings, setBookings] = useState([])
    const [bookingError, setBookingError] = useState(null)

useEffect(()=>{
    const fetchBookings = async()=>{
        if(!token || !userId){
            return
        }
        try {
            const data = await bookingService.getMyBookings()
            console.log("Booking data = ", data)
            setBookings(data)
            console.log("checking for user bookings =", data)

        } catch (error) {
            console.log("fetching details failed", error)
            setBookingError(
                error.message || 'Failed to fetch bookings'
            )
        }
    }
    fetchBookings()
}, [userId, token])
    
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      {bookingError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {bookingError}
        </div>
      )}
      {bookings.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          <p>No bookings found</p>
          <p className="text-sm mt-2">Book a bus to see your booking history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
                  <p><strong>Reference:</strong> {item.booking_reference}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </p>
                  <p><strong>Journey Date:</strong> {item.journey_date}</p>
                  <p><strong>Booking Date:</strong> {item.booking_date}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Bus Information</h3>
                  <p><strong>Bus:</strong> {item.bus?.bus_name} ({item.bus?.number})</p>
                  <p><strong>Route:</strong> {item.bus?.origin} → {item.bus?.destination}</p>
                  <p><strong>Departure:</strong> {item.bus?.departure_time}</p>
                  <p><strong>Arrival:</strong> {item.bus?.arrival_time}</p>
                  <p><strong>Seats:</strong> {item.seats?.map(seat => seat.seat_number).join(', ')}</p>
                  <p><strong>Total Amount:</strong> ${item.total_amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserBookings


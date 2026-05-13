import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ReviewPage.css';

export default function ReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.get(`/bookings/${bookingId}`).then(r => setBooking(r.data.booking)); }, [bookingId]);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { bookingId, rating, comment });
      toast.success('Review submitted! Thanks for the feedback 🙏');
      navigate('/bookings');
    } catch {} finally { setSubmitting(false); }
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  return (
    <DashboardLayout title="Write a Review">
      <div className="review-page">
        <div className="review-card">
          <h2 className="review-title">How was your experience?</h2>
          {booking && (
            <div className="review-booking-info">
              <div className="review-worker-avatar">{booking.worker?.name?.charAt(0)}</div>
              <div>
                <div className="review-worker-name">{booking.worker?.name}</div>
                <div className="review-pkg">{booking.package?.name}</div>
              </div>
            </div>
          )}

          <div className="review-stars">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                className={`review-star ${s <= (hover || rating) ? 'active' : ''}`}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </button>
            ))}
          </div>
          {(hover || rating) > 0 && <div className="review-label">{labels[hover || rating]}</div>}

          <div className="review-field">
            <label>Your feedback (optional)</label>
            <textarea
              rows={4}
              placeholder="Tell us about the service, cleanliness, punctuality..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <button className="review-submit" onClick={handleSubmit} disabled={!rating || submitting}>
            {submitting ? <span className="review-spinner" /> : 'Submit Review'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

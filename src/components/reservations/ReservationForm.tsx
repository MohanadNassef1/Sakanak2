import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/hooks/useRooms';
import { useCreatePayment } from '@/hooks/usePayments';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths } from 'date-fns';
import { CalendarIcon, Loader2, Shield, CreditCard, Home, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReservationFormProps {
  roomId: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ roomId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: room, isLoading: roomLoading } = useRoom(roomId);
  const createPayment = useCreatePayment();

  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [durationMonths, setDurationMonths] = useState(1);

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Room not found</p>
        </CardContent>
      </Card>
    );
  }

  const roomPrice = room.price_per_month * durationMonths;
  const insuranceAmount = room.insurance_amount || 0;
  const platformFee = Math.round(roomPrice * 0.05 * 100) / 100;
  const totalAmount = roomPrice + insuranceAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to reserve this room');
      navigate('/auth');
      return;
    }

    try {
      const result = await createPayment.mutateAsync({
        room_id: roomId,
        check_in_date: format(checkInDate, 'yyyy-MM-dd'),
        duration_months: durationMonths,
      });

      toast.success('Reservation created! Redirecting to payment...');
      
      // In a real implementation, redirect to Paymob payment page
      // For now, show success and navigate to profile
      navigate('/profile');
    } catch (error: any) {
      console.error('Reservation error:', error);
      toast.error(error.message || 'Failed to create reservation');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Reserve This Room
        </CardTitle>
        <CardDescription>
          Secure your spot by making a payment
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Room Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex gap-4">
              {room.photos?.[0] && (
                <img
                  src={room.photos[0]}
                  alt={room.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold">{room.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {room.city}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  EGP {room.price_per_month}/month
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => date && setCheckInDate(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                min={room.min_stay_months || 1}
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
              />
              {room.min_stay_months && room.min_stay_months > 1 && (
                <p className="text-xs text-muted-foreground">
                  Minimum stay: {room.min_stay_months} months
                </p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Price Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Room ({durationMonths} month{durationMonths > 1 ? 's' : ''})</span>
                <span>EGP {roomPrice.toLocaleString()}</span>
              </div>
              {insuranceAmount > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Security Deposit
                  </span>
                  <span>EGP {insuranceAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee (5%)</span>
                <span>EGP {platformFee.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">EGP {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Protected by Sakanak</p>
                <p className="text-muted-foreground">
                  Your payment is secure. The owner will receive the payment only after you confirm you've received the room.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={createPayment.isPending}
          >
            {createPayment.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay EGP {totalAmount.toLocaleString()}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReservationForm;

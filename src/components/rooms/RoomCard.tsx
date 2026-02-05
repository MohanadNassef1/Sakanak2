import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Room } from '@/types/room';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Users, CheckCircle, Home, Cigarette, PawPrint } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSave?: () => void;
  onUnsave?: () => void;
  isSaved?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onSave, onUnsave, isSaved }) => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const roomTypeLabels: Record<string, string> = {
    private_room: t('rooms.privateRoom'),
    shared_room: t('rooms.sharedRoom'),
    studio: t('rooms.studio'),
    apartment: t('rooms.apartment'),
  };

  const defaultImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
  const mainImage = room.photos?.[0] || defaultImage;

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex gap-2`}>
          {room.is_featured && (
            <Badge className="bg-primary text-primary-foreground">
              {t('rooms.featured')}
            </Badge>
          )}
          {room.owner?.verification_status === 'verified' && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('rooms.verified')}
            </Badge>
          )}
        </div>

        {/* Save Button */}
        {(onSave || onUnsave) && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} bg-white/80 hover:bg-white`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isSaved ? onUnsave?.() : onSave?.();
            }}
          >
            <Heart
              className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
            />
          </Button>
        )}

        {/* Price Tag */}
        <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} bg-foreground/90 text-background px-3 py-1.5 rounded-lg`}>
          <span className="font-bold">EGP {room.price_per_month.toLocaleString()}</span>
          <span className="text-sm opacity-80">/{t('rooms.month')}</span>
        </div>
      </div>

      {/* Content */}
      <Link 
        to={`/rooms/${room.id}`}
        onClick={(e) => {
          if (!user) {
            e.preventDefault();
            navigate('/auth');
          }
        }}
      >
        <div className="p-4 space-y-3">
          {/* Title & Type */}
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Home className="w-3 h-3" />
              <span>{roomTypeLabels[room.room_type]}</span>
            </div>
            <h3 className="font-semibold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors">
              {room.title}
            </h3>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">
              {room.area ? `${room.area}, ` : ''}{room.city}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{room.current_roommates}/{room.max_roommates}</span>
            </div>
            {room.allows_smoking && (
              <div className="flex items-center gap-1">
                <Cigarette className="w-4 h-4" />
              </div>
            )}
            {room.allows_pets && (
              <div className="flex items-center gap-1">
                <PawPrint className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Owner */}
          {room.owner && (
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                {room.owner.full_name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-muted-foreground line-clamp-1">
                {room.owner.full_name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default RoomCard;

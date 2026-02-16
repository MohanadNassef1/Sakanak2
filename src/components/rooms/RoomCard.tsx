import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Room } from "@/types/room";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useAdminDeleteRoom } from "@/hooks/useAdminActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Users, CheckCircle, Home, Cigarette, PawPrint, Trash2, BedDouble, DoorOpen, ShieldAlert, Loader2, GraduationCap, Briefcase, Sparkles, Pencil, Clock } from "lucide-react";
import { getAreaLabel, getGovernorateLabel } from "@/lib/locationData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PERSONALITY_TAG_LABELS: Record<string, { en: string; ar: string }> = {
  calm: { en: 'Calm', ar: 'هادئ' },
  social: { en: 'Social', ar: 'اجتماعي' },
  studious: { en: 'Studious', ar: 'مجتهد' },
  night_owl: { en: 'Night Owl', ar: 'سهران' },
  early_bird: { en: 'Early Bird', ar: 'صباحي' },
  clean: { en: 'Clean & Tidy', ar: 'نظيف ومرتب' },
  friendly: { en: 'Friendly', ar: 'ودود' },
  private: { en: 'Private', ar: 'يفضل الخصوصية' },
  organized: { en: 'Organized', ar: 'منظم' },
  creative: { en: 'Creative', ar: 'مبدع' },
};

interface RoomCardProps {
  room: Room;
  onSave?: () => void;
  onUnsave?: () => void;
  isSaved?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
  showDeleteButton?: boolean;
  onRelist?: () => void;
  isRelisting?: boolean;
  hasViewings?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onSave,
  onUnsave,
  isSaved,
  onDelete,
  isDeleting,
  showDeleteButton,
  onRelist,
  isRelisting,
  hasViewings,
}) => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAdminDeleteDialog, setShowAdminDeleteDialog] = useState(false);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const adminDeleteRoom = useAdminDeleteRoom();

  const roomTypeLabels: Record<string, string> = {
    private_room: t("rooms.privateRoom"),

    shared_room: t("rooms.sharedRoom"),

    studio: t("rooms.studio"),

    apartment: t("rooms.apartment"),
  };

  const defaultImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop";

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
        <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} flex gap-2`}>
          {/* Gender Badge - Support both old and new format */}
          {(room.preferred_gender === 'males_only' || room.preferred_gender === 'male') && (
            <Badge className="bg-blue-600 text-white">
              {isRTL ? 'ذكور فقط' : 'Males Only'}
            </Badge>
          )}
          {(room.preferred_gender === 'females_only' || room.preferred_gender === 'female') && (
            <Badge className="bg-pink-600 text-white">
              {isRTL ? 'إناث فقط' : 'Females Only'}
            </Badge>
          )}
          {room.status === 'rented' && (
            <Badge className="bg-emerald-600 text-white">
              {isRTL ? 'مؤجرة' : 'Rented'}
            </Badge>
          )}
          {hasViewings && room.status !== 'rented' && (
            <Badge className="bg-amber-500 text-white">
              <Clock className="w-3 h-3 mr-1" />
              {isRTL ? 'قائمة انتظار' : 'Waiting List'}
            </Badge>
          )}
          {room.is_featured && room.status !== 'rented' && (
            <Badge className="bg-primary text-primary-foreground">{t("rooms.featured")}</Badge>
          )}
          {room.owner?.verification_status === "verified" && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t("rooms.verified")}
            </Badge>
          )}
        </div>

        {/* Admin Delete Button */}
        {isAdmin && !showDeleteButton && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 ${isRTL ? "left-12" : "right-12"} bg-destructive/80 hover:bg-destructive text-white`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAdminDeleteDialog(true);
            }}
            title={isRTL ? "حذف (مشرف)" : "Delete (Admin)"}
          >
            <ShieldAlert className="w-4 h-4" />
          </Button>
        )}

        {/* Save Button */}
        {(onSave || onUnsave) && !showDeleteButton && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} bg-white/80 hover:bg-white`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isSaved ? onUnsave?.() : onSave?.();
            }}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </Button>
        )}

        {/* Edit & Delete Buttons for owner's listings */}
        {showDeleteButton && (
          <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} flex gap-2`}>
            {/* Edit Button */}
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 hover:bg-primary hover:text-primary-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/edit-room/${room.id}`);
              }}
              title={isRTL ? "تعديل" : "Edit"}
            >
              <Pencil className="w-5 h-5" />
            </Button>

            {/* Delete Button */}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/80 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                disabled={isDeleting}
                title={isRTL ? "حذف" : "Delete"}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Relist Button for rented rooms */}
        {showDeleteButton && room.status === 'rented' && onRelist && (
          <Button
            variant="default"
            size="sm"
            className={`absolute bottom-3 ${isRTL ? "right-3" : "left-3"} bg-primary hover:bg-primary/90`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRelist();
            }}
            disabled={isRelisting}
          >
            {isRTL ? 'إعادة الإدراج' : 'Relist'}
          </Button>
        )}

        {/* Price Tag */}

        <div
          className={`absolute bottom-3 ${isRTL ? "left-3" : "right-3"} bg-foreground/90 text-background px-3 py-1.5 rounded-lg`}
        >
          <span className="font-bold">EGP {room.price_per_month.toLocaleString()}</span>

          <span className="text-sm opacity-80">/{t("rooms.month")}</span>
        </div>
      </div>

      {/* Content */}

      <Link
        to={`/rooms/${room.id}`}
        onClick={(e) => {
          if (!user) {
            e.preventDefault();

            // Pass the intended destination so user is redirected after login

            navigate("/auth", { state: { from: `/rooms/${room.id}` } });
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
              {room.area ? `${getAreaLabel(room.area, isRTL)}, ` : ""}
              {getGovernorateLabel(room.city, isRTL)}
            </span>
          </div>

          {/* Meta Info */}

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border flex-wrap">
            {/* Total Bedrooms */}
            {room.total_bedrooms && room.total_bedrooms > 0 && (
              <div className="flex items-center gap-1.5" title={isRTL ? 'عدد الغرف' : 'Bedrooms'}>
                <DoorOpen className="w-4 h-4" />
                <span>{room.total_bedrooms}</span>
              </div>
            )}

            {/* Occupancy */}
            <div className="flex items-center gap-1.5" title={isRTL ? 'الأسرة المشغولة / الإجمالي' : 'Occupied / Total beds'}>
              <BedDouble className="w-4 h-4" />
              <span>
                {room.current_roommates}/{room.max_roommates}
              </span>
            </div>

            {room.allows_smoking && (
              <div className="flex items-center gap-1" title={isRTL ? 'التدخين مسموح' : 'Smoking allowed'}>
                <Cigarette className="w-4 h-4" />
              </div>
            )}

            {room.allows_pets && (
              <div className="flex items-center gap-1" title={isRTL ? 'الحيوانات مسموحة' : 'Pets allowed'}>
                <PawPrint className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Owner/Tenant Info */}
          {room.owner && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                  {room.owner.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground line-clamp-1">{room.owner.full_name}</span>
                    {room.owner.age && (
                      <span className="text-xs text-muted-foreground">({room.owner.age})</span>
                    )}
                  </div>
                  {/* Show occupation/university for Current Tenants */}
                  {room.lister_type === 'current_tenant' && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {room.owner.university ? (
                        <>
                          <GraduationCap className="w-3 h-3" />
                          <span className="line-clamp-1">{room.owner.university}</span>
                        </>
                      ) : room.owner.occupation ? (
                        <>
                          <Briefcase className="w-3 h-3" />
                          <span className="line-clamp-1">{room.owner.occupation}</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
                {/* Lister Type Badge */}
                {room.lister_type === 'current_tenant' && (
                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400">
                    <Users className="w-3 h-3 mr-1" />
                    {isRTL ? 'مستأجر' : 'Tenant'}
                  </Badge>
                )}
              </div>
              
              {/* Personality Tags for Current Tenants */}
              {room.lister_type === 'current_tenant' && room.owner.personality_tags && room.owner.personality_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {room.owner.personality_tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] py-0 px-1.5">
                      {isRTL 
                        ? PERSONALITY_TAG_LABELS[tag]?.ar || tag 
                        : PERSONALITY_TAG_LABELS[tag]?.en || tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("rooms.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("rooms.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("rooms.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Delete Confirmation Dialog */}
      <AlertDialog open={showAdminDeleteDialog} onOpenChange={setShowAdminDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              {isRTL ? "حذف الإعلان (مشرف)" : "Delete Listing (Admin)"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? `هل أنت متأكد من حذف "${room.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Are you sure you want to delete "${room.title}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                adminDeleteRoom.mutate(room.id);
                setShowAdminDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {adminDeleteRoom.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isRTL ? "حذف" : "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomCard;

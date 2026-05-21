import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdminActions";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarLightbox from "@/components/AvatarLightbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Share2,
  Megaphone,
  Eye,
  CalendarClock,
  Sparkles,
} from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

const HEAR_ABOUT_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  google: "Google Search",
  friend: "Friend / Word of mouth",
  university: "University",
  ad: "Online Ad",
  other: "Other",
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const relativeTime = (iso?: string | null) => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export default function AdminUserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin(user?.id);
  const queryClient = useQueryClient();
  const [updatingGender, setUpdatingGender] = useState(false);

  const handleGenderChange = async (newGender: string) => {
    if (!userId) return;
    setUpdatingGender(true);
    const { error } = await supabase
      .from("profiles")
      .update({ gender: newGender as "male" | "female" })
      .eq("user_id", userId);
    setUpdatingGender(false);
    if (error) {
      toast.error(error.message || "Failed to update gender");
      return;
    }
    toast.success("Gender updated");
    queryClient.invalidateQueries({ queryKey: ["admin-user-profile", userId] });
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin && !!userId,
  });

  const { data: referrer } = useQuery({
    queryKey: ["referrer", profile?.referred_by],
    queryFn: async () => {
      if (!profile?.referred_by) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, user_id")
        .eq("referral_code", profile.referred_by)
        .single();
      return data;
    },
    enabled: !!profile?.referred_by,
  });

  // Viewings as tenant or landlord
  const { data: viewings } = useQuery({
    queryKey: ["admin-user-viewings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viewing_requests")
        .select("id, status, proposed_date, proposed_time_start, confirmed_date, confirmed_time, created_at, tenant_id, landlord_id, room_id, rooms(title, city)")
        .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin && !!userId,
  });

  if (!isAdminLoading && !isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
          <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading || isAdminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <Button onClick={() => navigate("/admin/users")} className="mt-4">Back to Users</Button>
        </div>
      </MainLayout>
    );
  }

  const getStatusBadge = (status: VerificationStatus | null) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  const statusPillCls = (s: string) => {
    switch (s) {
      case "rental_confirmed":
      case "completed":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
      case "approved":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30";
      case "pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30";
      case "declined":
      case "cancelled":
        return "bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const hearLabel = profile.hear_about_us
    ? HEAR_ABOUT_LABELS[profile.hear_about_us] || profile.hear_about_us
    : null;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
        </Button>

        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden border-primary/10 shadow-lg">
          <div className="relative h-28 bg-gradient-to-br from-primary/30 via-primary/15 to-accent/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.25),transparent_60%)]" />
          </div>
          <CardContent className="px-6 pb-6 -mt-14">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <AvatarLightbox src={profile.avatar_url} alt={profile.full_name || ""}>
                <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                    {profile.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              </AvatarLightbox>

              <div className="text-center sm:text-left flex-1 sm:pb-2">
                <h1 className="text-2xl font-bold tracking-tight">{profile.full_name}</h1>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                  {getStatusBadge(profile.verification_status as VerificationStatus)}
                  <Select
                    value={profile.gender || undefined}
                    onValueChange={handleGenderChange}
                    disabled={updatingGender}
                  >
                    <SelectTrigger className="h-7 w-32 capitalize">
                      <SelectValue placeholder="Set gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {profile.occupation && <Badge variant="outline">{profile.occupation}</Badge>}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Joined
                </div>
                <p className="mt-1 text-sm font-semibold">{formatDateTime(profile.created_at)}</p>
                <p className="text-xs text-muted-foreground">{relativeTime(profile.created_at)}</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" /> Viewings
                </div>
                <p className="mt-1 text-sm font-semibold">{viewings?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">total requests</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Referrals
                </div>
                <p className="mt-1 text-sm font-semibold">{profile.referral_count || 0}</p>
                <p className="text-xs text-muted-foreground">users invited</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Megaphone className="h-3.5 w-3.5" /> Source
                </div>
                <p className="mt-1 text-sm font-semibold truncate">{hearLabel || "—"}</p>
                <p className="text-xs text-muted-foreground">how they heard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{profile.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm">{profile.phone || "Not provided"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="font-medium text-sm">{formatDateTime(profile.created_at)}</p>
                  <p className="text-xs text-muted-foreground">{relativeTime(profile.created_at)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Megaphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">How they heard about Sakanak</p>
                  <p className="font-medium text-sm">{hearLabel || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Information */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Share2 className="h-4 w-4" />
                </div>
                Referral Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Referral Code</p>
                  <p className="font-medium font-mono text-sm">{profile.referral_code || "Not generated"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Referred By</p>
                  <p className="font-medium text-sm">
                    {referrer ? (
                      <Button
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => navigate(`/admin/user/${referrer.user_id}`)}
                      >
                        {referrer.full_name}
                      </Button>
                    ) : profile.referred_by ? (
                      profile.referred_by
                    ) : (
                      "Direct signup"
                    )}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Referrals Made</p>
                  <p className="font-medium text-sm">{profile.referral_count || 0} users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Viewings activity */}
          <Card className="md:col-span-2 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </div>
                Viewings Activity
                {viewings && viewings.length > 0 && (
                  <Badge variant="secondary" className="rounded-full ml-1">{viewings.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!viewings || viewings.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center border border-dashed rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No viewing requests yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {viewings.map((v: any) => {
                    const isTenant = v.tenant_id === userId;
                    const dateLabel = v.confirmed_date
                      ? `${v.confirmed_date}${v.confirmed_time ? ` · ${v.confirmed_time}` : ""}`
                      : v.proposed_date
                      ? `${v.proposed_date}${v.proposed_time_start ? ` · ${v.proposed_time_start}` : ""}`
                      : formatDateTime(v.created_at);
                      <div
                        key={v.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => v.room_id && navigate(`/rooms/${v.room_id}`)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {v.rooms?.title || "Unknown listing"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                            {v.rooms?.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {v.rooms.city}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {formatDateTime(v.scheduled_at || v.created_at)}
                            </span>
                            <Badge variant="outline" className="text-[10px] py-0">
                              {isTenant ? "as Tenant" : "as Landlord"}
                            </Badge>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium rounded-full border px-2.5 py-1 capitalize ${statusPillCls(v.status)}`}
                        >
                          {String(v.status).replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card className="md:col-span-2 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium text-sm">{profile.age || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="font-medium text-sm">{profile.nationality || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-xs text-muted-foreground">Job Title</p>
                    <p className="font-medium text-sm">{profile.job_title || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {profile.about && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">About</p>
                    <p className="text-sm leading-relaxed">{profile.about}</p>
                  </div>
                </>
              )}

              {profile.looking_for && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Looking For</p>
                    <p className="text-sm leading-relaxed">{profile.looking_for}</p>
                  </div>
                </>
              )}

              {profile.personality_tags && profile.personality_tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Personality Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.personality_tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="capitalize">
                          {tag.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

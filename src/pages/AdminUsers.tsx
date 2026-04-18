import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdminActions";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import {
  Search,
  FileText,
  Eye,
  Trash2,
  Loader2,
  ShieldAlert,
  Users,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  ShieldCheck,
  ShieldOff,
  CheckCircle,
} from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus | null;
  referral_code: string | null;
  referral_count: number | null;
  referred_by: string | null;
  created_at: string;
  is_disabled: boolean;
  disabled_at: string | null;
  disabled_reason: string | null;
  interested_area_1: string | null;
  interested_area_2: string | null;
}

interface VerificationRequest {
  id: string;
  document_type: string;
  document_url: string;
  document_url_front: string | null;
  document_url_back: string | null;
  status: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin(user?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals
  const [documentModalUser, setDocumentModalUser] = useState<UserProfile | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<UserProfile | null>(null);
  const [disableModalUser, setDisableModalUser] = useState<UserProfile | null>(null);
  const [disableReason, setDisableReason] = useState("");

  // Fetch all users (admin only)
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("verification_status", statusFilter as VerificationStatus);
      }

      if (searchQuery) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,referral_code.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!isAdmin,
  });

  // Fetch verification documents for a user
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["user-documents", documentModalUser?.user_id],
    queryFn: async () => {
      if (!documentModalUser) return null;
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", documentModalUser.user_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] as VerificationRequest | undefined;
    },
    enabled: !!documentModalUser,
  });

  // Delete user mutation - uses edge function to delete from auth.users
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to delete user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User permanently deleted");
      setDeleteModalUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  // Soft delete (disable) user mutation
  const disableUserMutation = useMutation({
    mutationFn: async ({ userId, disable, reason }: { userId: string; disable: boolean; reason?: string }) => {
      const updateData: Record<string, unknown> = {
        is_disabled: disable,
        disabled_at: disable ? new Date().toISOString() : null,
        disabled_by: disable ? user?.id : null,
        disabled_reason: disable ? reason : null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(variables.disable ? "User account deactivated" : "User account reactivated");
      setDisableModalUser(null);
      setDisableReason("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });

  // Manual verify/unverify user mutation
  const manualVerifyMutation = useMutation({
    mutationFn: async ({ userId, verify }: { userId: string; verify: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ verification_status: verify ? 'verified' : 'unverified' })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(variables.verify ? "User verified successfully" : "User verification removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update verification status");
    },
  });

  if (!isAdminLoading && !isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view this page.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getStatusBadge = (status: VerificationStatus | null) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-accent text-accent-foreground">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  // Pagination
  const totalUsers = users?.length || 0;
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const paginatedUsers = users?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get referrer name from referral code
  const getReferrerInfo = (referredBy: string | null) => {
    if (!referredBy) return null;
    const referrer = users?.find((u) => u.referral_code === referredBy);
    return referrer?.full_name || referredBy;
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              View and manage all registered users
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or referral code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users?.length || 0}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-primary">
              {users?.filter((u) => u.verification_status === "verified").length || 0}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-accent-foreground">
              {users?.filter((u) => u.verification_status === "pending").length || 0}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Unverified</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {users?.filter((u) => !u.verification_status || u.verification_status === "unverified").length || 0}
            </p>
          </div>
        </div>

        {/* Users Table */}
        {usersLoading || isAdminLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preferred Areas</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers?.map((userProfile) => (
                    <TableRow key={userProfile.id} className={userProfile.is_disabled ? "opacity-60 bg-muted/30" : ""}>
                      {/* User Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={userProfile.avatar_url || ""} />
                              <AvatarFallback>
                                {userProfile.full_name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            {userProfile.is_disabled && (
                              <div className="absolute -bottom-1 -right-1 bg-destructive rounded-full p-0.5">
                                <UserX className="h-3 w-3 text-destructive-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{userProfile.full_name}</p>
                              {userProfile.is_disabled && (
                                <Badge variant="destructive" className="text-xs">Deactivated</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {userProfile.email}
                            </p>
                            {userProfile.phone && (
                              <p className="text-xs text-muted-foreground">
                                {userProfile.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getStatusBadge(userProfile.verification_status)}
                      </TableCell>

                      {/* Preferred Areas */}
                      <TableCell>
                        {(userProfile.interested_area_1 || userProfile.interested_area_2) ? (
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            {userProfile.interested_area_1 && (
                              <Badge variant="outline" className="text-xs w-fit truncate" title={userProfile.interested_area_1}>
                                1. {userProfile.interested_area_1}
                              </Badge>
                            )}
                            {userProfile.interested_area_2 && (
                              <Badge variant="outline" className="text-xs w-fit truncate" title={userProfile.interested_area_2}>
                                2. {userProfile.interested_area_2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>

                      {/* Referred By */}
                      <TableCell>
                        {userProfile.referred_by ? (
                          <span className="text-sm">
                            {getReferrerInfo(userProfile.referred_by)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>

                      {/* Referrals Count */}
                      <TableCell>
                        <Badge variant="outline">
                          {userProfile.referral_count || 0}
                        </Badge>
                      </TableCell>

                      {/* Documents */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDocumentModalUser(userProfile)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Manual verify/unverify */}
                          {userProfile.verification_status === 'verified' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => manualVerifyMutation.mutate({ userId: userProfile.user_id, verify: false })}
                              disabled={manualVerifyMutation.isPending}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              <ShieldOff className="h-4 w-4 mr-1" />
                              Unverify
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => manualVerifyMutation.mutate({ userId: userProfile.user_id, verify: true })}
                              disabled={manualVerifyMutation.isPending}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                              Verify
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/user/${userProfile.user_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Profile
                          </Button>
                          {/* Soft delete toggle */}
                          <Button
                            variant={userProfile.is_disabled ? "default" : "secondary"}
                            size="sm"
                            onClick={() => {
                              if (userProfile.is_disabled) {
                                // Reactivate directly
                                disableUserMutation.mutate({ userId: userProfile.user_id, disable: false });
                              } else {
                                // Show deactivate modal for reason
                                setDisableModalUser(userProfile);
                              }
                            }}
                            disabled={disableUserMutation.isPending}
                          >
                            {userProfile.is_disabled ? (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            ) : (
                              <>
                                <UserX className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            )}
                          </Button>
                          {/* Hard delete */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteModalUser(userProfile)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!paginatedUsers || paginatedUsers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)} of {totalUsers} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Document Modal */}
        <Dialog
          open={!!documentModalUser}
          onOpenChange={() => setDocumentModalUser(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Verification Documents - {documentModalUser?.full_name}
              </DialogTitle>
              <DialogDescription>
                View uploaded ID/passport documents for verification
              </DialogDescription>
            </DialogHeader>

            {documentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : documents ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>{documents.document_type}</Badge>
                  <Badge variant={documents.status === "approved" ? "default" : "secondary"}>
                    {documents.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.document_url_front && (
                    <div>
                      <p className="text-sm font-medium mb-2">Front</p>
                      <img
                        src={documents.document_url_front}
                        alt="Document front"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}
                  {documents.document_url_back && (
                    <div>
                      <p className="text-sm font-medium mb-2">Back</p>
                      <img
                        src={documents.document_url_back}
                        alt="Document back"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}
                  {!documents.document_url_front && !documents.document_url_back && documents.document_url && (
                    <div className="col-span-full">
                      <img
                        src={documents.document_url}
                        alt="Document"
                        className="w-full rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDocumentModalUser(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <AlertDialog
          open={!!deleteModalUser}
          onOpenChange={() => setDeleteModalUser(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Delete User Permanently?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  You are about to permanently delete{" "}
                  <strong>{deleteModalUser?.full_name}</strong> ({deleteModalUser?.email}).
                </p>
                <p className="text-destructive font-medium">
                  ⚠️ This action cannot be undone. All user data including their listings,
                  viewings, messages, and verification documents will be permanently removed.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => {
                  if (deleteModalUser) {
                    deleteUserMutation.mutate(deleteModalUser.user_id);
                  }
                }}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Yes, Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Deactivate User Modal (Soft Delete) */}
        <Dialog
          open={!!disableModalUser}
          onOpenChange={() => {
            setDisableModalUser(null);
            setDisableReason("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-destructive" />
                Deactivate User Account
              </DialogTitle>
              <DialogDescription>
                Deactivating <strong>{disableModalUser?.full_name}</strong> ({disableModalUser?.email}) will prevent them from logging in while keeping their data intact.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for deactivation (optional)</label>
                <Textarea
                  placeholder="Enter reason for deactivating this account..."
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">What happens when deactivated:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• User cannot log in to their account</li>
                  <li>• All user data (listings, messages, etc.) is preserved</li>
                  <li>• You can reactivate the account at any time</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDisableModalUser(null);
                  setDisableReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (disableModalUser) {
                    disableUserMutation.mutate({
                      userId: disableModalUser.user_id,
                      disable: true,
                      reason: disableReason || undefined,
                    });
                  }
                }}
                disabled={disableUserMutation.isPending}
              >
                {disableUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserX className="h-4 w-4 mr-2" />
                )}
                Deactivate Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

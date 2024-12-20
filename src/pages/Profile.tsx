import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Key, Trash } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("John Doe"); // Replace with actual user data
  const [tempName, setTempName] = useState(displayName);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveName = () => {
    // TODO: Implement save name logic
    setDisplayName(tempName);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Your display name has been updated.",
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password change logic
    setIsChangePasswordOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast({
      title: "Success",
      description: "Your password has been updated.",
    });
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion logic
    setIsDeleteAccountOpen(false);
    navigate("/");
    toast({
      title: "Account Deleted",
      description: "Your account has been successfully deleted.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            className="hover:bg-background/60"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* Page Title */}
          <h1 className="text-3xl font-bold">Your Profile</h1>

          {/* Basic User Information */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="flex items-center gap-4">
              {isEditing ? (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button onClick={handleSaveName}>Save</Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setTempName(displayName);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-lg">{displayName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </section>

          {/* Account Security */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Account Security</h2>
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(true)}
            >
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </section>

          {/* Account Deletion */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-destructive">
              Delete Account
            </h2>
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteAccountOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </section>
        </div>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Yes, Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
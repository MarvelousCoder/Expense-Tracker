// // src/app/(dashboard)/settings/page.tsx
// "use client"

// import { useState } from "react"
// import { useAuthStore } from "@/store/auth.store"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import {
//     Select, SelectContent, SelectItem,
//     SelectTrigger, SelectValue,
// } from "@/components/ui/select"
// import {
//     Dialog, DialogContent, DialogHeader,
//     DialogTitle, DialogFooter, DialogDescription,
// } from "@/components/ui/dialog"
// import { Loader2 } from "lucide-react"
// import { toast } from "sonner"
// import api from "@/lib/api"
// import { ThemeToggle } from "@/components/shared/theme-toggle"

// export default function SettingsPage() {
//     const { user, setUser, logout } = useAuthStore()

//     // Profile
//     const [fullName, setFullName] = useState(user?.full_name ?? "")
//     const [currency, setCurrency] = useState(user?.currency ?? "INR")
//     const [savingProfile, setSavingProfile] = useState(false)

//     // Password
//     const [currentPassword, setCurrentPassword] = useState("")
//     const [newPassword, setNewPassword] = useState("")
//     const [confirmPassword, setConfirmPassword] = useState("")
//     const [savingPassword, setSavingPassword] = useState(false)

//     // Delete account dialog
//     const [deleteOpen, setDeleteOpen] = useState(false)
//     const [deleting, setDeleting] = useState(false)

//     const handleSaveProfile = async () => {
//         if (!fullName.trim()) return
//         setSavingProfile(true)
//         try {
//             const updated = await api.patch<any>("/users/me", {
//                 full_name: fullName.trim(),
//                 currency,
//             })
//             setUser({ ...user!, full_name: updated.full_name, currency: updated.currency })
//             toast.success("Profile updated successfully")
//         } catch {
//             toast.error("Failed to update profile")
//         } finally {
//             setSavingProfile(false)
//         }
//     }

//     const handleChangePassword = async () => {
//         if (!currentPassword || !newPassword || !confirmPassword) return
//         if (newPassword !== confirmPassword) {
//             toast.error("New passwords do not match")
//             return
//         }
//         if (newPassword.length < 8) {
//             toast.error("Password must be at least 8 characters")
//             return
//         }
//         setSavingPassword(true)
//         try {
//             await api.post("/users/me/change-password", {
//                 current_password: currentPassword,
//                 new_password: newPassword,
//                 confirm_password: confirmPassword,
//             })
//             setCurrentPassword("")
//             setNewPassword("")
//             setConfirmPassword("")
//             toast.success("Password changed successfully")
//         } catch (error: any) {
//             toast.error(error?.message || "Failed to change password")
//         } finally {
//             setSavingPassword(false)
//         }
//     }

//     const handleDeleteAccount = async () => {
//         setDeleting(true)
//         try {
//             await api.delete("/users/me")
//             logout()
//         } catch {
//             toast.error("Failed to delete account")
//             setDeleting(false)
//         }
//     }

//     return (
//         <div className="space-y-6 page-enter max-w-2xl">
//             <div>
//                 <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
//                 <p className="text-muted-foreground text-sm mt-1">
//                     Manage your profile, security, and preferences
//                 </p>
//             </div>

//             {/* Profile */}
//             <Card className="p-6 space-y-5">
//                 <div>
//                     <h3 className="font-semibold">Profile</h3>
//                     <p className="text-sm text-muted-foreground mt-0.5">
//                         Update your display name and account details
//                     </p>
//                 </div>
//                 <Separator />

//                 <div className="space-y-4">
//                     <div className="space-y-1.5">
//                         <Label htmlFor="full-name">Full name</Label>
//                         <Input
//                             id="full-name"
//                             value={fullName}
//                             onChange={(e) => setFullName(e.target.value)}
//                             placeholder="Your full name"
//                         />
//                     </div>

//                     <div className="space-y-1.5">
//                         <Label>Email</Label>
//                         <Input
//                             value={user?.email ?? ""}
//                             disabled
//                             className="bg-muted text-muted-foreground cursor-not-allowed"
//                         />
//                         <p className="text-xs text-muted-foreground">
//                             Email cannot be changed
//                         </p>
//                     </div>

//                     <div className="space-y-1.5">
//                         <Label>Username</Label>
//                         <Input
//                             value={user?.username ?? ""}
//                             disabled
//                             className="bg-muted text-muted-foreground cursor-not-allowed"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex justify-end">
//                     <Button
//                         onClick={handleSaveProfile}
//                         disabled={savingProfile || !fullName.trim()}
//                     >
//                         {savingProfile
//                             ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
//                             : "Save Profile"
//                         }
//                     </Button>
//                 </div>
//             </Card>

//             {/* Security */}
//             <Card className="p-6 space-y-5">
//                 <div>
//                     <h3 className="font-semibold">Security</h3>
//                     <p className="text-sm text-muted-foreground mt-0.5">
//                         Change your password
//                     </p>
//                 </div>
//                 <Separator />

//                 <div className="space-y-4">
//                     <div className="space-y-1.5">
//                         <Label htmlFor="current-password">Current password</Label>
//                         <Input
//                             id="current-password"
//                             type="password"
//                             value={currentPassword}
//                             onChange={(e) => setCurrentPassword(e.target.value)}
//                             placeholder="Enter current password"
//                         />
//                     </div>

//                     <div className="space-y-1.5">
//                         <Label htmlFor="new-password">New password</Label>
//                         <Input
//                             id="new-password"
//                             type="password"
//                             value={newPassword}
//                             onChange={(e) => setNewPassword(e.target.value)}
//                             placeholder="Min. 8 characters, 1 uppercase, 1 number"
//                         />
//                     </div>

//                     <div className="space-y-1.5">
//                         <Label htmlFor="confirm-password">Confirm new password</Label>
//                         <Input
//                             id="confirm-password"
//                             type="password"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             placeholder="Repeat new password"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex justify-end">
//                     <Button
//                         onClick={handleChangePassword}
//                         disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
//                     >
//                         {savingPassword
//                             ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing...</>
//                             : "Change Password"
//                         }
//                     </Button>
//                 </div>
//             </Card>

//             {/* Preferences */}
//             <Card className="p-6 space-y-5">
//                 <div>
//                     <h3 className="font-semibold">Preferences</h3>
//                     <p className="text-sm text-muted-foreground mt-0.5">
//                         Customize your experience
//                     </p>
//                 </div>
//                 <Separator />

//                 <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium">Currency</p>
//                             <p className="text-xs text-muted-foreground">
//                                 Used across all amounts and figures
//                             </p>
//                         </div>
//                         <Select value={currency} onValueChange={(v) => setCurrency(v as "INR" | "USD")}>
//                             <SelectTrigger className="w-36">
//                                 <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="INR">INR — ₹</SelectItem>
//                                 <SelectItem value="USD">USD — $</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     <Separator />

//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium">Theme</p>
//                             <p className="text-xs text-muted-foreground">
//                                 Switch between light and dark mode
//                             </p>
//                         </div>
//                         <ThemeToggle />
//                     </div>
//                 </div>

//                 <div className="flex justify-end">
//                     <Button
//                         onClick={handleSaveProfile}
//                         disabled={savingProfile}
//                     >
//                         {savingProfile
//                             ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
//                             : "Save Preferences"
//                         }
//                     </Button>
//                 </div>
//             </Card>

//             {/* Danger Zone */}
//             <Card className="p-6 space-y-5 border-destructive/30">
//                 <div>
//                     <h3 className="font-semibold text-destructive">Danger Zone</h3>
//                     <p className="text-sm text-muted-foreground mt-0.5">
//                         Irreversible actions — proceed with caution
//                     </p>
//                 </div>
//                 <Separator />

//                 <div className="flex items-center justify-between">
//                     <div>
//                         <p className="text-sm font-medium">Delete account</p>
//                         <p className="text-xs text-muted-foreground">
//                             Permanently deactivate your account and all data
//                         </p>
//                     </div>
//                     <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => setDeleteOpen(true)}
//                     >
//                         Delete Account
//                     </Button>
//                 </div>
//             </Card>

//             {/* Delete confirmation dialog */}
//             <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
//                 <DialogContent className="sm:max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle>Delete Account</DialogTitle>
//                         <DialogDescription>
//                             This action cannot be undone.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <p className="text-sm text-muted-foreground py-2">
//                         Are you sure you want to delete your account? All your transactions,
//                         budgets, and data will be permanently deactivated.
//                     </p>
//                     <DialogFooter className="gap-2">
//                         <Button variant="outline" onClick={() => setDeleteOpen(false)}>
//                             Cancel
//                         </Button>
//                         <Button
//                             variant="destructive"
//                             onClick={handleDeleteAccount}
//                             disabled={deleting}
//                         >
//                             {deleting
//                                 ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
//                                 : "Delete Account"
//                             }
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     )
// }




// src/app/(dashboard)/settings/page.tsx
"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export default function SettingsPage() {
    const { user, setUser, logout } = useAuthStore()

    // Profile
    const [fullName, setFullName] = useState(user?.full_name ?? "")
    const [currency, setCurrency] = useState(user?.currency ?? "INR")
    const [savingProfile, setSavingProfile] = useState(false)
    // UPDATED: split from savingProfile so the Profile and Preferences cards'
    // save buttons no longer visually couple — clicking one no longer puts
    // the other into a loading/disabled state too.
    const [savingPreferences, setSavingPreferences] = useState(false)

    // Password
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [savingPassword, setSavingPassword] = useState(false)

    // UPDATED: show/hide toggles for each password field
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // Delete account dialog
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleSaveProfile = async () => {
        if (!fullName.trim()) return
        setSavingProfile(true)
        try {
            const updated = await api.patch<any>("/users/me", {
                full_name: fullName.trim(),
                currency,
            })
            setUser({ ...user!, full_name: updated.full_name, currency: updated.currency })
            toast.success("Profile updated successfully")
        } catch {
            toast.error("Failed to update profile")
        } finally {
            setSavingProfile(false)
        }
    }

    // UPDATED: separate handler (was previously reusing handleSaveProfile
    // directly) so the Preferences card's loading state is independent from
    // the Profile card's. Sends the same payload — currency lives on the same
    // user record as full_name — but now has its own spinner/disabled state.
    const handleSavePreferences = async () => {
        setSavingPreferences(true)
        try {
            const updated = await api.patch<any>("/users/me", {
                full_name: fullName.trim(),
                currency,
            })
            setUser({ ...user!, full_name: updated.full_name, currency: updated.currency })
            toast.success("Preferences updated successfully")
        } catch {
            toast.error("Failed to update preferences")
        } finally {
            setSavingPreferences(false)
        }
    }

    // UPDATED: was `newPassword.length < 8` only. The placeholder text has
    // always promised "1 uppercase, 1 number" too, but that was never
    // actually checked — so this now matches what the UI already claims,
    // giving a specific error instead of surfacing a generic backend one.
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) return
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }
        if (!/[A-Z]/.test(newPassword)) {
            toast.error("Password must contain at least 1 uppercase letter")
            return
        }
        if (!/[0-9]/.test(newPassword)) {
            toast.error("Password must contain at least 1 number")
            return
        }
        setSavingPassword(true)
        try {
            await api.post("/users/me/change-password", {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            toast.success("Password changed successfully")
        } catch (error: any) {
            toast.error(error?.message || "Failed to change password")
        } finally {
            setSavingPassword(false)
        }
    }

    const handleDeleteAccount = async () => {
        setDeleting(true)
        try {
            await api.delete("/users/me")
            logout()
        } catch {
            toast.error("Failed to delete account")
            setDeleting(false)
        }
    }

    // UPDATED: drives the live "passwords match" indicator under Confirm Password
    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword
    const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

    return (
        <div className="space-y-6 page-enter max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your profile, security, and preferences
                </p>
            </div>

            {/* Profile */}
            <Card className="p-6 space-y-5">
                <div>
                    <h3 className="font-semibold">Profile</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Update your display name and account details
                    </p>
                </div>
                <Separator />

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="full-name">Full name</Label>
                        <Input
                            id="full-name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input
                            value={user?.email ?? ""}
                            disabled
                            className="bg-muted text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Username</Label>
                        <Input
                            value={user?.username ?? ""}
                            disabled
                            className="bg-muted text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveProfile}
                        disabled={savingProfile || !fullName.trim()}
                    >
                        {savingProfile
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                            : "Save Profile"
                        }
                    </Button>
                </div>
            </Card>

            {/* Security */}
            <Card className="p-6 space-y-5">
                <div>
                    <h3 className="font-semibold">Security</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Change your password
                    </p>
                </div>
                <Separator />

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="current-password">Current password</Label>
                        {/* UPDATED: wrapped in a relative container + added show/hide toggle */}
                        <div className="relative">
                            <Input
                                id="current-password"
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="pr-9"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent((v) => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showCurrent ? "Hide password" : "Show password"}
                            >
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="new-password">New password</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters, 1 uppercase, 1 number"
                                className="pr-9"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showNew ? "Hide password" : "Show password"}
                            >
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="confirm-password">Confirm new password</Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="pr-9"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {/* UPDATED: live match indicator, uses the same income/expense
                            tokens as the rest of the app rather than introducing new colors */}
                        {passwordsMatch && (
                            <p className="text-xs text-income flex items-center gap-1">
                                <Check className="h-3 w-3" /> Passwords match
                            </p>
                        )}
                        {passwordsMismatch && (
                            <p className="text-xs text-expense flex items-center gap-1">
                                <X className="h-3 w-3" /> Passwords don&apos;t match
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleChangePassword}
                        disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                        {savingPassword
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing...</>
                            : "Change Password"
                        }
                    </Button>
                </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 space-y-5">
                <div>
                    <h3 className="font-semibold">Preferences</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Customize your experience
                    </p>
                </div>
                <Separator />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            {/* UPDATED: linked to the Select via htmlFor/id for accessibility,
                                was a plain unlinked <p> before */}
                            <Label htmlFor="currency-select" className="text-sm font-medium">Currency</Label>
                            <p className="text-xs text-muted-foreground">
                                Used across all amounts and figures
                            </p>
                        </div>
                        <Select value={currency} onValueChange={(v) => setCurrency(v as "INR" | "USD")}>
                            <SelectTrigger id="currency-select" className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INR">INR — ₹</SelectItem>
                                <SelectItem value="USD">USD — $</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Theme</p>
                            <p className="text-xs text-muted-foreground">
                                Switch between light and dark mode
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                <div className="flex justify-end">
                    {/* UPDATED: now calls its own handler with its own loading state,
                        see handleSavePreferences / savingPreferences above */}
                    <Button
                        onClick={handleSavePreferences}
                        disabled={savingPreferences}
                    >
                        {savingPreferences
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                            : "Save Preferences"
                        }
                    </Button>
                </div>
            </Card>

            {/* Danger Zone */}
            {/* UPDATED: added bg-destructive/5 alongside the existing border for
                stronger visual separation from the rest of the page */}
            <Card className="p-6 space-y-5 border-destructive/30 bg-destructive/5">
                <div>
                    <h3 className="font-semibold text-destructive">Logout</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Irreversible actions — proceed with caution
                    </p>
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Delete account</p>
                        <p className="text-xs text-muted-foreground">
                            Permanently deactivate your account and all data
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteOpen(true)}
                    >
                        Delete Account
                    </Button>
                </div>
            </Card>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground py-2">
                        Are you sure you want to delete your account? All your transactions,
                        budgets, and data will be permanently deactivated.
                    </p>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                        >
                            {deleting
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                                : "Delete Account"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
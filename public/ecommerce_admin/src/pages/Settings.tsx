import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Store, User, Lock, Bell, Mail, Globe, Home, Link2, Copy, Check } from 'lucide-react';

export default function Settings() {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    name: 'Sholok E-Commerce',
    email: 'contact@sholok.com',
    phone: '',
    address: 'Dhaka, Bangladesh',
    currency: '৳',
    taxRate: 5,
    shippingCharge: 50,
    homePageHandle: 'sholok',
  });

  const handleCopyHandle = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://sholok.com/${storeSettings.homePageHandle}`
      );
      setCopied(true);
      toast.success('Home page link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: '',
  });

  // Password Settings
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    paymentNotifications: true,
    lowStockNotifications: true,
    customerNotifications: false,
  });

  const handleSaveStoreSettings = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Store settings updated successfully');
    } catch (error) {
      toast.error('Failed to update store settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordSettings.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordSettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store and account settings</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="store">
            <Store className="w-4 h-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Update your store details and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input
                    id="store-name"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input
                    id="store-email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Phone</Label>
                  <Input
                    id="store-phone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">Address</Label>
                  <Input
                    id="store-address"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-charge">Shipping Charge (৳)</Label>
                  <Input
                    id="shipping-charge"
                    type="number"
                    value={storeSettings.shippingCharge}
                    onChange={(e) => setStoreSettings({ ...storeSettings, shippingCharge: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveStoreSettings} disabled={loading}>
                Save Store Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={profileSettings.name}
                  onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone Number</Label>
                <Input
                  id="profile-phone"
                  value={profileSettings.phone}
                  onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{admin?.name}</p>
                  <p className="text-sm text-muted-foreground">{admin?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role: <span className="capitalize">{admin?.role}</span>
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordSettings.currentPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordSettings.newPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordSettings.confirmPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                />
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Password Requirements:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• At least 8 characters long</li>
                  <li>• Mix of letters and numbers recommended</li>
                  <li>• Special characters for extra security</li>
                </ul>
              </div>

              <Button onClick={handleChangePassword} disabled={loading}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about important events
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new orders are placed
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.orderNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, orderNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts for successful and failed payments
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.paymentNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, paymentNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts when products are running low on stock
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.lowStockNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, lowStockNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Customer Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates about new customer registrations
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.customerNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, customerNotifications: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

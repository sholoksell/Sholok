import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
        <h1 className="text-3xl font-bold text-foreground">{t('settings')}</h1>
        <p className="text-muted-foreground">{t('manageStoreSettings')}</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="store">
            <Store className="w-4 h-4 mr-2" />
            {t('storeLbl')}
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            {t('profileLbl')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            {t('securityLbl')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t('notificationsLbl')}
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>{t('storeInformation')}</CardTitle>
              <CardDescription>
                {t('updateStoreDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">{t('storeName')}</Label>
                  <Input
                    id="store-name"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">{t('email')}</Label>
                  <Input
                    id="store-email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone">{t('phoneNumber')}</Label>
                  <Input
                    id="store-phone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">{t('address')}</Label>
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
                  <Label htmlFor="currency">{t('currency')}</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">{t('taxRate')}</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-charge">{t('shippingChargeLbl')}</Label>
                  <Input
                    id="shipping-charge"
                    type="number"
                    value={storeSettings.shippingCharge}
                    onChange={(e) => setStoreSettings({ ...storeSettings, shippingCharge: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveStoreSettings} disabled={loading}>
                {t('saveStoreSettings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>{t('profileInfo')}</CardTitle>
              <CardDescription>
                {t('updatePersonalDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">{t('fullName')}</Label>
                <Input
                  id="profile-name"
                  value={profileSettings.name}
                  onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">{t('email')}</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">{t('phoneNumber')}</Label>
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
                {t('updateProfile')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>{t('changePassword')}</CardTitle>
              <CardDescription>
                {t('updatePasswordSecurity')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t('currentPassword')}</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordSettings.currentPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('newPassword')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordSettings.newPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('confirmNewPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordSettings.confirmPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                />
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">{t('passwordRequirements')}</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• {t('atLeast8Chars')}</li>
                  <li>• {t('mixLettersNumbers')}</li>
                  <li>• {t('specialChars')}</li>
                </ul>
              </div>

              <Button onClick={handleChangePassword} disabled={loading}>
                {t('changePassword')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="glass-card border-border">
            <CardHeader>
              <CardTitle>{t('notificationPreferences')}</CardTitle>
              <CardDescription>
                {t('manageNotificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('emailNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('receiveEmailUpdates')}
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
                  <Label>{t('orderNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('getNotifiedNewOrders')}
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
                  <Label>{t('paymentNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('paymentAlertsSuccess')}
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
                  <Label>{t('lowStockNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('lowStockAlerts')}
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
                  <Label>{t('customerNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('newCustomerRegistrations')}
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
                {t('savePreferences')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/portal/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Wallet, Send, Download, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

const PayPage = () => {
  const { t } = useLanguage();
  const [balance] = useState(5847.50);

  const transactions: Transaction[] = [
    { id: '1', type: 'received', amount: 150.00, description: 'Payment from John Doe', date: '2026-02-04', status: 'completed' },
    { id: '2', type: 'sent', amount: 89.99, description: 'Shopping - Wireless Headphones', date: '2026-02-03', status: 'completed' },
    { id: '3', type: 'received', amount: 500.00, description: 'Salary Credit', date: '2026-02-01', status: 'completed' },
    { id: '4', type: 'sent', amount: 29.99, description: 'Subscription - Music Service', date: '2026-01-30', status: 'completed' },
    { id: '5', type: 'sent', amount: 199.99, description: 'Shopping - Smart Watch', date: '2026-01-28', status: 'completed' },
    { id: '6', type: 'received', amount: 75.50, description: 'Refund - Order #12340', date: '2026-01-27', status: 'completed' },
  ];

  const stats = [
    { label: 'Total Received', value: `$${transactions.filter(t => t.type === 'received').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Sent', value: `$${transactions.filter(t => t.type === 'sent').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`, icon: Send, color: 'text-red-500' },
    { label: t('transactions'), value: transactions.length.toString(), icon: CreditCard, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('pay')} - {t('wallet')}</h1>
          <p className="text-muted-foreground">
            Manage your payments, transactions, and wallet balance
          </p>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-primary-foreground/70 mb-2">
                  {t('balance')}
                </CardDescription>
                <CardTitle className="text-4xl font-bold">
                  ${balance.toFixed(2)}
                </CardTitle>
              </div>
              <Wallet className="h-12 w-12 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    {t('send')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Money</DialogTitle>
                    <DialogDescription>
                      Transfer money to another user
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input id="recipient" placeholder="Enter email or phone" />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="note">Note (Optional)</Label>
                      <Input id="note" placeholder="What's this for?" />
                    </div>
                    <Button className="w-full">Send Money</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    {t('receive')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Receive Money</DialogTitle>
                    <DialogDescription>
                      Share your payment details
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-8 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-48 h-48 bg-white rounded-lg mb-4 flex items-center justify-center">
                          <p className="text-muted-foreground">QR Code</p>
                        </div>
                        <p className="font-medium">Your Pay ID: user@portal.com</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Copy Pay ID
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Transactions */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="sent">{t('sent')}</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('paymentHistory')}</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'received' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {transaction.type === 'received' ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'received' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'received' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'secondary' : 'outline'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('sent')} {t('transactions')}</CardTitle>
                <CardDescription>Money you've sent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.filter(t => t.type === 'sent').map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10">
                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <p className="font-bold text-red-500">
                        -${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Received {t('transactions')}</CardTitle>
                <CardDescription>Money you've received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.filter(t => t.type === 'received').map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10">
                          <ArrowDownLeft className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-500">
                        +${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PayPage;

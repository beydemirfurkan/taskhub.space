"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserPlus, 
  Mail, 
  Copy, 
  Check, 
  X, 
  Crown, 
  User,
  Link as LinkIcon,
  Send
} from 'lucide-react';

interface InviteUsersProps {
  workspaceId: string;
  workspaceName: string;
  trigger?: React.ReactNode;
}

interface PendingInvite {
  email: string;
  role: 'ADMIN' | 'MEMBER';
  id: string;
}

export function InviteUsers({ workspaceId, workspaceName, trigger }: InviteUsersProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate invite link (placeholder - you'd implement this based on your auth system)
  const generateInviteLink = async () => {
    // This would typically create a temporary invite token
    const link = `${window.location.origin}/invite/${workspaceId}?token=example-token`;
    setInviteLink(link);
  };

  const copyInviteLink = async () => {
    if (!inviteLink) {
      await generateInviteLink();
      return;
    }
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  const addEmailInvite = () => {
    if (!email.trim()) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (pendingInvites.some(invite => invite.email === email)) {
      alert('This email is already in the invite list');
      return;
    }

    const newInvite: PendingInvite = {
      id: Date.now().toString(),
      email: email.trim(),
      role
    };

    setPendingInvites(prev => [...prev, newInvite]);
    setEmail('');
  };

  const removeInvite = (id: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== id));
  };

  const sendInvites = async () => {
    if (pendingInvites.length === 0) return;

    setLoading(true);
    try {
      // This would typically call your API to send email invitations
      const responses = await Promise.all(
        pendingInvites.map(invite =>
          fetch('/api/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspace_id: workspaceId,
              email: invite.email,
              role: invite.role
            })
          })
        )
      );

      const successful = responses.filter(r => r.ok).length;
      alert(`${successful} invites sent successfully!`);
      
      if (successful === pendingInvites.length) {
        setPendingInvites([]);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error sending invites:', error);
      alert('An error occurred while sending invites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Users
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Users
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Invite users to <strong>{workspaceName}</strong> workspace
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Link Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Invite Link
            </h3>
            <div className="flex items-center gap-2">
              <Input
                value={inviteLink || 'Click copy button to generate invite link'}
                readOnly
                className="flex-1 text-xs"
              />
              <Button size="sm" onClick={copyInviteLink} disabled={loading}>
                {copySuccess ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Share this link to directly invite users to the workspace
            </p>
          </div>

          {/* Email Invite Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Invitation
            </h3>
            
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEmailInvite()}
                className="flex-1"
              />
              
              <div className="flex items-center border border-gray-200 rounded-md">
                <button
                  className={`px-3 py-1.5 text-xs rounded-l-md transition-colors ${
                    role === 'MEMBER' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setRole('MEMBER')}
                >
                  <User className="w-3 h-3 mr-1 inline" />
                  Member
                </button>
                <button
                  className={`px-3 py-1.5 text-xs rounded-r-md transition-colors ${
                    role === 'ADMIN' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setRole('ADMIN')}
                >
                  <Crown className="w-3 h-3 mr-1 inline" />
                  Admin
                </button>
              </div>
              
              <Button size="sm" onClick={addEmailInvite} disabled={!email.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">
                Pending Invites ({pendingInvites.length})
              </h3>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gray-200">
                          {invite.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{invite.email}</div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          invite.role === 'ADMIN' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {invite.role === 'ADMIN' ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Member
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeInvite(invite.id)}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {pendingInvites.length > 0 && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setPendingInvites([])}>
                Clear
              </Button>
              <Button onClick={sendInvites} disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : `Send ${pendingInvites.length} Invites`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
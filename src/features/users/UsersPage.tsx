import { useState, type FormEvent } from 'react'
import { Plus, ShieldCheck, MoreHorizontal, Trash2, Mail } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Field } from '../../components/ui/Field'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { timeAgo } from '../../lib/utils'
import type { UserRole } from '../../lib/types'

const roleInfo: Record<UserRole, { description: string; color: 'brand' | 'violet' | 'emerald' | 'slate' }> = {
  Admin: { description: 'Full access, including users, settings, and content types.', color: 'brand' },
  Editor: { description: 'Can create, edit, and publish any content.', color: 'violet' },
  Author: { description: 'Can create and publish their own content.', color: 'emerald' },
  Contributor: { description: 'Can create drafts; requires review before publishing.', color: 'slate' },
}

export function UsersPage() {
  const { data, currentUser, inviteUser, updateUserRole, removeUser } = useData()
  const { showToast } = useToast()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('Author')
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    inviteUser({ name, email, role })
    setInviteOpen(false)
    showToast({ title: 'Invitation sent', description: `${name} will get an email to join as ${role}.`, variant: 'success' })
    setName('')
    setEmail('')
    setRole('Author')
  }

  const target = data.users.find((u) => u.id === confirmRemoveId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Users & Roles</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage who has access and what they can do.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
          Invite user
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(roleInfo) as [UserRole, (typeof roleInfo)[UserRole]][]).map(([roleName, info]) => (
          <div key={roleName} className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <Badge color={info.color} icon={<ShieldCheck className="h-3 w-3" aria-hidden="true" />}>
              {roleName}
            </Badge>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{info.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Team members</caption>
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-2 py-3 font-medium">Role</th>
                <th scope="col" className="px-2 py-3 font-medium">Status</th>
                <th scope="col" className="px-2 py-3 font-medium">Last active</th>
                <th scope="col" className="w-10 px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.users.map((user) => {
                const isSelf = user.id === currentUser.id
                return (
                  <tr key={user.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} gradient={user.avatarColor} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <Select
                        aria-label={`Role for ${user.name}`}
                        value={user.role}
                        onChange={(e) => {
                          updateUserRole(user.id, e.target.value as UserRole)
                          showToast({ title: 'Role updated', description: `${user.name} is now ${e.target.value}.`, variant: 'success' })
                        }}
                        className="w-36"
                      >
                        {Object.keys(roleInfo).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-2 py-3">
                      {user.status === 'active' ? (
                        <Badge color="emerald">Active</Badge>
                      ) : (
                        <Badge color="amber" icon={<Mail className="h-3 w-3" aria-hidden="true" />}>
                          Invited
                        </Badge>
                      )}
                    </td>
                    <td className="px-2 py-3 text-slate-500 dark:text-slate-400">{timeAgo(user.lastActive)}</td>
                    <td className="px-5 py-3 text-right">
                      <Dropdown
                        trigger={
                          <button
                            type="button"
                            aria-label={`Actions for ${user.name}`}
                            disabled={isSelf}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          </button>
                        }
                      >
                        <DropdownItem icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} destructive onClick={() => setConfirmRemoveId(user.id)}>
                          Remove access
                        </DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a user"
        description="They'll receive an email invitation to join Atlas CMS."
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="invite-form">
              Send invitation
            </Button>
          </>
        }
      >
        <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
          <Field label="Full name" htmlFor="invite-name" required>
            <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </Field>
          <Field label="Email address" htmlFor="invite-email" required>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Role" htmlFor="invite-role" helpText={roleInfo[role].description}>
            <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {Object.keys(roleInfo).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmRemoveId !== null}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={() => {
          if (confirmRemoveId) removeUser(confirmRemoveId)
          setConfirmRemoveId(null)
          showToast({ title: 'Access removed', variant: 'info' })
        }}
        title={`Remove ${target?.name ?? 'this user'}?`}
        description="They'll immediately lose access to Atlas CMS."
        confirmLabel="Remove access"
        destructive
      />
    </div>
  )
}

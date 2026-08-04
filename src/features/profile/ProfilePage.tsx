import { useData } from '../../context/DataContext'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Field } from '../../components/ui/Field'
import { Input } from '../../components/ui/Input'
import { formatDate } from '../../lib/utils'

export function ProfilePage() {
  const { currentUser } = useData()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Your profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          How you appear to your team across Atlas CMS.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} gradient={currentUser.avatarColor} size="lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{currentUser.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
            <Badge color="brand" className="mt-1.5">
              {currentUser.role}
            </Badge>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="profile-name">
            <Input id="profile-name" defaultValue={currentUser.name} />
          </Field>
          <Field label="Email" htmlFor="profile-email">
            <Input id="profile-email" type="email" defaultValue={currentUser.email} />
          </Field>
        </div>
        <p className="mt-4 text-xs text-slate-400">Member since {formatDate(currentUser.createdAt)}</p>
      </div>
    </div>
  )
}

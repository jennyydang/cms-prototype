import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Tabs } from '../../components/ui/Tabs'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Field } from '../../components/ui/Field'
import { Switch } from '../../components/ui/Switch'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'advanced', label: 'Advanced' },
]

export function SettingsPage() {
  const { data, updateSettings, resetDemoData } = useData()
  const { showToast } = useToast()
  const { settings } = data
  const [activeTab, setActiveTab] = useState('general')
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure how your site behaves. Changes save automatically.
        </p>
      </div>

      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <div role="tabpanel" id="panel-general" aria-labelledby="tab-general" className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
          <Field label="Site name" htmlFor="site-name">
            <Input id="site-name" value={settings.siteName} onChange={(e) => updateSettings({ siteName: e.target.value })} />
          </Field>
          <Field label="Site URL" htmlFor="site-url">
            <Input id="site-url" type="url" value={settings.siteUrl} onChange={(e) => updateSettings({ siteUrl: e.target.value })} />
          </Field>
          <Field label="Tagline" htmlFor="tagline">
            <Input id="tagline" value={settings.tagline} onChange={(e) => updateSettings({ tagline: e.target.value })} />
          </Field>
          <Field label="Description" htmlFor="description" helpText="Used in metadata and social sharing previews.">
            <Textarea id="description" rows={3} value={settings.description} onChange={(e) => updateSettings({ description: e.target.value })} />
          </Field>
          <Field label="Support email" htmlFor="support-email">
            <Input id="support-email" type="email" value={settings.supportEmail} onChange={(e) => updateSettings({ supportEmail: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Timezone" htmlFor="timezone">
              <Select id="timezone" value={settings.timezone} onChange={(e) => updateSettings({ timezone: e.target.value })}>
                <option value="America/Los_Angeles">Pacific Time (US)</option>
                <option value="America/Denver">Mountain Time (US)</option>
                <option value="America/Chicago">Central Time (US)</option>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">London</option>
              </Select>
            </Field>
            <Field label="Default locale" htmlFor="locale">
              <Select id="locale" value={settings.defaultLocale} onChange={(e) => updateSettings({ defaultLocale: e.target.value })}>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
              </Select>
            </Field>
          </div>
        </div>
      )}

      {activeTab === 'publishing' && (
        <div role="tabpanel" id="panel-publishing" aria-labelledby="tab-publishing" className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
          <Field label="Posts per page" htmlFor="posts-per-page" helpText="Used for paginated listings on the live site.">
            <Input
              id="posts-per-page"
              type="number"
              min={1}
              max={50}
              value={settings.postsPerPage}
              onChange={(e) => updateSettings({ postsPerPage: Number(e.target.value) || 1 })}
              className="w-28"
            />
          </Field>
          <Switch
            label="Require review before publish"
            description="Contributors and Authors must send content for review before it can go live."
            checked={settings.requireReviewBeforePublish}
            onChange={(checked) => updateSettings({ requireReviewBeforePublish: checked })}
          />
          <Switch
            label="Allow comments"
            description="Readers can comment on published blog posts."
            checked={settings.allowComments}
            onChange={(checked) => updateSettings({ allowComments: checked })}
          />
        </div>
      )}

      {activeTab === 'advanced' && (
        <div role="tabpanel" id="panel-advanced" aria-labelledby="tab-advanced" className="space-y-5">
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <Switch
              label="Maintenance mode"
              description="Show a maintenance page to visitors while you make changes."
              checked={settings.maintenanceMode}
              onChange={(checked) => {
                updateSettings({ maintenanceMode: checked })
                showToast({
                  title: checked ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
                  variant: checked ? 'info' : 'success',
                })
              }}
            />
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-500/30 dark:bg-red-500/5">
            <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">Danger zone</h2>
            <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
              Reset this prototype back to its original seed data. All content, media, and users you&rsquo;ve added
              will be lost.
            </p>
            <Button variant="danger" size="sm" className="mt-3" leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => setConfirmReset(true)}>
              Reset demo data
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData()
          setConfirmReset(false)
          showToast({ title: 'Demo data reset', variant: 'success' })
        }}
        title="Reset demo data?"
        description="This restores the original seed content and discards everything you've changed in this session."
        confirmLabel="Reset"
        destructive
      />
    </div>
  )
}

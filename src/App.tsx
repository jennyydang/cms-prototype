import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ContentListPage } from './features/content/ContentListPage'
import { ContentEditorPage } from './features/content/ContentEditorPage'
import { PageBuilderPage } from './features/pageBuilder/PageBuilderPage'
import { ContentTypesPage } from './features/contentTypes/ContentTypesPage'
import { MediaLibraryPage } from './features/media/MediaLibraryPage'
import { UsersPage } from './features/users/UsersPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { NotFoundPage } from './features/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/content/:typeSlug" element={<ContentListPage />} />
        <Route path="/content/:typeSlug/:id" element={<ContentEditorPage />} />
        <Route path="/content/:typeSlug/:id/builder" element={<PageBuilderPage />} />
        <Route path="/content-types" element={<ContentTypesPage />} />
        <Route path="/media" element={<MediaLibraryPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App

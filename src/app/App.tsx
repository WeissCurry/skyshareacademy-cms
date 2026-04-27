import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CmsPrivateRoute from "@app/providers/CmsPrivateRoute";
import CmsLoginRoute from "@app/providers/CmsLoginRoute";
import CmsLayout from "@app/layouts/CmsLayout";
import LoadingModal from "@shared/ui/LoadingModal";

// Lazy loaded components
const CmsLoginForm = lazy(() => import("@pages/login/CmsLoginForm"));
const CmsDashboardAkun = lazy(() => import("@pages/account-management/CmsDashboardAkun"));
const CmsAddAdminForm = lazy(() => import("@pages/account-management/CmsAddAdminForm"));
const CmsEditAdminForm = lazy(() => import("@pages/account-management/CmsEditAdminForm"));
const CmsTalentForm = lazy(() => import("@pages/talents-academy/CmsTalentForm"));
const CmsTalentEditSchoolForm = lazy(() => import("@pages/talents-academy/CmsTalentEditSchoolForm"));
const CmsTalentEditGroupForm = lazy(() => import("@pages/talents-academy/CmsTalentEditGroupForm"));
const CmsTalentAddSchoolForm = lazy(() => import("@pages/talents-academy/CmsTalentAddSchoolForm"));
const CmsTalentAddGroupForm = lazy(() => import("@pages/talents-academy/CmsTalentAddGroupForm"));
const CmsMentorForm = lazy(() => import("@pages/mentor-academy/CmsMentorForm"));
const CmsMentorAddEventForm = lazy(() => import("@pages/mentor-academy/CmsMentorAddEventForm"));
const CmsMentorEditEventForm = lazy(() => import("@pages/mentor-academy/CmsMentorEditEventForm"));
const CmsMentorAddParticipantForm = lazy(() => import("@pages/mentor-academy/CmsMentorAddParticipantForm"));
const CmsParentsForm = lazy(() => import("@pages/parents-academy/CmsParentsForm"));
const CmsArticleDashboardTable = lazy(() => import("@pages/article-management/CmsArticleDashboardTable"));
const CmsArticleEditForm = lazy(() => import("@pages/article-management/CmsArticleEditForm"));
const CmsArticleAddForm = lazy(() => import("@pages/article-management/CmsArticleAddForm"));
const CmsMedia = lazy(() => import("@pages/media-management/MediaPage"));

export default function App() {
  const cmsPrivateRoutes = [
    { path: "/cms/kelolaakun", element: <CmsDashboardAkun /> },
    { path: "/cms/add/admin", element: <CmsAddAdminForm /> },
    { path: "/cms/edit/admin/:id", element: <CmsEditAdminForm /> },
    { path: "/cms/talentacademy", element: <CmsTalentForm /> },
    { path: "/cms/mentoracademy", element: <CmsMentorForm /> },
    { path: "/cms/parentsacademy", element: <CmsParentsForm /> },
    { path: "/cms/article", element: <CmsArticleDashboardTable /> },
    { path: "/cms/article/edit/:id", element: <CmsArticleEditForm /> },
    { path: "/cms/article/add", element: <CmsArticleAddForm /> },
    { path: "/cms/talent/editschool/:id", element: <CmsTalentEditSchoolForm /> },
    { path: "/cms/talent/addschool", element: <CmsTalentAddSchoolForm /> },
    { path: "/cms/talent/editgroup/:id", element: <CmsTalentEditGroupForm /> },
    { path: "/cms/talent/addgroup", element: <CmsTalentAddGroupForm /> },
    { path: "/cms/mentor/addevent", element: <CmsMentorAddEventForm /> },
    { path: "/cms/mentor/editevent/:id", element: <CmsMentorEditEventForm /> },
    { path: "/cms/mentor/editevent/:id/participants/add", element: <CmsMentorAddParticipantForm /> },
    { path: "/cms/media", element: <CmsMedia /> },
  ];

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingModal isLoading={true} message="Loading Page..." />}>
        <Routes>
          <Route path="/" element={<Navigate to="/cms" replace />} />
          
          {/* CMS login route */}
          <Route path="/cms" element={<CmsLoginRoute />}>
            <Route path="/cms" element={<CmsLoginForm />} />
          </Route>
  
          {/* CMS private routes */}
          <Route element={<CmsPrivateRoute />}>
            <Route element={<CmsLayout />}>
              {cmsPrivateRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

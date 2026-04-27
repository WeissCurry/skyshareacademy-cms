import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CmsPrivateRoute from "@components/cms/CmsPrivateRoute";
import CmsLoginRoute from "@components/cms/CmsLoginRoute";
import CmsLayout from "./layouts/CmsLayout";
import LoadingModal from "@components/cms/LoadingModal";

// Lazy loaded components
const CmsLoginForm = lazy(() => import("@pages/CmsLoginForm"));
const CmsDashboardAkun = lazy(() => import("@pages/AccountManagement/CmsDashboardAkun"));
const CmsAddAdminForm = lazy(() => import("@pages/AccountManagement/CmsAddAdminForm"));
const CmsEditAdminForm = lazy(() => import("@pages/AccountManagement/CmsEditAdminForm"));
const CmsTalentForm = lazy(() => import("@pages/TalentsAcademy/CmsTalentForm"));
const CmsTalentEditSchoolForm = lazy(() => import("@pages/TalentsAcademy/CmsTalentEditSchoolForm"));
const CmsTalentEditGroupForm = lazy(() => import("@pages/TalentsAcademy/CmsTalentEditGroupForm"));
const CmsTalentAddSchoolForm = lazy(() => import("@pages/TalentsAcademy/CmsTalentAddSchoolForm"));
const CmsTalentAddGroupForm = lazy(() => import("@pages/TalentsAcademy/CmsTalentAddGroupForm"));
const CmsMentorForm = lazy(() => import("@pages/MentorAcademy/CmsMentorForm"));
const CmsMentorAddEventForm = lazy(() => import("@pages/MentorAcademy/CmsMentorAddEventForm"));
const CmsMentorEditEventForm = lazy(() => import("@pages/MentorAcademy/CmsMentorEditEventForm"));
const CmsMentorAddParticipantForm = lazy(() => import("@pages/MentorAcademy/CmsMentorAddParticipantForm"));
const CmsParentsForm = lazy(() => import("@pages/ParentsAcademy/CmsParentsForm"));
const CmsArticleDashboardTable = lazy(() => import("@pages/ArticlesManagement/CmsArticleDashboardTable"));
const CmsArticleEditForm = lazy(() => import("@pages/ArticlesManagement/CmsArticleEditForm"));
const CmsArticleAddForm = lazy(() => import("@pages/ArticlesManagement/CmsArticleAddForm"));
const CmsMedia = lazy(() => import("@pages/MediaManagement/Index"));

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

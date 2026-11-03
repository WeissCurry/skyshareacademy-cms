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
const CmsDashboard = lazy(() => import("@pages/dashboard/CmsDashboard"));
const CmsEventManagement = lazy(() => import("@pages/event-management/CmsEventManagement"));
const CmsEventAddForm = lazy(() => import("@pages/event-management/CmsEventAddForm"));
const CmsEventEditForm = lazy(() => import("@pages/event-management/CmsEventEditForm"));
const CmsPopupManagement = lazy(() => import("@pages/popup-management/CmsPopupManagement"));

// Mentor Access, KYC, Program Orders & Gated Content Pages
const CmsReviewQueuePage = lazy(() => import("@pages/mentor-access/CmsReviewQueuePage"));
const CmsProgramManagement = lazy(() => import("@pages/mentor-access/CmsProgramManagement"));
const CmsMaterialsManagement = lazy(() => import("@pages/mentor-access/CmsMaterialsManagement"));
const CmsAssignmentsManagement = lazy(() => import("@pages/mentor-access/CmsAssignmentsManagement"));
const CmsAssessmentsPage = lazy(() => import("@pages/mentor-access/CmsAssessmentsPage"));
const CmsAttendanceOtpPage = lazy(() => import("@pages/mentor-access/CmsAttendanceOtpPage"));
const CmsContributorsPage = lazy(() => import("@pages/mentor-access/CmsContributorsPage"));
const CmsArticleReviewQueuePage = lazy(() => import("@pages/mentor-access/CmsArticleReviewQueuePage"));
const CmsQrisSettingsPage = lazy(() => import("@pages/mentor-access/CmsQrisSettingsPage"));
const CmsAccessAuditLogsPage = lazy(() => import("@pages/mentor-access/CmsAccessAuditLogsPage"));

export default function App() {
  const cmsPrivateRoutes = [
    { path: "/cms/dashboard", element: <CmsDashboard /> },
    { path: "/cms/review-queue", element: <CmsReviewQueuePage /> },
    { path: "/cms/programs", element: <CmsProgramManagement /> },
    { path: "/cms/materials", element: <CmsMaterialsManagement /> },
    { path: "/cms/assignments", element: <CmsAssignmentsManagement /> },
    { path: "/cms/assessments", element: <CmsAssessmentsPage /> },
    { path: "/cms/attendance", element: <CmsAttendanceOtpPage /> },
    { path: "/cms/contributors", element: <CmsContributorsPage /> },
    { path: "/cms/article-reviews", element: <CmsArticleReviewQueuePage /> },
    { path: "/cms/settings/qris", element: <CmsQrisSettingsPage /> },
    { path: "/cms/audit-logs", element: <CmsAccessAuditLogsPage /> },
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
    { path: "/cms/events", element: <CmsEventManagement /> },
    { path: "/cms/events/add", element: <CmsEventAddForm /> },
    { path: "/cms/events/edit/:id", element: <CmsEventEditForm /> },
    { path: "/cms/popup", element: <CmsPopupManagement /> },
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

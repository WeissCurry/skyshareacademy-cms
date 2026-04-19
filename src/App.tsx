// import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CmsPrivateRoute from "@components/cms/CmsPrivateRoute";
import CmsLoginRoute from "@components/cms/CmsLoginRoute";
import CmsLayout from "./layouts/CmsLayout";

import CmsLoginForm from "@pages/CmsLoginForm";
import CmsDashboardAkun from "@pages/AccountManagement/CmsDashboardAkun";
import CmsAddAdminForm from "@pages/AccountManagement/CmsAddAdminForm";
import CmsEditAdminForm from "@pages/AccountManagement/CmsEditAdminForm";
import CmsTalentForm from "@pages/TalentsAcademy/CmsTalentForm";
import CmsTalentEditSchoolForm from "@pages/TalentsAcademy/CmsTalentEditSchoolForm";
import CmsTalentEditGroupForm from "@pages/TalentsAcademy/CmsTalentEditGroupForm";
import CmsTalentAddSchoolForm from "@pages/TalentsAcademy/CmsTalentAddSchoolForm";
import CmsTalentAddGroupForm from "@pages/TalentsAcademy/CmsTalentAddGroupForm";
import CmsMentorForm from "@pages/MentorAcademy/CmsMentorForm";
import CmsMentorAddEventForm from "@pages/MentorAcademy/CmsMentorAddEventForm";
import CmsMentorEditEventForm from "@pages/MentorAcademy/CmsMentorEditEventForm";
import CmsMentorAddParticipantForm from "@pages/MentorAcademy/CmsMentorAddParticipantForm";
import CmsParentsForm from "@pages/ParentsAcademy/CmsParentsForm";
import CmsArticleDashboardTable from "@pages/ArticlesManagement/CmsArticleDashboardTable";
import CmsArticleEditForm from "@pages/ArticlesManagement/CmsArticleEditForm";
import CmsArticleAddForm from "@pages/ArticlesManagement/CmsArticleAddForm";
import CmsMedia from "@pages/MediaManagement/Index";

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
    </BrowserRouter>
  );
}

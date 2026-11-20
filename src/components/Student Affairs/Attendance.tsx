import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Attendance() {
  useDocumentTitle("Workstudy Attendance");

  return (
    <>
      <h1 className="page-title">Workstudy Attendance</h1>
      <p className="page-desc">
        View all your attendance records here. Check the boxes near the
        timeslots to mark your attendance. If you have any questions, please
        contact your supervisor.
      </p>
    </>
  );
}

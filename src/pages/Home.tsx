import { Navigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { useUsers } from "@/hooks/useUsers";
import studentsIcon from "/Images/students-icon.svg";
import visitsIcon from "/Images/visits-icon.svg";
import staffIcon from "/Images/staff-icon.svg";
import averageIcon from "/Images/average-icon.svg";

export default function Home() {
  useDocumentTitle("Home");

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Students,
    Loading: StudentsLoading,
    Error: StudentsError,
  } = useStudents(Session?.user);

  const {
    Users,
    Loading: UsersLoading,
    Error: UsersError,
  } = useUsers(Session?.user);

  const loading = AuthLoading || StudentsLoading || UsersLoading;
  const error = AuthError || StudentsError || UsersError;

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        {AuthLoading ? "Checking Authentication" : "Loading Data"}
      </div>
    );
  }

  if (!Session) {
    return <Navigate to='/login' replace />;
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>{error}</div>
    );
  }

  const totalStudents = Students.length;

  const totalVisits =
    Students && Students.length > 0
      ? Students.reduce((sum, student) => sum + (student.nb_visits || 0), 0)
      : 0;

  const totalWorkstudy = Users.length;

  const averageVisits =
    totalStudents > 0 ? (totalVisits / totalStudents).toFixed(1) : "0";

  const mostActiveStudent =
    Students && Students.length > 0
      ? Students.reduce((max, student) =>
          (student.nb_visits || 0) > (max.nb_visits || 0) ? student : max,
        )
      : null;

  return (
    <>
      <div className='page-header'>
        <div className='page-breadcrumb'>
          LSC–CAS › <span>Home</span>
        </div>
        <h1 className='page-title'>Dashboard</h1>
        <p className='page-desc'>
          Overview of support center activity and staff statistics.
        </p>
      </div>

      <div className='dashboard-container'>
        <div className='stat-card'>
          <img src={studentsIcon} alt='Students' className='stat-icon' />
          <div className='stat-content'>
            <p className='stat-label'>Students Visited</p>
            <p className='stat-value'>{totalStudents}</p>
          </div>
        </div>

        <div className='stat-card'>
          <img src={visitsIcon} alt='Visits' className='stat-icon' />
          <div className='stat-content'>
            <p className='stat-label'>Total Visits</p>
            <p className='stat-value'>{totalVisits}</p>
          </div>
        </div>

        {Session.user.user_metadata.role === "admin" && (
          <div className='stat-card'>
            <img src={staffIcon} alt='Staff' className='stat-icon' />
            <div className='stat-content'>
              <p className='stat-label'>WorkStudy Staff</p>
              <p className='stat-value'>{totalWorkstudy}</p>
            </div>
          </div>
        )}

        <div className='stat-card'>
          <img src={averageIcon} alt='Average' className='stat-icon' />
          <div className='stat-content'>
            <p className='stat-label'>Avg. Visits per Student</p>
            <p className='stat-value'>{averageVisits}</p>
          </div>
        </div>
      </div>

      <div className='dashboard-section'>
        <h2 className='section-title'>Quick Stats</h2>

        <div className='stats-grid'>
          <div className='stat-item'>
            <span className='stat-item-label'>Most Active Student:</span>
            <span className='stat-item-value'>
              {mostActiveStudent?.studentName || "No Data"}
            </span>
          </div>

          <div className='stat-item'>
            <span className='stat-item-label'>Registration Date:</span>
            <span className='stat-item-value'>
              {mostActiveStudent?.added_at || "No Data"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
